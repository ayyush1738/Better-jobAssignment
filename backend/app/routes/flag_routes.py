import time
import logging
from flask import Blueprint, request, g
from flask_jwt_extended import jwt_required, get_jwt
from app.services.flag_service import FlagService
from app.schemas import FlagCreateSchema, FlagToggleSchema
from app.utils.helpers import api_response, format_error
from pydantic import ValidationError

# Minimalist Backend Cache: Protective shield against Rapid-Fire requests
_cache = {
    "analytics": {"data": None, "expiry": 0},
    "logs": {"data": None, "expiry": 0}
}
CACHE_TTL = 5  # 5 seconds to ignore duplicate spam

# Senior Move: Contextual logging for infrastructure changes
logger = logging.getLogger(__name__)

flags_bp = Blueprint("flags", __name__, url_prefix="/api/flags")

@flags_bp.route("", methods=["GET"])
@jwt_required()
def list_flags():
    """Returns all feature flags with current statuses for all envs."""
    flags = FlagService.get_all_flags()
    return api_response(True, "Flags retrieved", [f.to_dict() for f in flags])

@flags_bp.route("", methods=["POST"])
@jwt_required()
def create_flag():
    """RBAC: Only Managers can define new flags."""
    claims = get_jwt()
    if claims.get("role") != "manager":
        logger.warning(f"Unauthorized creation attempt by: {claims.get('sub')}")
        return api_response(False, "Forbidden", format_error("Managerial privileges required"), 403)

    try:
        data = FlagCreateSchema(**request.get_json())
        new_flag = FlagService.create_new_flag(data)
        return api_response(True, "Feature defined successfully", new_flag.to_dict(), 201)
    except ValidationError as e:
        return api_response(False, "Schema Violation", format_error("Invalid input", e.errors()), 400)

# --- STAGE 1: AUDIT (DRY-RUN) ---

@flags_bp.route("/<int:flag_id>/audit", methods=["POST"])
@jwt_required()
def audit_flag(flag_id: int):
    """Stage 1: AI risk assessment. Returns the Groq report without changing state."""
    try:
        json_data = request.get_json()
        reason = json_data.get("reason", "Pre-flight audit")
        env_id = json_data.get("environment_id")

        if not env_id:
            return api_response(False, "Input Error", format_error("environment_id required"), 400)

        report, err = FlagService.audit_flag(flag_id, env_id, reason)
        if err: return api_response(False, "Audit Failed", format_error(err), 400)

        return api_response(True, "Audit completed", report, 200)
    except Exception as e:
        logger.exception(f"Audit failure for flag {flag_id}")
        return api_response(False, "System Error", format_error("Internal audit failure"), 500)

# --- STAGE 2: DEPLOY (TOGGLE) ---

@flags_bp.route("/<int:flag_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_flag(flag_id: int):
    """Stage 2: Executes the toggle. Enforces AI blocks unless Manager overrides."""
    try:
        # Inject role into global context for the Service Layer to see
        g.user_role = get_jwt().get("role", "developer")
        
        data = FlagToggleSchema(**request.get_json())
        result, error_data = FlagService.toggle_status(flag_id, data)
        
        if error_data:
            return api_response(False, "AI Guardrail Blocked Action", error_data, 403)
            
        return api_response(True, "State updated safely", result.to_dict(), 200)
    except Exception as e:
        logger.exception(f"Toggle failure for flag {flag_id}")
        return api_response(False, "System Error", format_error("Deployment failure"), 500)

# --- PUBLIC TELEMETRY & SDK ---

@flags_bp.route("/evaluate/<string:key>", methods=["GET"])
def track_traffic(key: str):
    """SDK Simulation: Logs a hit and returns state. No Auth required for pings."""
    from app.models import FeatureFlag, FlagStatus, Environment
    
    # 1. Capture the 'hit' for AI Blast Radius
    FlagService.track_evaluation(key)
    
    # 2. Return the state for the Client App (Production Default)
    flag = FeatureFlag.query.filter_by(key=key).first()
    if not flag: return api_response(False, "Flag Not Found", None, 404)
    
    prod = Environment.query.filter_by(name="Production").first()
    status = FlagStatus.query.filter_by(flag_id=flag.id, env_id=prod.id).first()
    
    return api_response(True, "Traffic captured", {"enabled": status.is_enabled}, 200)

# --- CACHED ANALYTICS & LOGS ---

@flags_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_traffic_analytics():
    """Aggregated traffic stats. Uses 5s Cache for performance."""
    now = time.time()
    if _cache["analytics"]["data"] and now < _cache["analytics"]["expiry"]:
        return api_response(True, "Analytics retrieved (cached)", _cache["analytics"]["data"], 200)

    stats = FlagService.get_traffic_stats()
    _cache["analytics"]["data"] = stats
    _cache["analytics"]["expiry"] = now + CACHE_TTL
    return api_response(True, "Analytics retrieved", stats, 200)

@flags_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_audit_trail():
    """System Ledger for live activity feed. Uses 5s Cache."""
    now = time.time()
    if _cache["logs"]["data"] and now < _cache["logs"]["expiry"]:
        return api_response(True, "Audit trail retrieved (cached)", _cache["logs"]["data"], 200)

    logs = FlagService.get_audit_history()
    log_dicts = [l.to_dict() for l in logs]
    _cache["logs"]["data"] = log_dicts
    _cache["logs"]["expiry"] = now + CACHE_TTL
    return api_response(True, "Audit trail retrieved", log_dicts, 200)