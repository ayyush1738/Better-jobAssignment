# Groq third-party SDK for AI generation API
import os
import json
import logging
from groq import Groq
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AIAgent:
    @staticmethod
    def _get_client():
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            logger.error("CRITICAL: GROQ_API_KEY missing from environment.")
            return None
        
    
        return Groq(api_key=api_key, timeout=10.0)

    @classmethod
    def get_risk_report(cls, feature_name: str, environment: str, description: str, traffic_count: int = 0) -> Dict[str, Any]:
   
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
        3. MITIGATION: If description mentions 'circuit breaker', 'alpha testing', or 'internal', REDUCE risk_score by 3-4 points.
        4. ZERO TRAFFIC RULE: If traffic is 0 and mitigations exist, risk_score should NOT exceed 7.

        Constraint: Return ONLY a raw JSON object. No conversational filler.
        
        Structure:
        {{
          "risk_score": <int 1-10>,
          "advice": "<detailed technical explanation>",
          "risk_level": "low" | "medium" | "high"
        }}
        """

        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="openai/gpt-oss-120b",
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            report = json.loads(response_text)
            
            logger.info(f"Groq Audit: {feature_name} -> Score: {report.get('risk_score')}")
            return report

        except Exception as e:
            logger.error(f"Groq AI Request Failed: {str(e)}")
            return {
                "risk_score": 5, 
                "advice": f"AI Auditor offline (Timeout/Error). Safety default applied.", 
                "risk_level": "medium"
            }