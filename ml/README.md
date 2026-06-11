# Machine Learning

The `ml/` folder contains model training, inference, and data processing for SmartCluster AI.

## Purpose

- Process historical Kubernetes metrics and resource usage data.
- Train predictive resource forecasting models using Scikit-learn.
- Build anomaly detection models and recommendation engines.
- Store model artifacts and reusable inference pipelines.

## Key Subfolders

- `data/` - raw and processed datasets used for model training
- `models/` - trained model artifacts and serialized objects
- `notebooks/` - exploratory data analysis and model validation notebooks
- `training/` - scripts and modules for model training workflows
- `inference/` - reusable inference utilities for prediction and scoring
- `tests/` - tests for ML pipeline components and data validation

## Recommended Workflow

1. Define data schemas and feature engineering pipelines.
2. Train forecasting models on historical resource usage.
3. Validate anomaly detection and recommendation outputs.
4. Export model artifacts for backend consumption.
