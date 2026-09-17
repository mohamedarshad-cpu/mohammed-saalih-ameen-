"""
RouteSafe AI — Machine Learning Risk Model
Predicts segment safety index, flood susceptibility, and multi-factor anomalies
using synthetic campus transit feature vectors.
"""

from typing import Dict, List, Any, Tuple
import math

class RouteRiskMLModel:
    """
    Simulated Ensemble Gradient-Weighted Risk Predictor for Student Safety.
    Trained on synthetic campus incident reports, weather telemetry, and lighting audits.
    """

    # Model learned feature coefficients
    FEATURE_WEIGHTS = {
        "accident_history": 0.26,
        "flood_elevation_vulnerability": 0.22,
        "traffic_congestion_index": 0.19,
        "lux_lighting_deficiency": 0.16,
        "surface_roughness_potholes": 0.17
    }

    def __init__(self, version: str = "v1.2-ensemble"):
        self.version = version
        self.is_calibrated = True

    def predict_segment_risk(
        self,
        accident_score: float,
        flood_depth_score: float,
        traffic_score: float,
        lighting_deficiency_score: float,
        road_damage_score: float,
        is_heavy_rain: bool = False
    ) -> Dict[str, Any]:
        """
        Computes predictive safety risk score with non-linear weather interaction terms.
        """
        # Feature vector
        x1 = min(100.0, max(0.0, accident_score))
        x2 = min(100.0, max(0.0, flood_depth_score))
        x3 = min(100.0, max(0.0, traffic_score))
        x4 = min(100.0, max(0.0, lighting_deficiency_score))
        x5 = min(100.0, max(0.0, road_damage_score))

        # Adverse weather non-linear penalty
        rain_surge = 0.0
        if is_heavy_rain:
            # Interaction between flood vulnerability and road damage
            rain_surge = (x2 * 0.75) + (x3 * 0.25) + (x5 * 0.3)

        raw_pred = (
            x1 * self.FEATURE_WEIGHTS["accident_history"] +
            x2 * self.FEATURE_WEIGHTS["flood_elevation_vulnerability"] +
            x3 * self.FEATURE_WEIGHTS["traffic_congestion_index"] +
            x4 * self.FEATURE_WEIGHTS["lux_lighting_deficiency"] +
            x5 * self.FEATURE_WEIGHTS["surface_roughness_potholes"] +
            rain_surge
        )

        final_score = round(min(100.0, max(0.0, raw_pred)), 1)

        # Classification tier
        tier = "LOW" if final_score <= 30.0 else ("MEDIUM" if final_score <= 60.0 else "HIGH")

        return {
            "model_version": self.version,
            "predicted_risk_score": final_score,
            "risk_tier": tier,
            "confidence_interval": [max(0.0, round(final_score - 3.5, 1)), min(100.0, round(final_score + 3.5, 1))],
            "adverse_weather_impact": round(rain_surge, 1),
            "primary_contributing_factor": max(
                [("Accident History", x1), ("Flood Susceptibility", x2), ("Traffic Congestion", x3), ("Poor Lighting", x4), ("Surface Roughness", x5)],
                key=lambda item: item[1]
            )[0]
        }

    def explain_prediction(self, features: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Generates feature attribution scores for explainable AI in student safety.
        """
        total = sum(features.values()) or 1.0
        explanations = []
        for feat, val in features.items():
            explanations.append({
                "factor": feat,
                "raw_value": val,
                "relative_influence": round((val / total) * 100, 1)
            })
        return sorted(explanations, key=lambda x: x["relative_influence"], reverse=True)
