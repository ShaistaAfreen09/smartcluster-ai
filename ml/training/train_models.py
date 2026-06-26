import os
import pandas as pd
import numpy as np
import joblib

from ml.preprocessing.data_cleaning import clean_data
from ml.preprocessing.feature_engineering import create_features
from ml.models.cpu_predictor import CpuForecaster
from ml.models.memory_predictor import MemoryForecaster
from ml.models.traffic_predictor import TrafficForecaster
from ml.models.anomaly_detector import AnomalyDetectionEngine

def train_all_models():
    print("Initializing Autonomous AI Retraining Sequence...")
    
    # 1. Paths
    dataset_path = 'ml/datasets/historical_metrics.csv'
    saved_models_dir = 'ml/saved_models/'
    os.makedirs(saved_models_dir, exist_ok=True)
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Historical telemetry CSV not found at {dataset_path}")
        
    # 2. Loading and Preprocessing
    df = pd.read_csv(dataset_path)
    cleaned_df = clean_data(df)
    features_df = create_features(cleaned_df)
    
    # Core Feature columns for models
    X_cols = [
        'hour_sin', 'hour_cos', 'dow_sin', 'dow_cos',
        'cpu_utilization_roll_mean_3', 'cpu_utilization_roll_std_3',
        'memory_usage_roll_mean_3', 'memory_usage_roll_std_3',
        'network_traffic_roll_mean_3', 'network_traffic_roll_std_3'
    ]
    
    X = features_df[X_cols].values
    
    # Let's align shifting (predicting next hour)
    # CPU Target (Shifted by 1 step ahead)
    y_cpu = features_df['cpu_utilization'].shift(-1).fillna(features_df['cpu_utilization'].mean()).values
    # Memory Target
    y_mem = features_df['memory_usage'].shift(-1).fillna(features_df['memory_usage'].mean()).values
    # Traffic Target
    y_traffic = features_df['network_traffic'].shift(-1).fillna(features_df['network_traffic'].mean()).values
    
    print(f"Dataset compiled. Training on {len(X)} records with {len(X_cols)} engineered features.")
    
    # 3. CPU Forecaster Fit
    print("Fitting CPU Forecasters (Linear, Random Forest, Gradient Boosting)...")
    cpu_forecaster = CpuForecaster()
    cpu_forecaster.fit(X, y_cpu)
    print(f"Best CPU Model: {cpu_forecaster.get_best_performance()}")
    
    # 4. Memory Forecaster Fit
    print("Fitting Memory Forecasters (Random Forest, Gradient Boosting)...")
    mem_forecaster = MemoryForecaster()
    mem_forecaster.fit(X, y_mem)
    print(f"Best Memory Model: {mem_forecaster.get_best_performance()}")
    
    # 5. Traffic Forecaster Fit
    print("Fitting Traffic Forecasters (Ridge, Random Forest)...")
    traffic_forecaster = TrafficForecaster()
    traffic_forecaster.fit(X, y_traffic)
    print(f"Best Traffic Model: {traffic_forecaster.get_best_performance()}")
    
    # 6. Anomaly Isolation Forest Fit
    print("Fitting Anomaly Detection Engine (Isolation Forest)...")
    anomaly_detector = AnomalyDetectionEngine()
    anomaly_detector.fit(features_df, ['cpu_utilization', 'memory_usage', 'network_traffic', 'request_rate', 'response_latency', 'error_percentage'])
    
    # 7. Serialization and Saving
    joblib.dump(cpu_forecaster, os.path.join(saved_models_dir, 'cpu_model.joblib'))
    joblib.dump(mem_forecaster, os.path.join(saved_models_dir, 'memory_model.joblib'))
    joblib.dump(traffic_forecaster, os.path.join(saved_models_dir, 'traffic_model.joblib'))
    joblib.dump(anomaly_detector, os.path.join(saved_models_dir, 'anomaly_model.joblib'))
    
    # Save training metadata to registry file
    registry_path = 'ml/training/model_registry.json'
    import json
    registry_data = {
        'cpu_model': {
            'version': '1.0.0',
            'accuracy_r2': cpu_forecaster.get_best_performance()['metrics']['r2'],
            'algorithm': cpu_forecaster.get_best_performance()['model_name'],
            'training_date': pd.Timestamp.now().isoformat()
        },
        'memory_model': {
            'version': '1.0.0',
            'accuracy_r2': mem_forecaster.get_best_performance()['metrics']['r2'],
            'algorithm': mem_forecaster.get_best_performance()['model_name'],
            'training_date': pd.Timestamp.now().isoformat()
        },
        'traffic_model': {
            'version': '1.0.0',
            'accuracy_r2': traffic_forecaster.get_best_performance()['metrics']['r2'],
            'algorithm': traffic_forecaster.get_best_performance()['model_name'],
            'training_date': pd.Timestamp.now().isoformat()
        }
    }
    os.makedirs(os.path.dirname(registry_path), exist_ok=True)
    with open(registry_path, 'w') as f:
        json.dump(registry_data, f, indent=2)
        
    print("ML Pipeline retrained successfully. Artifacts saved in /ml/saved_models/")

if __name__ == '__main__':
    train_all_models()
