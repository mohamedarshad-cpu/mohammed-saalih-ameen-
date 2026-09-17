"""
RouteSafe AI — Model Training Script
Trains a RandomForestRegressor on synthetic student safety transit records.

DISCLAIMER:
All location, hazard, and ML training data used here are synthetic and intended
for demonstration purposes. Do not claim real-world prediction accuracy.
"""

import os
import sys
from typing import Dict, Any

from .dataset import generate_synthetic_dataset
from .model import build_model_pipeline, save_model, MODEL_PATH, SKLEARN_AVAILABLE

def train():
    """Generates synthetic dataset, fits RandomForestRegressor, evaluates, and exports artifact."""
    print("=" * 60)
    print("RouteSafe AI — ML Training Pipeline")
    print("Architecture: Preprocessor + RandomForestRegressor (n_estimators=100)")
    print("Disclaimer: Trained strictly on synthetic campus safety data for demonstration.")
    print("=" * 60)

    if not SKLEARN_AVAILABLE:
        print("[Train] Scikit-learn or pandas is not installed in the current environment.")
        return None

    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    # 1. Generate synthetic dataset
    dataset_csv = os.path.join(os.path.dirname(__file__), "synthetic_safety_dataset.csv")
    df = generate_synthetic_dataset(n_samples=2000, seed=42, output_path=dataset_csv)

    feature_cols = [
        "accident_risk",
        "flood_risk",
        "traffic_risk",
        "lighting_risk",
        "road_condition",
        "weather_condition",
        "time_of_day",
        "day_type"
    ]
    target_col = "risk_score"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"[Train] Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # 2. Build Pipeline
    pipeline = build_model_pipeline()
    if pipeline is None:
        print("[Train] Error building model pipeline.")
        return None

    # 3. Train
    print("[Train] Fitting RandomForestRegressor...")
    pipeline.fit(X_train, y_train)

    # 4. Evaluate
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("-" * 60)
    print("Model Evaluation Metrics on Synthetic Test Partition:")
    print(f"  Mean Absolute Error (MAE): {mae:.2f} points (scale 0-100)")
    print(f"  Root Mean Squared Error (RMSE): {rmse:.2f}")
    print(f"  R² Score: {r2:.4f}")
    print("-" * 60)

    # 5. Save Model
    save_model(pipeline, MODEL_PATH)
    print(f"[Train] Model artifact saved to: {MODEL_PATH}")

    return {
        "mae": float(round(mae, 2)),
        "rmse": float(round(rmse, 2)),
        "r2": float(round(r2, 4)),
        "samples": len(df)
    }

if __name__ == "__main__":
    train()
