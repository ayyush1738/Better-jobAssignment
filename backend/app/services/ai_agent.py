import os
import json
import logging
from groq import Groq
from typing import Dict, Any

# Isolated logging for system monitoring
logger = logging.getLogger(__name__)

class AIAgent:
    """
    The AI Risk Auditor (Groq Powered). 
    Uses Llama-3.3-70b-Versatile for near-instant, traffic-aware risk assessment.
    Now includes mitigation awareness to prevent "Forever Blocks" on low-traffic features.
    """

    @staticmethod
    def _get_client():
        """Initializes the Groq Client."""
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            logger.error("CRITICAL: GROQ_API_KEY missing from environment.")
            return None
        
        return Groq(api_key=api_key)

    @classmethod
    def get_risk_report(cls, feature_name: str, environment: str, description: str, traffic_count: int = 0) -> Dict[str, Any]:
        """
        Performs a high-speed risk audit of the feature toggle.
        Calculates risk based on intent, blast radius, and safety mitigations.
        """
        client = cls._get_client()
        
        if not client:
            return {
                "risk_score": 5,
                "advice": "System Warning: Groq Client not initialized. Check API Key.",
                "risk_level": "medium"
            }

        prompt = f"""
        System: Act as a Senior DevOps and Infrastructure Safety Engineer.
        Task: Analyze the technical risk of toggling this feature flag.

        Context:
        - Feature: {feature_name}
        - Environment: {environment}
        - Current Live Traffic (Hits in last 24h): {traffic_count}
        - Description: {description}

        Internal Policy (Safety Weights):
        1. SENSITIVITY: If 'payment', 'database', or 'auth' in Production, base risk is HIGH.
        2. BLAST RADIUS: If Traffic > 1000, increase risk_score by +2.
        3. MITIGATION: If description mentions 'circuit breaker', 'alpha testing', 'internal', or 'rollback plan', REDUCE risk_score by 3-4 points.
        4. ZERO TRAFFIC RULE: If traffic is 0 and safety mitigations are mentioned, the risk_score should NOT exceed 7, allowing for safe rollout.

        Constraint: Return ONLY a raw JSON object. No conversational filler.
        
        Structure:
        {{
          "risk_score": <int 1-10>,
          "advice": "<detailed technical explanation focused on why the score was reduced or increased>",
          "risk_level": "low" | "medium" | "high"
        }}
        """

        try:
            # Note: Changed model to the official Groq Llama 3.3 endpoint
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            report = json.loads(response_text)
            
            logger.info(f"Groq Audit: {feature_name} (Traffic: {traffic_count}) -> Score: {report.get('risk_score')}")
            return report

        except Exception as e:
            logger.error(f"Groq AI Request Failed: {str(e)}")
            return {
                "risk_score": 5, 
                "advice": f"AI Auditor offline. Safety default applied. Error: {str(e)[:30]}", 
                "risk_level": "medium"
            }