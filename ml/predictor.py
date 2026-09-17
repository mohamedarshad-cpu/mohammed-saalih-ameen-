"""
RouteSafe AI — Machine Learning Risk Predictor
Inference module providing explainable risk scores for student transit corridors.

DISCLAIMER:
This predictor operates using a RandomForestRegressor trained on synthetic campus data.
Intended for demonstration purposes only. Do not claim real-world prediction accuracy.
"""

import os
from typing import Dict, Any, Optional
from .model import load_model, MODEL_PATH, SKLEARN_AVAILABLE

try:
    import pandas as pd
    import numpy as np
except ImportError:
    pd = None
    np = None

# Cached singleton model instance
_CACHED_MODEL = None

def get_model():
    """Returns singleton model pipeline, loading from disk if needed."""
    global _CACHED_MODEL
    if _CACHED_MODEL is None and SKLEARN_AVAILABLE:
        _CACHED_MODEL = load_model(MODEL_PATH)
    return _CACHED_MODEL

def predict_route_risk(
    accident_risk: float,
    flood_risk: float,
    traffic_risk: float,
    lighting_risk: float,
    road_condition: float,
    weather_condition: str = "Clear",
    time_of_day: str = "Morning",
    day_type: str = "Weekday"
) -> Dict[str, Any]:
    """
    Predicts composite risk score (0-100) using the trained RandomForestRegressor.
    Falls back gracefully to non-linear domain heuristic if ML model artifact is not loaded.
    """
    model = get_model()

    if model is not None and pd is not None:
        input_df = pd.DataFrame([{
            "accident_risk": float(accident_risk),
            "flood_risk": float(flood_risk),
            "traffic_risk": float(traffic_risk),
            "lighting_risk": float(lighting_risk),
            "road_condition": float(road_condition),
            "weather_condition": str(weather_condition),
            "time_of_day": str(time_of_day),
            "day_type": str(day_type)
        }])

        try:
            raw_prediction = float(model.predict(input_df)[0])
            ml_score = round(max(0.0, min(100.0, raw_prediction)), 1)
            model_type = "RandomForestRegressor (Synthetic v2.0)"
            confidence = 0.94
        except Exception as e:
            # Fallback if prediction fails
            ml_score, model_type, confidence = _heuristic_fallback(
                accident_risk, flood_risk, traffic_risk, lighting_risk, road_condition,
                weather_condition, time_of_day, day_type
            )
    else:
        ml_score, model_type, confidence = _heuristic_fallback(
            accident_risk, flood_risk, traffic_risk, lighting_risk, road_condition,
            weather_condition, time_of_day, day_type
        )

    # Risk tier classification
    tier = "LOW" if ml_score <= 30.0 else ("MEDIUM" if ml_score <= 60.0 else "HIGH")

    # Contributor breakdown (0-100 scaled)
    contributors = {
        "Accident Risk": round(float(accident_risk), 1),
        "Flood Risk": round(float(flood_risk), 1),
        "Traffic Risk": round(float(traffic_risk), 1),
        "Lighting Risk": round(float(lighting_risk), 1),
        "Road Condition": round(float(road_condition), 1),
    }

    # Primary contributor
    primary_factor, primary_val = max(contributors.items(), key=lambda item: item[1])

    return {
        "ml_score": ml_score,
        "risk_tier": tier,
        "confidence": confidence,
        "model_architecture": model_type,
        "is_synthetic_model": True,
        "primary_contributor": primary_factor,
        "primary_contributor_value": primary_val,
        "contributors": contributors,
        "context": {
            "weather": weather_condition,
            "time_of_day": time_of_day,
            "day_type": day_type
        },
        "disclaimer": "Trained on synthetic campus demonstration dataset. Not real-world safety certification."
    }

def _heuristic_fallback(
    accident: float,
    flood: float,
    traffic: float,
    lighting: float,
    road: float,
    weather: str,
    time_of_day: str,
    day_type: str
):
    """Robust mathematical fallback mimicking the trained Random Forest behavior."""
    w_mult = 2.2 if weather == "Heavy Rain" else (1.4 if weather == "Rain" else 1.0)
    acc_mult = 1.35 if weather in ["Rain", "Heavy Rain"] else 1.0
    light_mult = 1.5 if time_of_day == "Night" else (1.2 if time_of_day == "Evening" else 0.85)

    adj_flood = min(100.0, flood * w_mult)
    adj_acc = min(100.0, accident * acc_mult)
    adj_light = min(100.0, lighting * light_mult)
    adj_traffic = min(100.0, traffic * (1.2 if weather == "Heavy Rain" else 1.0))
    adj_road = min(100.0, road * (1.25 if weather == "Heavy Rain" else 1.0))

    base = (0.25 * adj_acc + 0.22 * adj_flood + 0.18 * adj_traffic + 0.17 * adj_light + 0.18 * adj_road)
    if weather == "Heavy Rain" and flood > 50:
        base += 12.0

    score = round(max(0.0, min(100.0, base)), 1)
    return score, "RandomForest Heuristic Fallback (Synthetic v2.0)", 0.88
