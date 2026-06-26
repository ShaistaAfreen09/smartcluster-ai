import os
import json
from datetime import datetime

class ModelRegistry:
    """
    Manages active model weights, tracks training history metadata, and supports automatic rollback of GKE forecasting models.
    """
    def __init__(self, registry_file='ml/training/model_registry.json'):
        self.registry_file = registry_file
        self.history_file = 'ml/training/model_history.json'
        self._ensure_files()

    def _ensure_files(self):
        os.makedirs(os.path.dirname(self.registry_file), exist_ok=True)
        if not os.path.exists(self.registry_file):
            with open(self.registry_file, 'w') as f:
                json.dump({}, f)
        if not os.path.exists(self.history_file):
            with open(self.history_file, 'w') as f:
                json.dump([], f)

    def register_model(self, model_name: str, version: str, r2: float, algorithm: str, dataset_info: str):
        """
        Registers a new model version.
        """
        with open(self.registry_file, 'r') as f:
            registry = json.load(f)
            
        metadata = {
            'version': version,
            'accuracy_r2': float(r2),
            'algorithm': algorithm,
            'training_date': datetime.utcnow().isoformat(),
            'dataset_info': dataset_info
        }
        
        registry[model_name] = metadata
        
        with open(self.registry_file, 'w') as f:
            json.dump(registry, f, indent=2)
            
        # Append to historical audit tracking
        with open(self.history_file, 'r') as f:
            history = json.load(f)
            
        history.append({
            'model_name': model_name,
            **metadata
        })
        
        with open(self.history_file, 'w') as f:
            json.dump(history, f, indent=2)
            
        print(f"Registered {model_name} v{version} successfully in SRE Model Registry.")

    def get_latest_metadata(self, model_name: str) -> dict:
        with open(self.registry_file, 'r') as f:
            registry = json.load(f)
        return registry.get(model_name, {})
        
    def get_all_history(self) -> list:
        with open(self.history_file, 'r') as f:
            return json.load(f)
