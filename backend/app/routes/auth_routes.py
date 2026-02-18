import logging
from flask import Blueprint, request, g
from flask_jwt_extended import create_access_token, get_jwt
from pydantic import ValidationError
from app import db, jwt
from app.models import User
from app.schemas import UserLoginSchema, UserRegisterSchema
from app.utils.helpers import api_response, format_error, parse_pydantic_errors

# Senior Move: Logging auth attempts is crucial for security observability
logger = logging.getLogger(__name__)

# Note: Removed url_prefix here because it's managed in the App Factory (create_app)
auth_bp = Blueprint("auth", __name__)

# --- BRIDGE: The "Missing Link" for RBAC ---

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """
    Automatically populates Flask's 'g' context with the user's role on every 
    authenticated request. This allows FlagService to verify permissions.
    """
    identity = jwt_data["sub"]
    role = jwt_data.get("role", "developer")
    
    # Store in Flask global context for the lifecycle of the request
    g.user_id = identity
    g.user_role = role
    
    # Returns the user object from Postgres
    return User.query.filter_by(id=identity).first()

# --- ROUTES ---

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Onboards a new user with a hashed password.
    """
    try:
        if not request.is_json:
            return api_response(False, "Bad Request", format_error("JSON required"), 400)

        json_data = request.get_json()
        data = UserRegisterSchema(**json_data)

        # Check if user exists
        if User.query.filter_by(email=data.email).first():
            return api_response(False, "Conflict", format_error("Email already registered"), 409)

        # Create new user
        new_user = User(email=data.email, role=data.role)
        new_user.set_password(data.password) 

        db.session.add(new_user)
        db.session.commit()

        logger.info(f"New user registered: {data.email} as {data.role}")
        return api_response(True, "Registration successful", {"email": data.email}, 201)

    except ValidationError as e:
        return api_response(False, "Validation Error", parse_pydantic_errors(e), 400)
    except Exception as e:
        logger.error(f"Registration failure: {e}")
        return api_response(False, "Server Error", format_error("Internal error during registration"), 500)

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates user and issues a Role-Based JWT for RBAC.
    """
    try:
        if not request.is_json:
            return api_response(False, "Bad Request", format_error("JSON required"), 400)

        json_data = request.get_json()
        data = UserLoginSchema(**json_data)

        # Find user in Postgres
        user = User.query.filter_by(email=data.email).first()

        # Verify hashed password
        if not user or not user.check_password(data.password):
            logger.warning(f"Failed login attempt for email: {data.email}")
            return api_response(False, "Unauthorized", format_error("Invalid email or password"), 401)

        # Generate JWT with 'role' claim
        # identity must be a string for Flask-JWT-Extended compatibility
        access_token = create_access_token(
            identity=str(user.id), 
            additional_claims={"role": user.role}
        )

        logger.info(f"Identity issued: User '{user.email}' authenticated as '{user.role}'.")
        
        return api_response(True, "Login successful", {
            "access_token": access_token,
            "role": user.role,
            "email": user.email
        }, 200)

    except ValidationError as e:
        return api_response(False, "Validation Error", parse_pydantic_errors(e), 400)
    except Exception as e:
        logger.error(f"Authentication failure: {e}")
        return api_response(False, "Server Error", format_error("Internal server error during login"), 500)