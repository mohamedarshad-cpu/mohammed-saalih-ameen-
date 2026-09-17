from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..database import get_connection
from ..schemas import (
    RouteResponse,
    CalculateRouteRequest,
    RiskSettingsUpdate,
    RiskSettingsResponse,
    HeavyRainRequest,
    HeavyRainResponse,
)
from ..services.risk_engine import evaluate_route_record, calculate_risk

router = APIRouter(prefix="/api", tags=["Routes & Risk Calculation"])

def get_current_settings(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM risk_settings WHERE id = 1")
    row = cursor.fetchone()
    if not row:
        return {
            "accident": 0.25,
            "flood": 0.20,
            "traffic": 0.20,
            "lighting": 0.15,
            "road_condition": 0.20,
            "heavy_rain_active": False,
        }
    return {
        "accident": row["accident_weight"],
        "flood": row["flood_weight"],
        "traffic": row["traffic_weight"],
        "lighting": row["lighting_weight"],
        "road_condition": row["road_weight"],
        "heavy_rain_active": bool(row["heavy_rain_active"]),
    }

@router.get("/routes", response_model=List[RouteResponse])
def get_routes(heavy_rain: Optional[bool] = Query(None, description="Override heavy rain state")):
    """
    Returns exactly 3 routes: Fastest, Safest, and Balanced.
    Scores are dynamically computed using current risk weights and weather status.
    """
    conn = get_connection()
    settings = get_current_settings(conn)
    is_rain = settings["heavy_rain_active"] if heavy_rain is None else heavy_rain

    weights = {
        "accident": settings["accident"],
        "flood": settings["flood"],
        "traffic": settings["traffic"],
        "lighting": settings["lighting"],
        "road_condition": settings["road_condition"],
    }

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM route_data ORDER BY CASE name WHEN 'Fastest' THEN 1 WHEN 'Safest' THEN 2 WHEN 'Balanced' THEN 3 ELSE 4 END")
    rows = cursor.fetchall()
    conn.close()

    return [evaluate_route_record(dict(row), weights=weights, heavy_rain=is_rain) for row in rows]

@router.post("/routes/calculate", response_model=List[RouteResponse])
def calculate_routes(payload: CalculateRouteRequest):
    """
    Calculates and returns safety-weighted routes for given student origin & destination.
    Allows testing custom risk factors and simulated adverse weather.
    """
    conn = get_connection()
    settings = get_current_settings(conn)
    is_rain = settings["heavy_rain_active"] if payload.heavy_rain is None else payload.heavy_rain

    weights = payload.custom_weights or {
        "accident": settings["accident"],
        "flood": settings["flood"],
        "traffic": settings["traffic"],
        "lighting": settings["lighting"],
        "road_condition": settings["road_condition"],
    }

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM route_data ORDER BY CASE name WHEN 'Fastest' THEN 1 WHEN 'Safest' THEN 2 WHEN 'Balanced' THEN 3 ELSE 4 END")
    rows = cursor.fetchall()
    conn.close()

    return [evaluate_route_record(dict(row), weights=weights, heavy_rain=is_rain) for row in rows]

@router.post("/risk/heavy-rain", response_model=HeavyRainResponse)
def trigger_heavy_rain(payload: HeavyRainRequest):
    """
    Toggles Heavy Rain adverse weather simulation.
    When enabled:
    - Increases flood risk significantly (x2.2)
    - Slightly increases traffic risk (x1.3) and road condition risk (x1.35)
    - Recalculates every route
    - Returns previous risk, new risk, risk change, affected factors, and recommended safer route.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Get baseline routes before changing state
    settings = get_current_settings(conn)
    weights = {
        "accident": settings["accident"],
        "flood": settings["flood"],
        "traffic": settings["traffic"],
        "lighting": settings["lighting"],
        "road_condition": settings["road_condition"],
    }

    cursor.execute("SELECT * FROM route_data")
    rows = cursor.fetchall()

    prev_routes = [evaluate_route_record(dict(r), weights=weights, heavy_rain=settings["heavy_rain_active"]) for r in rows]
    # Average baseline risk
    prev_avg_risk = round(sum(r.risk_score for r in prev_routes) / len(prev_routes), 1)

    # Update database setting
    cursor.execute("""
        UPDATE risk_settings
        SET heavy_rain_active = ?, updated_at = datetime('now')
        WHERE id = 1
    """, (1 if payload.enabled else 0,))
    conn.commit()

    # Recalculate with new state
    new_routes = [evaluate_route_record(dict(r), weights=weights, heavy_rain=payload.enabled) for r in rows]
    new_avg_risk = round(sum(r.risk_score for r in new_routes) / len(new_routes), 1)
    risk_change = round(new_avg_risk - prev_avg_risk, 1)

    conn.close()

    # Find the safest route
    safest_route = min(new_routes, key=lambda r: r.risk_score)

    affected_factors = [
        "flood risk (+120%)",
        "traffic congestion (+30%)",
        "road slickness / hidden potholes (+35%)",
        "pedestrian visibility (+10%)",
    ] if payload.enabled else ["Restored to baseline dry conditions"]

    msg = (
        "Heavy rain detected. Route safety scores recalculated across all corridors."
        if payload.enabled
        else "Heavy rain cleared. Route safety scores restored to baseline."
    )

    return HeavyRainResponse(
        heavy_rain_active=payload.enabled,
        message=msg,
        previous_risk=prev_avg_risk,
        new_risk=new_avg_risk,
        risk_change=risk_change,
        affected_factors=affected_factors,
        recommended_safer_route=safest_route.name,
        routes=new_routes
    )

@router.post("/risk/settings", response_model=RiskSettingsResponse)
def update_risk_settings(payload: RiskSettingsUpdate):
    """
    Updates the multi-factor risk weights or weather configuration in SQLite.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM risk_settings WHERE id = 1")
    current = cursor.fetchone()
    if not current:
        raise HTTPException(status_code=404, detail="Risk settings not found")

    new_accident = payload.accident_weight if payload.accident_weight is not None else current["accident_weight"]
    new_flood = payload.flood_weight if payload.flood_weight is not None else current["flood_weight"]
    new_traffic = payload.traffic_weight if payload.traffic_weight is not None else current["traffic_weight"]
    new_lighting = payload.lighting_weight if payload.lighting_weight is not None else current["lighting_weight"]
    new_road = payload.road_weight if payload.road_weight is not None else current["road_weight"]
    new_rain = (1 if payload.heavy_rain_active else 0) if payload.heavy_rain_active is not None else current["heavy_rain_active"]

    cursor.execute("""
        UPDATE risk_settings
        SET accident_weight = ?, flood_weight = ?, traffic_weight = ?,
            lighting_weight = ?, road_weight = ?, heavy_rain_active = ?, updated_at = datetime('now')
        WHERE id = 1
    """, (new_accident, new_flood, new_traffic, new_lighting, new_road, new_rain))
    conn.commit()

    cursor.execute("SELECT * FROM risk_settings WHERE id = 1")
    updated = cursor.fetchone()
    conn.close()

    return RiskSettingsResponse(
        accident_weight=updated["accident_weight"],
        flood_weight=updated["flood_weight"],
        traffic_weight=updated["traffic_weight"],
        lighting_weight=updated["lighting_weight"],
        road_weight=updated["road_weight"],
        heavy_rain_active=bool(updated["heavy_rain_active"]),
        flood_multiplier=updated["flood_multiplier"],
        traffic_multiplier=updated["traffic_multiplier"],
        road_multiplier=updated["road_multiplier"],
        updated_at=updated["updated_at"]
    )
