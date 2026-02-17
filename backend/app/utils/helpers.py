from flask import jsonify
from loguru import logger

def api_response(success: bool, message: str, data: any = None, status_code: int = 200):
    """
    Standardizes the API response format across the entire application.
    Fulfills: 'Interface Safety' and 'Correctness'.
    
    Structure:
    {
        "success": true/false,
        "message": "Human readable summary",
        "data": { ... } or None
    }
    """
    # Log the response summary for better server-side visibility
    if success:
        logger.info(f"API Success [{status_code}]: {message}")
    else:
        logger.warning(f"API Error [{status_code}]: {message}")

    response = {
        "success": success,
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def format_error(message: str, details: any = None):
    """
    Standardizes error payloads. 
    
    Designed to be passed into the 'data' slot of api_response.
    """
    return {
        "error": message,
        "details": details
    }

def parse_pydantic_errors(validation_error):
    """
    Senior Move: Transforms raw Pydantic errors into a clean, 
    frontend-friendly format for form validation highlighting.
    """
    return [
        {"field": str(err["loc"][-1]), "message": err["msg"]}
        for err in validation_error.errors()
    ]