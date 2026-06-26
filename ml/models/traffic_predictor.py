import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

class TrafficForecaster:
    """
    Forecaster for incoming ingress request rates (RPS).
    Leverages periodic (sine/cosine hour & day) features to capture high-fidelity diurnal traffic patterns.
    """
    def __init__(self):
        self.models = {
            'ridge_regression': Ridge(alpha=1.0),
            'random_forest_traffic': RandomForestRegressor(n_estimators=100, random_state=42)
        }
        self.best_model_name = None
        self.best_model = None
        self.evaluation_report = {}

    def fit(self, X: np.ndarray, y: np.ndarray, X_val: np.ndarray = None, y_val: np.ndarray = None):
        if X_val is None or y_val is None:
            split_idx = int(len(X) * 0.8)
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
        else:
            X_train, y_train = X, y

        best_score = -float('inf')
        
        for name, model in self.models.items():
            model.fit(X_train, y_train)
            preds = model.predict(X_val)
            
            mae = mean_absolute_error(y_val, preds)
            mse = mean_squared_error(y_val, preds)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_val, preds)
            
            self.evaluation_report[name] = {
                'mae': float(mae),
                'mse': float(mse),
                'rmse': float(rmse),
                'r2': float(r2)
            }
            
            if r2 > best_score:
                best_score = r2
                self.best_model_name = name
                self.best_model = model

    def predict(self, X: np.ndarray) -> np.ndarray:
        if self.best_model is None:
            raise ValueError("Forecaster is not fitted yet. Call fit().")
        return self.best_model.predict(X)

    def get_best_performance(self) -> dict:
        if self.best_model_name is None:
            return {}
        return {
            'model_name': self.best_model_name,
            'metrics': self.evaluation_report[self.best_model_name]
        }
