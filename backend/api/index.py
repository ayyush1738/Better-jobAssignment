import os
from app import create_app, db
from app.models import Environment, User
from loguru import logger

# Initialize the Flask application using your Factory
app = create_app()

def seed_database_internal():
    """
    Internal helper to seed the database on Vercel since 
    we can't rely on the 'run.py' startup script.
    """
    try:
        # 1. Seed Environments
        if not Environment.query.first():
            logger.info("Vercel Boot: Initializing default environments...")
            envs = [
                Environment(name="Development"),
                Environment(name="Staging"),
                Environment(name="Production")
            ]
            db.session.add_all(envs)
            db.session.commit()

        # 2. Seed Test Accounts
        if not User.query.first():
            logger.info("Vercel Boot: Creating default test accounts...")
            manager = User(email="manager@safeconfig.ai", role="manager")
            manager.set_password("password123")
            
            developer = User(email="dev@safeconfig.ai", role="developer")
            developer.set_password("password123")
            
            db.session.add_all([manager, developer])
            db.session.commit()
            logger.success("Vercel Boot: Demo accounts created.")
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Vercel Seeding failed: {e}")

# This route allows you to initialize your DB remotely via your browser
@app.route('/api/setup-db')
def setup_db():
    """
    Visit your-url.vercel.app/api/setup-db once after deployment 
    to create tables and seed data.
    """
    try:
        with app.app_context():
            db.create_all()
            seed_database_internal()
        return {"status": "success", "message": "Database schema and seeds applied."}, 200
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

# Vercel requires this 'app' variable to be available at the module level
# This is what the Vercel Python Runtime calls.
if __name__ == "__main__":
    app.run()