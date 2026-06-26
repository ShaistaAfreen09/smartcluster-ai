import os
import requests
from typing import Dict, Any, Optional

class PrometheusClient:
    def __init__(self):
        self.url = os.getenv("PROMETHEUS_URL", "http://prometheus-k8s.monitoring.svc.cluster.local:9090")
        self.username = os.getenv("PROMETHEUS_USERNAME")
        self.password = os.getenv("PROMETHEUS_PASSWORD")
        self.headers = {"Content-Type": "application/json"}
        
        # Simple HTTP Basic Auth if configured
        self.auth = None
        if self.username and self.password:
            self.auth = (self.username, self.password)

    def query(self, promql_query: str) -> Optional[Dict[str, Any]]:
        """
        Execute an instant query on the Prometheus API.
        """
        try:
            endpoint = f"{self.url.rstrip('/')}/api/v1/query"
            response = requests.get(
                endpoint, 
                params={"query": promql_query}, 
                auth=self.auth, 
                headers=self.headers,
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
            print(f"Prometheus HTTP {response.status_code}: {response.text}")
            return None
        except Exception as e:
            print(f"Error querying Prometheus API: {e}")
            return None

    def query_range(self, promql_query: str, start: float, end: float, step: str) -> Optional[Dict[str, Any]]:
        """
        Execute a range query on Prometheus.
        """
        try:
            endpoint = f"{self.url.rstrip('/')}/api/v1/query_range"
            params = {
                "query": promql_query,
                "start": start,
                "end": end,
                "step": step
            }
            response = requests.get(
                endpoint, 
                params=params, 
                auth=self.auth, 
                headers=self.headers,
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error querying Prometheus Range API: {e}")
            return None
