from typing import Dict, Tuple, List, Optional
from ..schemas import RiskFactors, RouteResponse
import json

# Default Risk Weights (sum = 1.0 / 100%)
DEFAULT_WEIGHTS = {
    "accident": 0.25,
    "flood": 0.20,
    "traffic": 0.20,
    "lighting": 0.15,
    "road_condition": 0.20,
}

# Heavy Rain Multipliers
RAIN_MULTIPLIERS = {
    "flood": 2.2,          # High increase in flood vulnerability
    "traffic": 1.3,        # Slight increase in traffic congestion / braking distances
    "road_condition": 1.35,# Slight increase in road slickness and hidden potholes
    "lighting": 1.1,       # Rain reduces visibility
    "accident": 1.25,      # Wet roads increase hydroplaning risk
}

def calculate_risk(
    accident: float,
    flood: float,
    traffic: float,
    lighting: float,
    road_condition: float,
    weights: Optional[Dict[str, float]] = None,
    heavy_rain: bool = False
) -> Tuple[float, RiskFactors]:
    """
    Calculates weighted composite risk score normalized between 0 and 100.

    Formula:
    risk = (
        accident * accident_weight +
        flood * flood_weight +
        traffic * traffic_weight +
        lighting * lighting_weight +
        road_condition * road_weight
    )
    """
    active_weights = weights or DEFAULT_WEIGHTS

    # Apply heavy rain multipliers if adverse weather is active
    if heavy_rain:
        adj_flood = min(100.0, flood * RAIN_MULTIPLIERS["flood"])
        adj_traffic = min(100.0, traffic * RAIN_MULTIPLIERS["traffic"])
        adj_road = min(100.0, road_condition * RAIN_MULTIPLIERS["road_condition"])
        adj_lighting = min(100.0, lighting * RAIN_MULTIPLIERS["lighting"])
        adj_accident = min(100.0, accident * RAIN_MULTIPLIERS["accident"])
    else:
        adj_flood = flood
        adj_traffic = traffic
        adj_road = road_condition
        adj_lighting = lighting
        adj_accident = accident

    # Normalize weights to ensure they sum to 1.0
    weight_sum = (
        active_weights.get("accident", 0.25) +
        active_weights.get("flood", 0.20) +
        active_weights.get("traffic", 0.20) +
        active_weights.get("lighting", 0.15) +
        active_weights.get("road_condition", 0.20)
    )
    if weight_sum <= 0:
        weight_sum = 1.0

    w_accident = active_weights.get("accident", 0.25) / weight_sum
    w_flood = active_weights.get("flood", 0.20) / weight_sum
    w_traffic = active_weights.get("traffic", 0.20) / weight_sum
    w_lighting = active_weights.get("lighting", 0.15) / weight_sum
    w_road = active_weights.get("road_condition", 0.20) / weight_sum

    raw_score = (
        adj_accident * w_accident +
        adj_flood * w_flood +
        adj_traffic * w_traffic +
        adj_lighting * w_lighting +
        adj_road * w_road
    )

    # Normalize between 0 and 100
    final_score = round(max(0.0, min(100.0, raw_score)), 1)

    factors = RiskFactors(
        accident=round(adj_accident, 1),
        flood=round(adj_flood, 1),
        traffic=round(adj_traffic, 1),
        lighting=round(adj_lighting, 1),
        road_condition=round(adj_road, 1),
    )

    return final_score, factors

def get_risk_level(score: float) -> str:
    """
    Returns risk classification:
    0–30: LOW
    31–60: MEDIUM
    61–100: HIGH
    """
    if score <= 30.0:
        return "LOW"
    elif score <= 60.0:
        return "MEDIUM"
    else:
        return "HIGH"

def get_risk_factors(
    base_factors: Dict[str, float],
    heavy_rain: bool = False
) -> RiskFactors:
    """Returns populated RiskFactors accounting for weather modifiers."""
    if heavy_rain:
        return RiskFactors(
            accident=min(100.0, round(base_factors.get("accident", 20.0) * RAIN_MULTIPLIERS["accident"], 1)),
            flood=min(100.0, round(base_factors.get("flood", 20.0) * RAIN_MULTIPLIERS["flood"], 1)),
            traffic=min(100.0, round(base_factors.get("traffic", 20.0) * RAIN_MULTIPLIERS["traffic"], 1)),
            lighting=min(100.0, round(base_factors.get("lighting", 20.0) * RAIN_MULTIPLIERS["lighting"], 1)),
            road_condition=min(100.0, round(base_factors.get("road_condition", 20.0) * RAIN_MULTIPLIERS["road_condition"], 1)),
        )
    return RiskFactors(
        accident=round(base_factors.get("accident", 20.0), 1),
        flood=round(base_factors.get("flood", 20.0), 1),
        traffic=round(base_factors.get("traffic", 20.0), 1),
        lighting=round(base_factors.get("lighting", 20.0), 1),
        road_condition=round(base_factors.get("road_condition", 20.0), 1),
    )

def evaluate_route_record(
    route_row: dict,
    weights: Optional[Dict[str, float]] = None,
    heavy_rain: bool = False
) -> RouteResponse:
    """Evaluates a raw SQLite route record and produces a typed RouteResponse."""
    coords = json.loads(route_row["coordinates"]) if isinstance(route_row["coordinates"], str) else route_row["coordinates"]
    highlights = json.loads(route_row["highlights"]) if isinstance(route_row["highlights"], str) else route_row["highlights"]

    risk_score, factors = calculate_risk(
        accident=float(route_row["base_accident_risk"]),
        flood=float(route_row["base_flood_risk"]),
        traffic=float(route_row["base_traffic_risk"]),
        lighting=float(route_row["base_lighting_risk"]),
        road_condition=float(route_row["base_road_risk"]),
        weights=weights,
        heavy_rain=heavy_rain
    )

    risk_level = get_risk_level(risk_score)

    return RouteResponse(
        id=route_row["id"],
        name=route_row["name"],
        category=route_row["category"],
        distance=route_row["distance"],
        travel_time=route_row["travel_time"],
        risk_score=risk_score,
        risk_level=risk_level,
        risk_factors=factors,
        coordinates=coords,
        description=route_row["description"],
        highlights=highlights
    )
