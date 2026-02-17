import logging
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.services.ai_agent import AIAgent
from app.schemas import RiskAnalysisSchema
from app.utils.helpers import api_response, format_error
from pydantic import ValidationError

# Standardizing logs for the AI lifecycle
logger = logging.getLogger(__name__)

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/analyze-risk", methods=["POST"])
@jwt_required()
def analyze_deployment_risk():
    """
    Standalone endpoint for on-demand AI risk analysis.
    Useful for 'Preview' modes before a developer actually hits the toggle.
    """
    # 1. Check for JSON Content-Type
    if not request.is_json:
        return api_response(
            success=False, 
            message="Unsupported Media Type", 
            data=format_error("Request must be a JSON object"), 
            status_code=415
        )

    try:
        # 2. Structured Validation via Pydantic
        # This catches missing fields like 'description' or 'environment' immediately
        json_data = request.get_json()
        context = RiskAnalysisSchema(**json_data)
        
        # 3. Invoke the Gemini-powered AI Auditor
        assessment = AIAgent.get_risk_report(
            feature_name=context.feature_name,
            environment=context.environment,
            description=context.description
        )
        
        # 4. Standardized Success Response
        return api_response(
            success=True, 
            message="AI Risk Assessment Complete", 
            data=assessment, 
            status_code=200
        )

    except ValidationError as e:
        # Returns specific fields that failed validation (e.g., 'description too short')
        return api_response(
            success=False, 
            message="Incomplete context for AI analysis", 
            data=format_error("Schema Validation Error", e.errors()), 
            status_code=400
        )

    except Exception as e:
        logger.exception(f"AI Service Failure: {e}")
        
        # FAIL-SAFE: If Gemini is down, we don't crash the UI.
        # We return a 'Medium' risk warning so the user knows the Auditor is offline.
        fail_safe_data = {
            "risk_score": 5, 
            "advice": "AI Auditor temporarily offline. Proceed with manual verification.",
            "risk_level": "medium",
            "status": "warning"
        }
        return api_response(
            success=False, 
            message="Graceful Degradation Active", 
            data=fail_safe_data, 
            status_code=200 # We return 200 so the UI can still display the warning nicely
        )