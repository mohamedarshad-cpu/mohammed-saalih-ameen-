from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RiskFactors(BaseModel):
    accident: float = Field(..., description="Accident risk sub-score (0-100)")
    flood: float = Field(..., description="Flood risk sub-score (0-100)")
    traffic: float = Field(..., description="Traffic congestion risk sub-score (0-100)")
    lighting: float = Field(..., description="Poor lighting risk sub-score (0-100)")
    road_condition: float = Field(..., description="Road condition / pothole risk sub-score (0-100)")

class RouteResponse(BaseModel):
    id: str
    name: str = Field(..., description="Route name (Fastest, Safest, Balanced)")
    category: str
    distance: str
    travel_time: str
    risk_score: float = Field(..., description="Weighted composite risk score (0-100)")
    risk_level: str = Field(..., description="LOW, MEDIUM, or HIGH")
    risk_factors: RiskFactors
    coordinates: List[List[float]]
    description: str
    highlights: List[str]

class CalculateRouteRequest(BaseModel):
    origin: str = Field("South Campus Residence Halls", description="Current student location")
    destination: str = Field("State University — Main Gate & Quad", description="College destination")
    heavy_rain: Optional[bool] = Field(None, description="Override heavy rain simulation state")
    custom_weights: Optional[Dict[str, float]] = Field(None, description="Optional custom weights")

class HazardCreate(BaseModel):
    type: str
    severity: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None

class HazardResponse(BaseModel):
    id: str
    type: str
    severity: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    reported_at: str
    verified_count: int
    image_url: Optional[str] = None
    is_active: bool

class HazardReportCreate(BaseModel):
    location: str
    hazard_types: List[str]
    severity: str
    description: str
    photo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class HazardReportResponse(BaseModel):
    id: str
    location: str
    hazard_types: List[str]
    severity: str
    description: str
    photo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    created_at: str

class DashboardStatsResponse(BaseModel):
    active_students: int
    high_risk_zones: int
    total_reports: int
    today_reports: int
    safe_corridors: int
    weather_condition: str

class HotspotItem(BaseModel):
    id: str
    type: str
    severity: str
    location_name: str
    coordinates: List[float]
    description: str
    risk_contribution: float

class DashboardHotspotsResponse(BaseModel):
    total_hotspots: int
    hotspots: List[HotspotItem]

class DashboardChartsResponse(BaseModel):
    hazards_by_type: List[Dict[str, Any]]
    risk_distribution: List[Dict[str, Any]]
    reports_over_time: List[Dict[str, Any]]

class RiskSettingsUpdate(BaseModel):
    accident_weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    flood_weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    traffic_weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    lighting_weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    road_weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    heavy_rain_active: Optional[bool] = None

class RiskSettingsResponse(BaseModel):
    accident_weight: float
    flood_weight: float
    traffic_weight: float
    lighting_weight: float
    road_weight: float
    heavy_rain_active: bool
    flood_multiplier: float
    traffic_multiplier: float
    road_multiplier: float
    updated_at: str

class HeavyRainRequest(BaseModel):
    enabled: bool

class HeavyRainResponse(BaseModel):
    heavy_rain_active: bool
    message: str
    previous_risk: float
    new_risk: float
    risk_change: float
    affected_factors: List[str]
    recommended_safer_route: str
    routes: List[RouteResponse]
