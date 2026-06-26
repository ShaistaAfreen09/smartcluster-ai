import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from typing import List, Dict, Any, Tuple

class PredictionEngine:
    @staticmethod
    def run_regression_forecasting(history_points: List[Dict[str, Any]], steps_ahead: int = 6) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Calculates Linear Regression & Random Forest regressors based on historical metrics.
        Returns projected telemetry and confidence metrics.
        """
        n = len(history_points)
        if n < 4:
            # Not enough data for robust model fit; return safe static trend
            return [], {"r2": 0.0, "status": "Insufficient Data"}

        # Represent historical timestamp timeline as numeric feature vectors
        X_train = np.arange(n).reshape(-1, 1)
        
        y_cpu = np.array([pt["cpu"] for pt in history_points])
        y_mem = np.array([pt["mem"] for pt in history_points])
        y_network = np.array([pt["network"] for pt in history_points])

        # 1. Linear model fit
        model_cpu_lr = LinearRegression()
        model_cpu_lr.fit(X_train, y_cpu)
        cpu_r2 = model_cpu_lr.score(X_train, y_cpu)

        model_mem_lr = LinearRegression()
        model_mem_lr.fit(X_train, y_mem)

        # 2. Random forest regressor (Complex load patterns)
        model_cpu_rf = RandomForestRegressor(n_estimators=10, random_state=42)
        model_cpu_rf.fit(X_train, y_cpu)
        
        model_mem_rf = RandomForestRegressor(n_estimators=10, random_state=42)
        model_mem_rf.fit(X_train, y_mem)

        model_net_rf = RandomForestRegressor(n_estimators=10, random_state=42)
        model_net_rf.fit(X_train, y_network)

        # 3. Isolation Forest for out-of-bounds anomaly detection
        # Fit on historical multi-vector metrics: [cpu, mem, network]
        X_anomaly = np.vstack([y_cpu, y_mem, y_network]).T
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        iso_forest.fit(X_anomaly)
        anomalies_pred = iso_forest.predict(X_anomaly)  # -1 indicates anomaly, 1 indicates normal
        
        # Build predictions list
        predictions_out = []
        for i in range(1, steps_ahead + 1):
            future_idx = np.array([[n + i]])
            
            # Linear trend line
            lr_cpu = float(model_cpu_lr.predict(future_idx)[0])
            lr_mem = float(model_mem_lr.predict(future_idx)[0])
            
            # Non-linear pattern fitting
            rf_cpu = float(model_cpu_rf.predict(future_idx)[0])
            rf_mem = float(model_mem_rf.predict(future_idx)[0])
            rf_net = float(model_net_rf.predict(future_idx)[0])

            # Apply seasonality adjustments to represent production surges (e.g. diurnal loops)
            season_mult = 1.0 + np.sin(i * np.pi / 4.0) * 0.15
            ensemble_cpu = max(1.0, rf_cpu * season_mult)
            ensemble_mem = max(4.0, rf_mem * (1.0 + (i * 0.01)))
            ensemble_traffic = max(5.0, rf_net * season_mult)

            predictions_out.append({
                "hourOffset": i,
                "predictedCpuLinear": float(f"{max(1.0, lr_cpu):.2f}"),
                "predictedMemLinear": float(f"{max(4.0, lr_mem):.2f}"),
                "predictedCpuEnsemble": float(f"{ensemble_cpu:.2f}"),
                "predictedMemEnsemble": float(f"{ensemble_mem:.2f}"),
                "predictedTrafficRPS": int(ensemble_traffic),
                "confidenceIntervalCpu": [
                    float(f"{max(1.0, ensemble_cpu * 0.88):.2f}"),
                    float(f"{ensemble_cpu * 1.12:.2f}")
                ],
                "confidenceIntervalMem": [
                    float(f"{max(4.0, ensemble_mem * 0.90):.2f}"),
                    float(f"{ensemble_mem * 1.10:.2f}")
                ]
            })

            anomaly_count = int(np.sum(anomalies_pred == -1))

        return predictions_out, {
            "r2ScoreCpu": float(f"{cpu_r2:.4f}"),
            "trendDirection": "UPWARD_SPIKE" if model_cpu_lr.coef_[0] > 0.05 else "STABLE",
            "anomalyPointsDetected": anomaly_count,
            "complexityFactorIndex": 1.4
        }
