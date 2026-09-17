"""
RouteSafe AI — Synthetic Dataset Generator
Generates realistic, explainable synthetic datasets for student corridor transit risk modeling.

DISCLAIMER:
All location, hazard, and ML training data generated here are strictly synthetic
and intended for hackathon demonstration purposes. Do not claim real-world prediction accuracy.
"""

import os
import random
from typing import List, Dict, Any, Optional

try:
    import pandas as pd
    import numpy as np
except ImportError:
    pd = None
    np = None

WEATHER_CONDITIONS = ["Clear", "Rain", "Heavy Rain", "Fog"]
TIMES_OF_DAY = ["Morning", "Afternoon", "Evening", "Night"]
DAY_TYPES = ["Weekday", "Weekend"]

def generate_synthetic_dataset(
    n_samples: int = 1200,
    seed: int = 42,
    output_path: Optional[str] = None
) -> Any:
    """
    Generates synthetic route segment samples containing:
    - accident_risk (0-100)
    - flood_risk (0-100)
    - traffic_risk (0-100)
    - lighting_risk (0-100)
    - road_condition (0-100)
    - weather_condition (Clear, Rain, Heavy Rain, Fog)
    - time_of_day (Morning, Afternoon, Evening, Night)
    - day_type (Weekday, Weekend)
    - risk_score (0-100, target)
    """
    random.seed(seed)
    if np is not None:
        np.random.seed(seed)

    records: List[Dict[str, Any]] = []

    for i in range(n_samples):
        # Base independent risk attributes
        accident_risk = round(random.uniform(5.0, 90.0), 1)
        flood_risk = round(random.uniform(5.0, 95.0), 1)
        traffic_risk = round(random.uniform(10.0, 90.0), 1)
        lighting_risk = round(random.uniform(5.0, 85.0), 1)
        road_condition = round(random.uniform(10.0, 85.0), 1)

        weather = random.choices(
            WEATHER_CONDITIONS,
            weights=[0.45, 0.25, 0.18, 0.12]
        )[0]

        time_of_day = random.choices(
            TIMES_OF_DAY,
            weights=[0.30, 0.30, 0.25, 0.15]
        )[0]

        day_type = random.choices(
            DAY_TYPES,
            weights=[0.72, 0.28]
        )[0]

        # Domain interaction modeling for realistic target score
        weather_flood_mult = 2.2 if weather == "Heavy Rain" else (1.4 if weather == "Rain" else 1.0)
        weather_accident_mult = 1.35 if weather in ["Rain", "Heavy Rain"] else (1.2 if weather == "Fog" else 1.0)
        time_lighting_mult = 1.6 if time_of_day == "Night" else (1.25 if time_of_day == "Evening" else 0.8)
        traffic_rush_mult = 1.3 if (time_of_day in ["Morning", "Evening"] and day_type == "Weekday") else 0.95

        # Weighted combination with non-linear penalties
        adj_flood = min(100.0, flood_risk * weather_flood_mult)
        adj_accident = min(100.0, accident_risk * weather_accident_mult)
        adj_lighting = min(100.0, lighting_risk * time_lighting_mult)
        adj_traffic = min(100.0, traffic_risk * traffic_rush_mult)
        adj_road = min(100.0, road_condition * (1.2 if weather == "Heavy Rain" else 1.0))

        # Base composite formula
        composite = (
            0.25 * adj_accident +
            0.22 * adj_flood +
            0.18 * adj_traffic +
            0.17 * adj_lighting +
            0.18 * adj_road
        )

        # Compound penalty for high flood + heavy rain
        if weather == "Heavy Rain" and flood_risk > 50:
            composite += 12.0

        # Compound penalty for night + poor lighting
        if time_of_day == "Night" and lighting_risk > 50:
            composite += 8.0

        # Slight noise (+/- 2.5) for realistic ML variance
        noise = random.uniform(-2.5, 2.5)
        target_score = round(max(0.0, min(100.0, composite + noise)), 1)

        records.append({
            "accident_risk": accident_risk,
            "flood_risk": flood_risk,
            "traffic_risk": traffic_risk,
            "lighting_risk": lighting_risk,
            "road_condition": road_condition,
            "weather_condition": weather,
            "time_of_day": time_of_day,
            "day_type": day_type,
            "risk_score": target_score,
        })

    if pd is not None:
        df = pd.DataFrame(records)
        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            df.to_csv(output_path, index=False)
            print(f"[Dataset] Saved {len(df)} synthetic samples to {output_path}")
        return df
    else:
        return records

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "synthetic_safety_dataset.csv")
    generate_synthetic_dataset(n_samples=1500, output_path=out)
