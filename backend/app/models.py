from app import db  # Singleton instance from __init__.py
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """
    Core Identity Management.
    Stores hashed credentials and RBAC roles.
    Fulfills: 'Security' and 'Role-Based Access Control'.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='developer', nullable=False) # 'manager' or 'developer'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hashes the password using pbkdf2:sha256."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies the password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role
        }

class FeatureFlag(db.Model):
    """
    The main definition of a feature toggle.
    """
    __tablename__ = 'feature_flags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    key = db.Column(db.String(50), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    statuses = db.relationship('FlagStatus', backref='feature_flag', lazy=True, cascade="all, delete-orphan")
    # Link to evaluations for Blast Radius calculations
    evaluations = db.relationship('FlagEvaluation', backref='feature_flag', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "key": self.key,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "statuses": [s.to_dict() for s in self.statuses]
        }

class Environment(db.Model):
    """
    Deployment environments (Dev, Staging, Production).
    """
    __tablename__ = 'environments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) 

    def to_dict(self):
        return {"id": self.id, "name": self.name}

class FlagStatus(db.Model):
    """
    Stores the state (On/Off) of a flag per environment.
    """
    __tablename__ = 'flag_statuses'
    
    id = db.Column(db.Integer, primary_key=True)
    flag_id = db.Column(db.Integer, db.ForeignKey('feature_flags.id'), nullable=False)
    env_id = db.Column(db.Integer, db.ForeignKey('environments.id'), nullable=False)
    is_enabled = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    env = db.relationship('Environment', backref='flag_links')

    def to_dict(self):
        return {
            "id": self.id,
            "environment_name": self.env.name if self.env else "Unknown",
            "environment_id": self.env_id,
            "is_enabled": self.is_enabled,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class FlagEvaluation(db.Model):
    """
    Telemetry Table. Tracks every time a feature is accessed.
    This fix adds flag_id to solve the UndefinedColumn error in analytics.
    """
    __tablename__ = 'flag_evaluations'
    
    id = db.Column(db.Integer, primary_key=True)
    # Critical Fix: This column MUST exist for the JOIN in FlagService.get_traffic_stats()
    flag_id = db.Column(db.Integer, db.ForeignKey('feature_flags.id'), nullable=False)
    environment_name = db.Column(db.String(50), default="Production")
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class AuditLog(db.Model):
    """
    Observability Ledger. Stores all human actions and AI assessments.
    """
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    flag_id = db.Column(db.Integer, db.ForeignKey('feature_flags.id'))
    env_name = db.Column(db.String(50))
    action = db.Column(db.String(100)) # 'TOGGLE_ON', 'AI_BLOCK', 'AUDIT_REQUEST'
    reason = db.Column(db.Text)
    ai_metadata = db.Column(JSONB, nullable=True) # Stores the Groq JSON response
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "flag_id": self.flag_id,
            "env_name": self.env_name,
            "action": self.action,
            "reason": self.reason,
            "ai_metadata": self.ai_metadata,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }