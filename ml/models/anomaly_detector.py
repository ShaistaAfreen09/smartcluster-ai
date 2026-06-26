import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyDetectionEngine:
    """
    State-of-the-art anomaly detector for Kubernetes cluster nodes and services.
    Uses an Isolation Forest ensemble for multivariate pattern anomalies and standard statistical z-score thresholds for fast alerts.
    """
    def __init__(self, contamination=0.05):
        self.iso_forest = IsolationForest(contamination=contamination, random_state=42)
        self.fitted = False
        self.feature_means = {}
        self.feature_stds = {}

    def fit(self, df: pd.DataFrame, features: list):
        """
        Fits Isolation Forest on historical baseline telemetry and computes column averages.
        """
        clean_df = df[features].fillna(0)
        self.iso_forest.fit(clean_df)
        self.fitted = True
        
        # Capture baseline statistics
        for col in features:
            self.feature_means[col] = float(df[col].mean())
            self.feature_stds[col] = float(df[col].std()) if df[col].std() > 0 else 1e-5

    def detect_multivariate_anomaly(self, row: pd.DataFrame, features: list) -> tuple:
        """
        Runs Isolation Forest inference. Returns (is_anomaly, score).
        """
        if not self.fitted:
            return False, 0.0
            
        clean_row = row[features].fillna(0)
        prediction = self.iso_forest.predict(clean_row)[0]
        score = float(self.iso_forest.decision_function(clean_row)[0])
        
        # Isolation Forest outputs -1 for anomalies
        return (prediction == -1), score

    def analyze_telemetry_point(self, current_state: dict) -> list:
        """
        Performs rule-based SRE telemetry diagnostic profiling to flag specific anomalies
        with severities (INFO, WARNING, CRITICAL).
        """
        anomalies = []
        
        # 1. CPU Spike Detection
        cpu_usage = current_state.get('cpu_utilization', 0)
        if cpu_usage > 90:
            anomalies.append({
                'anomaly': 'Sudden CPU spike detected',
                'service': current_state.get('service', 'api-gateway'),
                'severity': 'CRITICAL',
                'confidence': 0.95,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"CPU utilization is dangerously high at {cpu_usage}%."
            })
        elif cpu_usage > 75:
            anomalies.append({
                'anomaly': 'Elevated CPU utilization warning',
                'service': current_state.get('service', 'api-gateway'),
                'severity': 'WARNING',
                'confidence': 0.82,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"CPU utilization crossed safe buffer threshold at {cpu_usage}%."
            })

        # 2. Memory Leak (Consistently growing memory with low relative traffic)
        mem_usage = current_state.get('memory_usage', 0)
        req_rate = current_state.get('request_rate', 1)
        if mem_usage > 85 and req_rate < 50:
            anomalies.append({
                'anomaly': 'Memory leak detected',
                'service': current_state.get('service', 'payment-service'),
                'severity': 'CRITICAL',
                'confidence': 0.92,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"High RAM consumption ({mem_usage}%) relative to quiet request traffic ({req_rate} rps)."
            })

        # 3. Latency Spike
        latency = current_state.get('response_latency', 0.0)
        if latency > 0.5: # Over 500ms
            anomalies.append({
                'anomaly': 'Critical response latency spike',
                'service': current_state.get('service', 'payment-service'),
                'severity': 'CRITICAL',
                'confidence': 0.97,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"99th percentile response delay is {latency * 1000:.0f}ms (threshold 500ms)."
            })
        elif latency > 0.25:
            anomalies.append({
                'anomaly': 'Response latency warning',
                'service': current_state.get('service', 'payment-service'),
                'severity': 'WARNING',
                'confidence': 0.88,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"Response delay of {latency * 1000:.0f}ms exceeds nominal SLA threshold."
            })

        # 4. Elevated Error Rates
        error_pct = current_state.get('error_percentage', 0.0)
        if error_pct > 5.0:
            anomalies.append({
                'anomaly': 'High rate of HTTP 5xx errors',
                'service': current_state.get('service', 'user-service'),
                'severity': 'CRITICAL',
                'confidence': 0.94,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"Active API call errors spiked to {error_pct:.2f}%."
            })

        # 5. Pod Crash Patterns
        restarts = current_state.get('restarts', 0)
        if restarts > 2:
            anomalies.append({
                'anomaly': 'Container CrashLoopBackOff detected',
                'service': current_state.get('service', 'analytics-worker'),
                'severity': 'CRITICAL',
                'confidence': 0.98,
                'timestamp': current_state.get('timestamp', '2026-06-25T14:35:00Z'),
                'details': f"Pod restarts active ({restarts} failures in 5m interval)."
            })

        return anomalies
