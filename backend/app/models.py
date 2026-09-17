from dataclasses import dataclass
from typing import List, Optional

@dataclass
class HazardRecord:
    id: str
    type: str
    severity: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    reported_at: str
    verified_count: int
    image_url: Optional[str]
    is_active: bool

@dataclass
class RouteRecord:
    id: str
    name: str
    category: str
    distance: str
    travel_time: str
    base_accident_risk: float
    base_flood_risk: float
    base_traffic_risk: float
    base_lighting_risk: float
    base_road_risk: float
    description: str
    highlights: List[str]
    coordinates: List[List[float]]

@dataclass
class RiskSettingsRecord:
    accident_weight: float
    flood_weight: float
    traffic_weight: float
    lighting_weight: float
    road_weight: float
    heavy_rain_active: bool
    flood_multiplier: float
    traffic_multiplier: float
    road_multiplier: float
