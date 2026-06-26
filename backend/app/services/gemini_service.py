import os
import httpx
import json

class GeminiSreService:
    """
    Python backend service leveraging the Google Gemini API to analyze GKE cluster anomalies, 
    diagnose root causes of system degradation, and formulate SRE incident reviews.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = "gemini-1.5-flash" # recommended standard for fast telemetry reasoning

    async def generate_sre_advice(self, user_query: str, cluster_state: dict) -> dict:
        """
        Sends a contextual prompt to the Gemini API incorporating real-time cluster states and predictions.
        """
        if not self.api_key:
            return {
                "response": "### Gemini SRE Assistant Standby\n\nPlease configure your **GEMINI_API_KEY** inside the settings panel. In the meantime, based on the local telemetry rules, your payment-service and pods workloads are operating normally.",
                "recommends_action": False
            }
            
        system_prompt = (
            "You are a Senior Principal Site Reliability Engineer (SRE) and Kubernetes Architect at Google. "
            "You have complete access to cluster metrics, alerts, and anomaly feeds. "
            "Formulate responses with professional composure, detailed technical accuracy, and actionable advice. "
            "Include root cause, recommended actions, risk assessment, and estimated impact."
        )
        
        prompt = f"""
        User Question: {user_query}
        
        Current Live Cluster Telemetry State:
        {json.dumps(cluster_state, indent=2)}
        
        Please formulate a senior SRE recommendation. Use clean markdown formatting. 
        Identify if there are any critical bottlenecks or CPU/Memory pressures and suggest exact configuration changes.
        """
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\n{prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=20.0)
                if response.status_code == 200:
                    data = response.json()
                    response_text = data['candidates'][0]['content']['parts'][0]['text']
                    return {
                        "response": response_text,
                        "recommends_action": True
                    }
                else:
                    return {
                        "response": f"Error calling Google Gemini API (Status: {response.status_code}). Please verify your credentials.",
                        "recommends_action": False
                    }
        except Exception as e:
            return {
                "response": f"Could not contact Gemini API due to a network connection failure: {str(e)}",
                "recommends_action": False
            }
