import logging
from app.models import db, FeatureFlag, Environment, FlagStatus, AuditLog, FlagEvaluation
from app.services.ai_agent import AIAgent
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

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
        """
        Initializes a new feature and sets it to 'Disabled' across all envs.
        Fulfills: 'Safe-by-Default' architecture.
        """
        try:
            new_flag = FeatureFlag(
                name=data.name,
                key=data.key,
                description=data.description
            )
            db.session.add(new_flag)
            
            # Flush to get the ID without committing the whole transaction yet
            db.session.flush() 

            # Auto-initialize status for Dev, Staging, and Production
            envs = Environment.query.all()
            for env in envs:
                status = FlagStatus(feature_flag=new_flag, env=env, is_enabled=False)
                db.session.add(status)
            
            db.session.commit()
            logger.info(f"Flag created: {new_flag.key}")
            return new_flag
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Persistence error: {e}")
            raise

    @staticmethod
    def toggle_status(flag_id, data):
        """
        The Gatekeeper Logic. 
        Consults the AI Agent before allowing a Production toggle.
        """
        flag = FeatureFlag.query.get(flag_id)
        env = Environment.query.get(data.environment_id)
        
        if not flag or not env:
            return None, "Invalid Flag or Environment target."

        ai_report = None

        # --- AI GUARDRAIL PHASE ---
        if env.name.lower() == "production":
            logger.info(f"Risk Audit initiated for {flag.key}")
            ai_report = AIAgent.get_risk_report(
                feature_name=flag.name,
                environment=env.name,
                description=flag.description or "N/A"
            )
            
            # HARD BLOCK: If AI score is 8 or higher, we refuse the toggle
            if ai_report.get('risk_score', 0) >= 8:
                # Log the blocked attempt for the Audit Trail
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

        # --- UPDATE PHASE ---
        try:
            status = FlagStatus.query.filter_by(flag_id=flag_id, env_id=data.environment_id).first()
            if not status:
                return None, "Environment configuration missing."

            # Perform the toggle
            status.is_enabled = not status.is_enabled
            
            # Record success in Audit Log
            success_log = AuditLog(
                flag_id=flag_id,
                env_name=env.name,
                action=f"TOGGLE_{'ON' if status.is_enabled else 'OFF'}",
                reason=data.reason,
                ai_metadata=ai_report
            )
            
            db.session.add(success_log)
            db.session.commit()
            return status, None

        except SQLAlchemyError:
            db.session.rollback()
            return None, "Database transaction failed."

    # --- TRAFFIC OBSERVATION LOGIC ---

    @staticmethod
    def track_evaluation(key):
        """
        The 'Observer' logic. 
        Logs an event every time a feature is 'hit' on the client side.
        """
        try:
            flag = FeatureFlag.query.filter_by(key=key).first()
            if not flag:
                return False

            # Create a traffic hit entry
            hit = FlagEvaluation(flag_key=key, environment_name="Production")
            db.session.add(hit)
            db.session.commit()
            return True
        except Exception as e:
            logger.error(f"Traffic tracking failed: {e}")
            return False

    @staticmethod
    def get_traffic_stats():
        """
        Aggregates traffic 'hits' for the Dashboard analytics.
        Fulfills: 'Traffic Monitoring' requirement.
        """
        # Groups evaluations by flag_key and counts them
        stats = db.session.query(
            FlagEvaluation.flag_key, 
            func.count(FlagEvaluation.id).label('hit_count')
        ).group_by(FlagEvaluation.flag_key).all()
        
        return [{"key": s.flag_key, "hits": s.hit_count} for s in stats]

    @staticmethod
    def get_audit_history():
        """Returns the most recent system actions for the activity log."""
        return AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(30).all()