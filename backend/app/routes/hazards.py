from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid
from ..database import get_connection
from ..schemas import HazardResponse, HazardCreate, HazardReportCreate, HazardReportResponse
import json

router = APIRouter(prefix="/api", tags=["Hazards"])

@router.get("/hazards", response_model=List[HazardResponse])
def get_hazards(
    active_only: bool = Query(True, description="Filter for active hazards only"),
    severity: Optional[str] = Query(None, description="Filter by severity: Low, Medium, High")
):
    """
    Returns verified hazards plotted across student transit corridors.
    """
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM hazards WHERE 1=1"
    params = []

    if active_only:
        query += " AND is_active = 1"
    if severity:
        query += " AND LOWER(severity) = LOWER(?)"
        params.append(severity)

    query += " ORDER BY id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [
        HazardResponse(
            id=row["id"],
            type=row["type"],
            severity=row["severity"],
            description=row["description"],
            location_name=row["location_name"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            reported_at=row["reported_at"],
            verified_count=row["verified_count"],
            image_url=row["image_url"],
            is_active=bool(row["is_active"])
        )
        for row in rows
    ]

@router.post("/hazards", response_model=HazardResponse, status_code=201)
def create_hazard(payload: HazardCreate):
    """
    Directly creates an active verified hazard entry.
    """
    hazard_id = f"haz-{uuid.uuid4().hex[:8]}"
    reported_at = "Just now"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO hazards (
            id, type, severity, description, location_name,
            latitude, longitude, reported_at, verified_count, image_url, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
    """, (
        hazard_id, payload.type, payload.severity, payload.description,
        payload.location_name, payload.latitude, payload.longitude,
        reported_at, payload.image_url
    ))
    conn.commit()
    conn.close()

    return HazardResponse(
        id=hazard_id,
        type=payload.type,
        severity=payload.severity,
        description=payload.description,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        reported_at=reported_at,
        verified_count=1,
        image_url=payload.image_url,
        is_active=True
    )

@router.post("/hazards/report", response_model=HazardReportResponse, status_code=201)
def submit_hazard_report(payload: HazardReportCreate):
    """
    Receives student crowdsourced incident reports and pushes them to the safety queue.
    Also auto-converts to an active hazard if severity is Medium or High.
    """
    report_id = f"rep-{uuid.uuid4().hex[:8]}"
    lat = payload.latitude or 37.8685
    lng = payload.longitude or -122.2625

    conn = get_connection()
    cursor = conn.cursor()

    # Save to hazard_reports
    cursor.execute("""
        INSERT INTO hazard_reports (
            id, location, hazard_types, severity, description,
            photo_url, latitude, longitude, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified', datetime('now'))
    """, (
        report_id, payload.location, json.dumps(payload.hazard_types),
        payload.severity, payload.description, payload.photo_url,
        lat, lng
    ))

    # Also register in active hazards so the live map picks it up
    primary_type = payload.hazard_types[0] if payload.hazard_types else "Road Hazard"
    cursor.execute("""
        INSERT INTO hazards (
            id, type, severity, description, location_name,
            latitude, longitude, reported_at, verified_count, image_url, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Just now', 1, ?, 1)
    """, (
        f"haz-{report_id}", primary_type, payload.severity,
        payload.description, payload.location, lat, lng, payload.photo_url
    ))

    conn.commit()
    conn.close()

    return HazardReportResponse(
        id=report_id,
        location=payload.location,
        hazard_types=payload.hazard_types,
        severity=payload.severity,
        description=payload.description,
        photo_url=payload.photo_url,
        latitude=lat,
        longitude=lng,
        status="verified",
        created_at="Just now"
    )
