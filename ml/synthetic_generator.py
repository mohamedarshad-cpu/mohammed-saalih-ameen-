"""
RouteSafe AI — Synthetic Dataset Generator
Generates realistic, synthetic campus safety transit datasets for model training & evaluation.
*Note: All data generated here is synthetic demo data around a fictional college campus.*
"""

import random
import json
from typing import List, Dict, Any

class SyntheticCampusDataGenerator:
    """
    Generates synthetic safety records across campus pedestrian corridors.
    """

    CORRIDORS = [
        {"name": "Oxford Street Corridor", "elevation_low": True, "base_traffic": 75, "lighting_rating": "Fair"},
        {"name": "East Bancroft Safety Walk", "elevation_low": False, "base_traffic": 20, "lighting_rating": "Excellent"},
        {"name": "Telegraph Avenue Commercial", "elevation_low": False, "base_traffic": 85, "lighting_rating": "Good"},
        {"name": "Dana Street Bike Path", "elevation_low": False, "base_traffic": 35, "lighting_rating": "Moderate"},
        {"name": "South Campus Underpass", "elevation_low": True, "base_traffic": 60, "lighting_rating": "Poor"},
        {"name": "Hearst Avenue Northway", "elevation_low": False, "base_traffic": 40, "lighting_rating": "Good"}
    ]

    HAZARD_TYPES = ["Flooding", "Poor Lighting", "Accident", "Pothole", "Construction", "High Traffic"]

    @classmethod
    def generate_samples(cls, num_samples: int = 50) -> List[Dict[str, Any]]:
        samples = []
        for i in range(num_samples):
            corr = random.choice(cls.CORRIDORS)
            is_rain = random.choice([True, False, False]) # 33% chance of rain in synthetic sample

            flood_base = random.uniform(50, 95) if corr["elevation_low"] else random.uniform(5, 30)
            traffic_base = random.uniform(corr["base_traffic"] - 10, corr["base_traffic"] + 15)
            lighting_deficiency = 10 if corr["lighting_rating"] == "Excellent" else (40 if corr["lighting_rating"] == "Good" else 75)

            samples.append({
                "sample_id": f"SYNTH-{1000 + i}",
                "corridor_name": corr["name"],
                "is_heavy_rain": is_rain,
                "accident_risk": round(random.uniform(15, 80), 1),
                "flood_risk": round(min(100.0, flood_base * (2.2 if is_rain else 1.0)), 1),
                "traffic_risk": round(min(100.0, traffic_base * (1.3 if is_rain else 1.0)), 1),
                "lighting_risk": round(lighting_deficiency, 1),
                "road_condition_risk": round(random.uniform(20, 70) * (1.35 if is_rain else 1.0), 1),
                "reported_hazards": random.sample(cls.HAZARD_TYPES, k=random.randint(0, 2))
            })
        return samples

if __name__ == "__main__":
    data = SyntheticCampusDataGenerator.generate_samples(5)
    print("Generated 5 synthetic campus safety samples:")
    print(json.dumps(data, indent=2))
