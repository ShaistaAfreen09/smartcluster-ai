import os
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import joblib

MODEL_DIR = "/tmp/smartcluster_models"
os.makedirs(MODEL_DIR, exist_ok=True)

class PredictionService:
    @staticmethod
    def train_and_predict(
        history_points: List[Dict[str, Any]], 
        target_metric: str, 
        steps_ahead: int = 6
    ) -> Tuple[List[float], float, Dict[str, Any]]:
        """
        Trains a Linear Regression & Random Forest model, serializes them using joblib,
        and returns future forecasts with model scores.
        """
        n = len(history_points)
        if n < 4:
            # Fallback when data points are too sparse to fit regression
            default_val = 50.0
            forecasts = [float(default_val + i * 1.5) for i in range(1, steps_ahead + 1)]
            return forecasts, 0.70, {"info": "Simulated preset (insufficient history data)"}

        # Features correspond to relative time integer offsets
        X = np.arange(n).reshape(-1, 1)
        y = np.array([pt.get(target_metric, 50.0) for pt in history_points])

        # 1. Train linear model
        linear_model = LinearRegression()
        linear_model.fit(X, y)
        r2_score = float(linear_model.score(X, y))

        # 2. Train RF model for capturing non-linear fluctuations
        rf_model = RandomForestRegressor(n_estimators=10, random_state=42)
        rf_model.fit(X, y)

        # 3. Serialize and save the models using joblib
        linear_path = os.path.join(MODEL_DIR, f"{target_metric}_linear.joblib")
        rf_path = os.path.join(MODEL_DIR, f"{target_metric}_rf.joblib")
        joblib.dump(linear_model, linear_path)
        joblib.dump(rf_model, rf_path)

        # 4. Predict subsequent points
        forecasts = []
        for i in range(1, steps_ahead + 1):
            future_idx = np.array([[n + i]])
            lin_val = float(linear_model.predict(future_idx)[0])
            rf_val = float(rf_model.predict(future_idx)[0])
            
            # Hybrid ensemble blend (60% Forest patterns, 40% Linear trendline)
            ensemble_val = max(0.0, min(100.0, 0.60 * rf_val + 0.40 * lin_val))
            forecasts.append(round(ensemble_val, 2))

        analysis = {
            "r2_coefficient": round(r2_score, 4),
            "trend_slope": float(linear_model.coef_[0]),
            "model_paths": {"linear": linear_path, "rf": rf_path}
        }

        return forecasts, max(0.5, min(0.99, r2_score)), analysis

    @staticmethod
    def get_scaling_recommendation(cpu_forecast: List[float], current_replicas: int = 4) -> int:
        """
        Determines the optimal pod counts to buffer forecasted CPU workload peaks.
        """
        max_cpu_forecast = max(cpu_forecast)
        if max_cpu_forecast > 85.0:
            return max(current_replicas + 4, 10)
        elif max_cpu_forecast > 70.0:
            return max(current_replicas + 2, 8)
        elif max_cpu_forecast < 30.0:
            return max(2, current_replicas - 1) # Downscale gently
        return current_replicas
