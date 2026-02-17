import logging
from flask import g
from datetime import datetime, timedelta
from app.models import db, FeatureFlag, Environment, FlagStatus, AuditLog, FlagEvaluation
from app.services.ai_agent import AIAgent
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

class FlagService:
    """
    The Business Logic Layer.
    Orchestrates AI Risk Analysis, Database Persistence, and Traffic Monitoring.
    """

    @staticmethod
    def get_all_flags():
        """Fetches all flags with their status across all environments."""
        return FeatureFlag.query.all()

    @staticmethod
    def create_new_flag(data):
        """Initializes a new feature as 'Disabled' across all envs."""
        try:
            new_flag = FeatureFlag(
                name=data.name,
                key=data.key,
                description=data.description
            )
            db.session.add(new_flag)
            db.session.flush() # Secure the ID before creating statuses

            envs = Environment.query.all()
            for env in envs:
                status = FlagStatus(feature_flag=new_flag, env=env, is_enabled=False)
                db.session.add(status)
            
            db.session.commit()
            return new_flag
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Persistence error: {e}")
            raise

    # --------------------------------------------------------------------------
    # TWO-STAGE PRODUCTION GATE (WITH BLAST RADIUS TELEMETRY)
    # --------------------------------------------------------------------------

    @staticmethod
    def _get_blast_radius(flag_id):
        """Internal helper to count hits in the last 24 hours."""
        one_day_ago = datetime.utcnow() - timedelta(hours=24)
        return db.session.query(func.count(FlagEvaluation.id)).filter(
            FlagEvaluation.flag_id == flag_id,
            FlagEvaluation.timestamp >= one_day_ago
        ).scalar() or 0

    @staticmethod
    def audit_flag(flag_id, environment_id, reason):
        """Stage 1: AI Risk Assessment using Real-Time Traffic Data."""
        flag = FeatureFlag.query.get(flag_id)
        env = Environment.query.get(environment_id)

        if not flag or not env:
            return None, "Invalid Flag or Environment target."

        # Fetch Live Telemetry (Real Traffic)
        traffic_count = FlagService._get_blast_radius(flag_id)

        # Call Groq AI Agent with Traffic Context
        ai_report = AIAgent.get_risk_report(
            feature_name=flag.name,
            environment=env.name,
            description=flag.description or "N/A",
            traffic_count=traffic_count
        )

        # Metadata for frontend HUD
        ai_report["live_traffic_hits"] = traffic_count

        return ai_report, None

    @staticmethod
    def toggle_status(flag_id, data):
        """Stage 2: Finalize Deployment with AI-Enforced Guardrails & Manager Override."""
        flag = FeatureFlag.query.get(flag_id)
        env = Environment.query.get(data.environment_id)
        
        if not flag or not env:
            return None, "Invalid Flag or Environment target."

        # 🛡️ Production Guardrail
        ai_report = None
        if env.name.lower() == "production":
            traffic_count = FlagService._get_blast_radius(flag_id)
            ai_report = AIAgent.get_risk_report(
                feature_name=flag.name,
                environment=env.name,
                description=flag.description or "N/A",
                traffic_count=traffic_count
            )
            
            # THE HARD BLOCK & OVERRIDE LOGIC
            # If user is NOT a manager, the score block is absolute.
            user_role = getattr(g, 'user_role', 'developer')
            
            if ai_report.get('risk_score', 0) >= 8 and user_role != 'manager':
                blocked_log = AuditLog(
                    flag_id=flag_id,
                    env_name=env.name,
                    action="AI_BLOCK",
                    reason=f"[SECURITY BLOCK] {data.reason}",
                    ai_metadata=ai_report
                )
                db.session.add(blocked_log)
                db.session.commit()
                return None, {"message": ai_report['advice'], "report": ai_report}

        # Update Phase
        try:
            status = FlagStatus.query.filter_by(flag_id=flag_id, env_id=data.environment_id).first()
            old_state = "ON" if status.is_enabled else "OFF"
            status.is_enabled = not status.is_enabled
            new_state = "ON" if status.is_enabled else "OFF"
            
            # Log successful deployment (or manager override)
            log_action = f"TOGGLE_{new_state}"
            if ai_report and ai_report.get('risk_score', 0) >= 8:
                log_action = f"MANAGER_OVERRIDE_{new_state}"

            success_log = AuditLog(
                flag_id=flag_id,
                env_name=env.name,
                action=log_action,
                reason=data.reason,
                ai_metadata=ai_report 
            )
            
            db.session.add(success_log)
            db.session.commit()
            return status, None
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Toggle transaction failed: {e}")
            return None, "Database transaction failed."

    # --- TRAFFIC HUD LOGIC ---

    @staticmethod
    def track_evaluation(key):
        """Captures a real traffic event from the SDK endpoint."""
        flag = FeatureFlag.query.filter_by(key=key).first()
        if not flag: return False
        
        # Log the hit linked to the Flag ID
        hit = FlagEvaluation(flag_id=flag.id, environment_name="Production")
        db.session.add(hit)
        db.session.commit()
        return True

    @staticmethod
    def get_traffic_stats():
        """Aggregates hits per flag for the HUD Analytics."""
        # Using specific join on flag_id to prevent schema errors
        stats = db.session.query(
            FeatureFlag.key, 
            func.count(FlagEvaluation.id).label('hit_count')
        ).join(FlagEvaluation, FeatureFlag.id == FlagEvaluation.flag_id).group_by(FeatureFlag.key).all()
        
        return [{"key": s.key, "hits": s.hit_count} for s in stats]

    @staticmethod
    def get_audit_history():
        """Returns the activity stream for the Safety Ledger."""
        return AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(30).all()