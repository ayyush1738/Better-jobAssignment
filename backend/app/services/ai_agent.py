import os
import json
import logging
from google import genai
from typing import Dict, Any

# Isolated logging for AI behavior
logger = logging.getLogger(__name__)

class AIAgent:
    """
    The AI Risk Auditor (Modern 2026 SDK). 
    Responsible for interpreting feature intent and predicting system impact.
    """

    @staticmethod
    def _get_client():
        """Initializes the modern GenAI Client using environment variables."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY is missing from environment variables.")
            return None
        
        # In the 2026 SDK, everything revolves around the Client object
        return genai.Client(api_key=api_key)

    @classmethod
    def get_risk_report(cls, feature_name: str, environment: str, description: str) -> Dict[str, Any]:
        """
        Analyzes toggle risk. Returns structured JSON for the service layer.
        """
        client = cls._get_client()
        
        # Fallback if AI configuration is broken
        if not client:
            return cls._offline_fallback("AI Service unconfigured.")

        prompt = f"""
        System: Act as a Senior DevOps and Infrastructure Safety Engineer.
        Task: Analyze risk level of toggling a feature flag.
        
        Context:
        - Feature: {feature_name}
        - Environment: {environment}
        - Description: {description}

        Constraints:
        1. If description mentions 'database', 'migration', 'payment', or 'security', risk_score > 7.
        2. If environment is not 'Production', risk_score < 4.
        
        Required JSON Format: {{ "risk_score": <int 1-10>, "advice": "<string>", "risk_level": "low|medium|high" }}
        """

        try:
            # Modern SDK uses client.models.generate_content
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1 
                }
            )
            
            # The .text attribute in the new SDK handles JSON cleaning automatically
            report = json.loads(response.text)
            logger.info(f"AI Risk Assessment: {feature_name} scored {report.get('risk_score')}")
            return report

        except Exception as e:
            logger.error(f"AI Agent error: {e}")
            return cls._offline_fallback("AI Auditor unreachable or malformed response.")

    @staticmethod
    def _offline_fallback(reason: str) -> Dict[str, Any]:
        """The 'Fail-Safe' default to ensure the system never hangs."""
        return {
            "risk_score": 5, 
            "advice": f"{reason} Manual review mandatory.", 
            "risk_level": "medium",
            "status": "fail-safe"
        }