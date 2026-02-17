import logging
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt
from app.services.flag_service import FlagService
from app.schemas import FlagCreateSchema, FlagToggleSchema
from app.utils.helpers import api_response, format_error
from pydantic import ValidationError

# Senior Move: Contextual logging for infrastructure changes
logger = logging.getLogger(__name__)

flags_bp = Blueprint("flags", __name__, url_prefix="/api/flags")

@flags_bp.route("", methods=["GET"])
@jwt_required()
def list_flags():
    """
    Returns all feature flags with their current statuses.
    Accessible by: Managers and Developers.
    """
    flags = FlagService.get_all_flags()
    return api_response(True, "Flags retrieved", [f.to_dict() for f in flags])

@flags_bp.route("", methods=["POST"])
@jwt_required()
def create_flag():
    """
    Creates a new feature flag definition.
    Fulfills RBAC: Manager ONLY.
    """
    claims = get_jwt()
    if claims.get("role") != "manager":
        logger.warning(f"Unauthorized flag creation attempt by: {claims.get('sub')}")
        return api_response(False, "Forbidden", format_error("Only Managers can define new flags"), 403)

    try:
        json_data = request.get_json()
        data = FlagCreateSchema(**json_data)
        
        new_flag = FlagService.create_new_flag(data)
        return api_response(True, "Feature defined successfully", new_flag.to_dict(), 201)

    except ValidationError as e:
        return api_response(False, "Validation Error", format_error("Invalid schema", e.errors()), 400)
    except Exception as e:
        logger.error(f"Failed to create flag: {e}")
        return api_response(False, "Server Error", format_error("Internal persistence failure"), 500)

@flags_bp.route("/<int:flag_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_flag(flag_id: int):
    """
    Toggles a flag state with AI Risk Auditing.
    Fulfills: 'AI Integration' and 'Safety Culture'.
    """
    try:
        json_data = request.get_json()
        data = FlagToggleSchema(**json_data)
        
        # The service layer invokes the AIAgent for risk analysis
        result, error_data = FlagService.toggle_status(flag_id, data)
        
        if error_data:
            # error_data contains AI risk report if blocked
            return api_response(False, "Action Blocked", error_data, 403)
            
        return api_response(True, "State updated safely", result.to_dict(), 200)
        
    except ValidationError as e:
        return api_response(False, "Input Error", format_error("Missing toggle context", e.errors()), 400)
    except Exception as e:
        logger.exception(f"Unexpected error during toggle for flag {flag_id}")
        return api_response(False, "System Error", format_error("Internal logic failure"), 500)

@flags_bp.route("/evaluate/<string:key>", methods=["GET"])
def track_traffic(key: str):
    """
    Simulates a 'hit' from the frontend website.
    Fulfills: 'Tracking Traffic'.
    """
    success = FlagService.track_evaluation(key)
    if not success:
        return api_response(False, "Not Found", format_error("Invalid flag key"), 404)
        
    return api_response(True, "Traffic observed", None, 200)

@flags_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_traffic_analytics():
    """
    Aggregated traffic data for Dashboard charts.
    Fulfills: 'Traffic Observation'.
    """
    stats = FlagService.get_traffic_stats()
    return api_response(True, "Analytics retrieved", stats, 200)

@flags_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_audit_trail():
    """
    Retrieves the system activity ledger.
    Fulfills: 'Observability'.
    """
    logs = FlagService.get_audit_history()
    return api_response(True, "Audit trail retrieved", [l.to_dict() for l in logs])