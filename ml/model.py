"""
RouteSafe AI — Machine Learning Model Definition
RandomForestRegressor for Student Corridor Transit Risk.

DISCLAIMER:
This model is trained on synthetic/demo data generated for a fictional campus environment.
It is intended for demonstration purposes only. Do not claim real-world prediction accuracy.
"""

import os
from typing import Dict, Any, List, Tuple

try:
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    from sklearn.pipeline import Pipeline
    import joblib
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    np = None
    pd = None
    joblib = None

NUMERICAL_FEATURES = [
    "accident_risk",
    "flood_risk",
    "traffic_risk",
    "lighting_risk",
    "road_condition",
]

CATEGORICAL_FEATURES = [
    "weather_condition",
    "time_of_day",
    "day_type",
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), "route_risk_model.joblib")

def build_model_pipeline() -> Any:
    """
    Constructs an end-to-end scikit-learn Pipeline with preprocessing and RandomForestRegressor.
    """
    if not SKLEARN_AVAILABLE:
        return None

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                NUMERICAL_FEATURES
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES
            )
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    min_samples_split=4,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=-1
                )
            )
        ]
    )

    return pipeline

def save_model(pipeline: Any, filepath: str = MODEL_PATH) -> None:
    """Serializes the trained pipeline artifact to disk."""
    if SKLEARN_AVAILABLE and joblib is not None:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(pipeline, filepath)
        print(f"[Model] Saved RandomForestRegressor pipeline to {filepath}")

def load_model(filepath: str = MODEL_PATH) -> Any:
    """Loads serialized model pipeline from disk if available."""
    if SKLEARN_AVAILABLE and joblib is not None and os.path.exists(filepath):
        try:
            model = joblib.load(filepath)
            return model
        except Exception as e:
            print(f"[Model] Warning: Could not load {filepath}: {e}")
    return None
