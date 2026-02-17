import os
from app import create_app, db
from app.models import Environment, User
from loguru import logger

# Initialize the Flask application using the App Factory pattern
app = create_app()

def seed_database():
    """
    The 'Bootstrap' phase.
    Ensures that Postgres has the core environments (Dev/Staging/Prod) 
    and the default user accounts required for the first login.
    """
    with app.app_context():
        try:
            # 1. Seed Environments (Idempotency check)
            if not Environment.query.first():
                logger.info("Initializing default environments...")
                envs = [
                    Environment(name="Development"),
                    Environment(name="Staging"),
                    Environment(name="Production")
                ]
                db.session.add_all(envs)
                db.session.commit()
                logger.success("Environments (Dev, Staging, Prod) ready.")

            # 2. Seed Test Accounts (Proper Auth Demo)
            if not User.query.first():
                logger.info("Creating default test accounts...")
                
                # Manager Account
                manager = User(email="manager@safeconfig.ai", role="manager")
                manager.set_password("password123") # Standardized password for demo
                
                # Developer Account
                developer = User(email="dev@safeconfig.ai", role="developer")
                developer.set_password("password123")
                
                db.session.add_all([manager, developer])
                db.session.commit()
                logger.success("Demo accounts created: manager@safeconfig.ai | dev@safeconfig.ai")
            
            else:
                logger.info("Database records verified. Skipping seed.")

        except Exception as e:
            db.session.rollback()
            logger.error(f"Seeding failed: {e}")

if __name__ == "__main__":
    # 1. Physical Layer: Create Postgres tables based on models.py
    with app.app_context():
        db.create_all()
        logger.info("Schema synchronization complete.")
    
    # 2. Logic Layer: Seed data so the demo works out-of-the-box
    seed_database()

    # 3. Network Layer: Start the server
    # host='0.0.0.0' allows connectivity from Docker or other local network devices
    logger.info("SafeConfig AI Backend live at http://127.0.0.1:5000")
    
    app.run(
        host="0.0.0.0", 
        port=5000, 
        debug=True  # Enables hot-reloading for rapid 2026 development
    )