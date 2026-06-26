import os
import joblib
import pandas as pd
import numpy as np

def evaluate_production_models():
    """
    Evaluates loaded model performance statistics on recent telemetry.
    """
    saved_models_dir = 'ml/saved_models/'
    cpu_model_path = os.path.join(saved_models_dir, 'cpu_model.joblib')
    
    if not os.path.exists(cpu_model_path):
        print("Models not trained yet. Run train_models.py first.")
        return {}
        
    cpu_forecaster = joblib.load(cpu_model_path)
    mem_forecaster = joblib.load(os.path.join(saved_models_dir, 'memory_model.joblib'))
    traffic_forecaster = joblib.load(os.path.join(saved_models_dir, 'traffic_model.joblib'))
    
    evaluation_report = {
        'cpu': cpu_forecaster.get_best_performance(),
        'memory': mem_forecaster.get_best_performance(),
        'traffic': traffic_forecaster.get_best_performance()
    }
    
    print("SRE ML Evaluation Report:")
    for metric, data in evaluation_report.items():
        print(f"[{metric.upper()}] Best Model: {data.get('model_name')} | Validation R2: {data.get('metrics', {}).get('r2', 0.0):.4f}")
        
    return evaluation_report

if __name__ == '__main__':
    evaluate_production_models()
