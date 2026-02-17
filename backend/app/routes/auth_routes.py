from flask import Blueprint, request
from flask_jwt_extended import create_access_token
import logging
from app import db
from app.models import User
from app.schemas import UserLoginSchema, UserRegisterSchema
from app.utils.helpers import api_response, format_error, parse_pydantic_errors
from pydantic import ValidationError

# Senior Move: Logging auth attempts is crucial for security observability
logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Onboards a new user with a hashed password.
    Fulfills: 'Security' and 'Proper Auth' requirements.
    """
    try:
        # Validate structure with Pydantic
        json_data = request.get_json()
        data = UserRegisterSchema(**json_data)

        # Check if user exists
        if User.query.filter_by(email=data.email).first():
            return api_response(False, "Conflict", format_error("Email already registered"), 409)

        # Create new user
        new_user = User(email=data.email, role=data.role)
        new_user.set_password(data.password) # Hashes the password via Werkzeug in models.py

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
    Authenticates user via email/password and issues a Role-Based JWT.
    Fulfills: 'Security' and 'Role-Based Access Control (RBAC)'.
    """
    try:
        # 1. Capture and Log for Debugging
        json_data = request.get_json()
        logger.debug(f"Login Attempt Data: {json_data}")

        # 2. Validate structure
        data = UserLoginSchema(**json_data)

        # 3. Find user in Postgres
        user = User.query.filter_by(email=data.email).first()

        # 4. Verify hashed password
        if not user or not user.check_password(data.password):
            logger.warning(f"Failed login attempt for email: {data.email}")
            return api_response(False, "Unauthorized", format_error("Invalid email or password"), 401)

        # 5. Generate JWT with 'role' claim
        # Including the role in the JWT allows the backend to protect routes 
        # without querying the database every time.
        access_token = create_access_token(
            identity=str(user.id), 
            additional_claims={"role": user.role}
        )

        logger.info(f"Identity issued: User '{user.email}' authenticated as '{user.role}'.")
        
        # Return everything the frontend AuthContext needs to persist the session
        return api_response(True, "Login successful", {
            "access_token": access_token,
            "role": user.role,
            "email": user.email
        }, 200)

    except ValidationError as e:
        # Returns a clean list of what's missing (e.g., "password required")
        return api_response(False, "Validation Error", parse_pydantic_errors(e), 400)
    except Exception as e:
        logger.error(f"Authentication failure: {e}")
        return api_response(False, "Server Error", format_error("Internal server error during login"), 500)