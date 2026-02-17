import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# 1. Initialize extensions as "singletons"
# These are globally accessible so models and services can use them
load_dotenv()
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    """
    The App Factory: The central engine of your backend.
    Fulfills: 'Security', 'Change Resilience', and 'Infrastructure'.
    """
    app = Flask(__name__)

    # 2. Configuration (Environment-Driven)
    # Ensure your .env has DATABASE_URL=postgresql://user:password@localhost:5432/safeconfig
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT Configuration - Essential for Role-Based Access Control (RBAC)
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'safe-config-ai-secret-key-2026')

    # 3. Bind extensions to the current app instance
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Enable CORS: Critical for your Next.js frontend to talk to this Flask server
    CORS(app)

    # 4. Blueprint Registration (Deferred Imports)
    # We import inside the function to prevent circular dependency crashes
    from app.routes.flag_routes import flags_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.auth_routes import auth_bp
    
    # Registering blueprints with clean URL prefixes
    app.register_blueprint(flags_bp) # /api/flags
    app.register_blueprint(ai_bp)    # /api/ai
    app.register_blueprint(auth_bp)  # /api/auth

    return app