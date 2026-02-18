import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Initialize extensions at the module level
load_dotenv()
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configure Logging for Vercel
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # --- 1. Database Configuration ---
    # Railway Public URL often starts with postgres://; SQLAlchemy 2.0 requires postgresql://
    db_url = os.getenv('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    if not db_url:
        logger.error("PRODUCTION CRITICAL: DATABASE_URL is missing!")
    else:
        # Log a masked version to verify the variable is being read in Vercel
        logger.info(f"Database URI detected: {db_url[:15]}...{db_url[-5:]}")

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Essential for Serverless: Prevents crashes due to dropped connections
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,
        "pool_recycle": 280, # Set slightly below Railway's 300s timeout
    }

    # --- 2. Security Configuration ---
    jwt_key = os.getenv('JWT_SECRET_KEY')
    # Use the 64-character hex string we generated earlier
    if not jwt_key and os.getenv('FLASK_ENV') == 'production':
        raise ValueError("No JWT_SECRET_KEY set in environment variables!")
    app.config['JWT_SECRET_KEY'] = jwt_key or 'dev-key-only'

    # --- 3. CORS & Extensions ---
    allowed_origins = [
        os.getenv('ALLOWED_ORIGINS', '*'),
        "https://better-job-assignment-dfwp.vercel.app" 
    ]

    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    with app.app_context():
        # Deferred imports to prevent circular dependency crashes
        from app.routes.flag_routes import flags_bp
        from app.routes.ai_routes import ai_bp
        from app.routes.auth_routes import auth_bp
        
        app.register_blueprint(flags_bp, url_prefix='/api/flags')
        app.register_blueprint(ai_bp, url_prefix='/api/ai')
        app.register_blueprint(auth_bp, url_prefix='/api/auth')

        @app.route('/')
        def health_check():
            return {
                "status": "online", 
                "environment": os.getenv('FLASK_ENV', 'production'),
                "database_connected": db_url is not None
            }, 200

    return app