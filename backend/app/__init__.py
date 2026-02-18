import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # --- 1. Robust Database URI Handling ---
    db_url = os.getenv('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Connection pooling for production stability
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_pre_ping": True,  # Checks if connection is alive before using it
        "pool_recycle": 300,    # Prevents "stale" connections
    }

    # --- 2. Strict Security for JWT ---
    jwt_key = os.getenv('JWT_SECRET_KEY')
    if not jwt_key and not app.debug:
        # Stop the server if secret is missing in production
        raise ValueError("No JWT_SECRET_KEY set in environment variables!")
    app.config['JWT_SECRET_KEY'] = jwt_key or 'dev-key-only'

    # --- 3. Better CORS Setup ---
    # In prod, replace "*" with your actual frontend domain
    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*') 
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    with app.app_context():
        from app.routes.flag_routes import flags_bp
        from app.routes.ai_routes import ai_bp
        from app.routes.auth_routes import auth_bp
        
        # Explicit prefixes prevent route collisions
        app.register_blueprint(flags_bp, url_prefix='/api/flags')
        app.register_blueprint(ai_bp, url_prefix='/api/ai')
        app.register_blueprint(auth_bp, url_prefix='/api/auth')

        @app.route('/')
        def health_check():
            return {"status": "online", "environment": os.getenv('FLASK_ENV', 'production')}, 200

    return app