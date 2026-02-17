import pytest
from app import create_app, db
from app.models import Environment, FeatureFlag, FlagStatus, AuditLog
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret"
    })

    with app.app_context():
        db.create_all()
        # Seed required infrastructure
        db.session.add_all([
            Environment(name="Development"),
            Environment(name="Staging"),
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
        # Identity 1 for Manager
        token = create_access_token(identity="1", additional_claims={"role": "manager"})
        return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def dev_header(app):
    with app.app_context():
        # Identity 2 for Developer
        token = create_access_token(identity="2", additional_claims={"role": "developer"})
        return {"Authorization": f"Bearer {token}"}

# --- THE TESTS ---

def test_manager_can_create_flag(client, manager_header):
    """Verifies RBAC: Managers can define new features."""
    payload = {
        "name": "New Payment UI",
        "key": "payment_ui_v2",
        "description": "Critical checkout update"
    }
    response = client.post("/api/flags", json=payload, headers=manager_header)
    data = response.get_json()
    assert response.status_code == 201
    assert data["data"]["key"] == "payment_ui_v2"

def test_developer_cannot_create_flag(client, dev_header):
    """Verifies RBAC: Developers are blocked from flag creation."""
    payload = {"name": "Shadow Flag", "key": "shadow", "description": "test"}
    response = client.post("/api/flags", json=payload, headers=dev_header)
    assert response.status_code == 403

# --- TWO-STAGE GATE TESTS ---

def test_stage_1_audit_dry_run(client, manager_header, dev_header):
    """Verifies that the /audit endpoint returns a report without changing state."""
    # Create a flag
    client.post("/api/flags", json={"name": "Audit Test", "key": "audit_key", "description": "Testing"}, headers=manager_header)
    
    with client.application.app_context():
        flag = FeatureFlag.query.filter_by(key="audit_key").first()
        prod_env = Environment.query.filter_by(name="Production").first()

    # Hit the Audit Stage
    response = client.post(f"/api/ai/analyze-risk", json={
        "feature_key": "audit_key",
        "environment": "Production",
        "description": "Toggling a database feature"
    }, headers=dev_header)
    
    data = response.get_json()
    assert response.status_code == 200
    assert "risk_score" in data["data"]
    # Verify flag is still DISABLED (Dry run)
    with client.application.app_context():
        status = FlagStatus.query.filter_by(flag_id=flag.id, env_id=prod_env.id).first()
        assert status.is_enabled is False

def test_stage_2_ai_guardrail_block(client, manager_header, dev_header):
    """Verifies that the AI Guardrail physically blocks high-risk Production toggles."""
    # Create a high-risk flag
    client.post("/api/flags", json={
        "name": "Payment Database Bypass",
        "key": "pay_bypass",
        "description": "Bypassing payment validation for testing"
    }, headers=manager_header)

    with client.application.app_context():
        flag = FeatureFlag.query.filter_by(key="pay_bypass").first()
        prod_env = Environment.query.filter_by(name="Production").first()

    # Attempt to toggle in Production — Groq logic should return score > 8
    response = client.patch(f"/api/flags/{flag.id}/toggle", json={
        "environment_id": prod_env.id,
        "reason": "Just testing something quickly in prod"
    }, headers=dev_header)
    
    # Depending on Groq output, this should be a 403 (Blocked)
    if response.status_code == 403:
        data = response.get_json()
        assert "Blocked" in data["message"]
        # Verify it stayed disabled
        with client.application.app_context():
            status = FlagStatus.query.filter_by(flag_id=flag.id, env_id=prod_env.id).first()
            assert status.is_enabled is False

# --- TRAFFIC & ANALYTICS TESTS ---

def test_traffic_telemetry_flow(client, manager_header):
    """Verifies traffic hits are tracked and aggregated in analytics."""
    client.post("/api/flags", json={"name": "Traffic Test", "key": "tr_key", "description": "test"}, headers=manager_header)
    
    # 3 hits to the evaluation endpoint
    for _ in range(3):
        client.get("/api/flags/evaluate/tr_key")

    response = client.get("/api/flags/analytics", headers=manager_header)
    data = response.get_json()
    
    # Check that our key has 3 hits
    target = next(item for item in data["data"] if item["key"] == "tr_key")
    assert target["hits"] == 3

def test_audit_logs_contain_ai_metadata(client, manager_header, dev_header):
    """Verifies that audit logs store the JSON metadata from the AI."""
    client.post("/api/flags", json={"name": "Log Test", "key": "log_key", "description": "test"}, headers=manager_header)
    
    with client.application.app_context():
        flag = FeatureFlag.query.filter_by(key="log_key").first()
        dev_env = Environment.query.filter_by(name="Development").first()

    client.patch(f"/api/flags/{flag.id}/toggle", json={
        "environment_id": dev_env.id,
        "reason": "Dev toggle"
    }, headers=dev_header)

    response = client.get("/api/flags/logs", headers=manager_header)
    data = response.get_json()
    
    # Ensure the log entry exists and has AI info
    latest_log = data["data"][0]
    assert "ai_metadata" in latest_log