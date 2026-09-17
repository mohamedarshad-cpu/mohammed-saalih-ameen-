from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from ..database import get_connection
from ..schemas import HazardReportResponse, HazardReportCreate

router = APIRouter(prefix="/api/reports", tags=["Hazard Reports"])

@router.get("", response_model=List[HazardReportResponse])
def get_reports(limit: int = Query(20, ge=1, le=100)):
    """
    Returns list of submitted student hazard reports.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hazard_reports ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        types = json.loads(row["hazard_types"]) if row["hazard_types"] else []
        results.append(
            HazardReportResponse(
                id=row["id"],
                location=row["location"],
                hazard_types=types,
                severity=row["severity"],
                description=row["description"],
                photo_url=row["photo_url"],
                latitude=row["latitude"],
                longitude=row["longitude"],
                status=row["status"],
                created_at=row["created_at"]
            )
        )
    return results

@router.get("/{report_id}", response_model=HazardReportResponse)
def get_report_by_id(report_id: str):
    """
    Returns single hazard report details by ID.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hazard_reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Report not found")

    types = json.loads(row["hazard_types"]) if row["hazard_types"] else []
    return HazardReportResponse(
        id=row["id"],
        location=row["location"],
        hazard_types=types,
        severity=row["severity"],
        description=row["description"],
        photo_url=row["photo_url"],
        latitude=row["latitude"],
        longitude=row["longitude"],
        status=row["status"],
        created_at=row["created_at"]
    )
