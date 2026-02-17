import logging
from datetime import datetime, timedelta
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app import db
# Corrected: Importing FeatureFlag to match models.py
from app.models import FeatureFlag, FlagEvaluation
from app.services.ai_agent import AIAgent
from app.utils.helpers import api_response, format_error

# Standardizing logs for the AI lifecycle
logger = logging.getLogger(__name__)

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/analyze-risk", methods=["POST"])
@jwt_required()
def analyze_deployment_risk():
    """
    Standalone endpoint for on-demand AI risk analysis.
    Calculates BLAST RADIUS by checking traffic hits in the last 24 hours.
    """
    if not request.is_json:
        return api_response(
            success=False, 
            message="Unsupported Media Type", 
            data=format_error("Request must be a JSON object"), 
            status_code=415
        )

    try:
        json_data = request.get_json()
        feature_key = json_data.get("feature_key")
        environment = json_data.get("environment", "Production")
        description = json_data.get("description", "No description provided.")

        # 1. FETCH TRAFFIC TELEMETRY (THE BLAST RADIUS)
        # We look up the flag by its unique key using FeatureFlag
        flag = FeatureFlag.query.filter_by(key=feature_key).first()
        traffic_count = 0
        
        if flag:
            # Count evaluation hits in the last 24 hours
            one_day_ago = datetime.utcnow() - timedelta(hours=24)
            traffic_count = FlagEvaluation.query.filter(
                FlagEvaluation.flag_id == flag.id,
                FlagEvaluation.timestamp >= one_day_ago
            ).count()

        # 2. INVOKE THE GROQ-POWERED AUDITOR WITH TRAFFIC CONTEXT
        # The AI now knows if 0 people or 10,000 people are using this feature.
        assessment = AIAgent.get_risk_report(
            feature_name=flag.name if flag else feature_key,
            environment=environment,
            description=description,
            traffic_count=traffic_count
        )
        
        # 3. APPEND TELEMETRY DATA TO RESPONSE
        assessment["blast_radius_hits"] = traffic_count

        return api_response(
            success=True, 
            message="Traffic-Aware AI Audit Complete", 
            data=assessment, 
            status_code=200
        )

    except Exception as e:
        logger.exception(f"AI Service Failure: {e}")
        
        # FAIL-SAFE: Graceful degradation if Groq or DB lookup fails
        fail_safe_data = {
            "risk_score": 5, 
            "advice": "AI Auditor temporarily offline. Proceed with manual verification.",
            "risk_level": "medium",
            "status": "warning",
            "blast_radius_hits": 0
        }
        return api_response(
            success=True, 
            message="Graceful Degradation Active", 
            data=fail_safe_data, 
            status_code=200 
        )