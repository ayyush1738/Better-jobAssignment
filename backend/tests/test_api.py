import pytest
from app import create_app, db
from app.models import Environment, FeatureFlag, FlagStatus
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:", # Use fast in-memory DB for tests
        "JWT_SECRET_KEY": "test-secret"
    })

    with app.app_context():
        db.create_all()
        # Seed required environments
        db.session.add_all([
            Environment(name="Development"),
            Environment(name="Production")
        ])
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def manager_header(app):
    with app.app_context():
        token = create_access_token(identity="manager", additional_claims={"role": "manager"})
        return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def dev_header(app):
    with app.app_context():
        token = create_access_token(identity="developer", additional_claims={"role": "developer"})
        return {"Authorization": f"Bearer {token}"}

# --- THE TESTS ---

def test_manager_can_create_flag(client, manager_header):
    """Verifies that the Manager role has permission to create flags."""
    payload = {
        "name": "New Payment UI",
        "key": "payment_ui_v2",
        "description": "Standard UI update"
    }
    response = client.post("/api/flags", json=payload, headers=manager_header)
    assert response.status_code == 201
    assert response.json["key"] == "payment_ui_v2"

def test_developer_cannot_create_flag(client, dev_header):
    """Verifies RBAC: Developers should be blocked from creating flags (403)."""
    payload = {"name": "Hacker Flag", "key": "hacker_key"}
    response = client.post("/api/flags", json=payload, headers=dev_header)
    assert response.status_code == 403

def test_ai_guardrail_blocks_production_risk(client, manager_header, dev_header):
    """
    CRITICAL TEST: Ensures that a high-risk description causes an AI block 
    when toggling in Production.
    """
    # 1. Manager creates a high-risk flag
    client.post("/api/flags", json={
        "name": "DB Migration",
        "key": "db_migrator",
        "description": "This flag migrates the entire user database payments table"
    }, headers=manager_header)

    # 2. Get the flag and Prod environment ID
    with client.application.app_context():
        flag = FeatureFlag.query.filter_by(key="db_migrator").first()
        prod_env = Environment.query.filter_by(name="Production").first()

    # 3. Developer tries to toggle it in Production
    payload = {
        "environment_id": prod_env.id,
        "reason": "Deploying now"
    }
    response = client.patch(f"/api/flags/{flag.id}/toggle", json=payload, headers=dev_header)
    
    # Assert that the AI blocked it (403) and returned the guardrail message
    assert response.status_code == 403
    assert "AI BLOCK" in response.json["error"]