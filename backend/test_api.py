"""
RouteSafe AI — Automated Backend API Test Suite
Validates every endpoint defined in Step 2:
1. GET /api/health
2. GET /api/routes
3. POST /api/routes/calculate
4. GET /api/hazards
5. POST /api/hazards
6. POST /api/hazards/report
7. GET /api/dashboard/stats
8. GET /api/dashboard/hotspots
9. GET /api/dashboard/charts
10. POST /api/risk/settings
11. POST /api/risk/heavy-rain
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

# Initialize database
init_db()

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    assert data["status"] == "healthy"
    print("✓ GET /api/health passed")

def test_routes():
    res = client.get("/api/routes")
    assert res.status_code == 200, f"Routes failed: {res.text}"
    data = res.json()
    assert len(data) == 3, f"Expected 3 routes, got {len(data)}"
    names = [r["name"] for r in data]
    assert "Fastest" in names and "Safest" in names and "Balanced" in names
    for r in data:
        assert "risk_score" in r
        assert "risk_level" in r
        assert "risk_factors" in r
        assert "coordinates" in r
    print("✓ GET /api/routes passed (returned Fastest, Safest, Balanced)")

def test_calculate_routes():
    payload = {
        "origin": "South Campus Residence Halls",
        "destination": "State University Quad",
        "heavy_rain": False
    }
    res = client.post("/api/routes/calculate", json=payload)
    assert res.status_code == 200, f"Calculate routes failed: {res.text}"
    data = res.json()
    assert len(data) == 3
    print("✓ POST /api/routes/calculate passed")

def test_hazards():
    # 1. GET hazards
    res = client.get("/api/hazards")
    assert res.status_code == 200, f"Get hazards failed: {res.text}"
    data = res.json()
    assert len(data) >= 1
    print("✓ GET /api/hazards passed")

    # 2. POST hazard
    new_hazard = {
        "type": "Flooding",
        "severity": "High",
        "description": "Flash flooding under railway culvert",
        "location_name": "University Ave Culvert",
        "latitude": 37.8715,
        "longitude": -122.2650
    }
    res = client.post("/api/hazards", json=new_hazard)
    assert res.status_code == 201, f"Create hazard failed: {res.text}"
    created = res.json()
    assert created["location_name"] == "University Ave Culvert"
    print("✓ POST /api/hazards passed")

def test_hazard_report():
    report_payload = {
        "location": "North Gate Pathway",
        "hazard_types": ["Poor Lighting", "Pothole"],
        "severity": "Medium",
        "description": "Unlit stretch with broken sidewalk tiles",
        "latitude": 37.8750,
        "longitude": -122.2590
    }
    res = client.post("/api/hazards/report", json=report_payload)
    assert res.status_code == 201, f"Hazard report failed: {res.text}"
    data = res.json()
    assert data["status"] == "verified"
    print("✓ POST /api/hazards/report passed")

def test_dashboard_stats():
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
    data = res.json()
    assert "active_students" in data
    assert "high_risk_zones" in data
    assert "total_reports" in data
    assert "today_reports" in data
    print("✓ GET /api/dashboard/stats passed")

def test_dashboard_hotspots():
    res = client.get("/api/dashboard/hotspots")
    assert res.status_code == 200, f"Dashboard hotspots failed: {res.text}"
    data = res.json()
    assert "hotspots" in data
    assert len(data["hotspots"]) >= 1
    print("✓ GET /api/dashboard/hotspots passed")

def test_dashboard_charts():
    res = client.get("/api/dashboard/charts")
    assert res.status_code == 200, f"Dashboard charts failed: {res.text}"
    data = res.json()
    assert "hazards_by_type" in data
    assert "risk_distribution" in data
    assert "reports_over_time" in data
    print("✓ GET /api/dashboard/charts passed")

def test_risk_settings():
    payload = {
        "accident_weight": 0.30,
        "flood_weight": 0.20,
        "traffic_weight": 0.20,
        "lighting_weight": 0.15,
        "road_weight": 0.15
    }
    res = client.post("/api/risk/settings", json=payload)
    assert res.status_code == 200, f"Risk settings update failed: {res.text}"
    data = res.json()
    assert data["accident_weight"] == 0.30
    print("✓ POST /api/risk/settings passed")

def test_heavy_rain():
    # Enable heavy rain
    res = client.post("/api/risk/heavy-rain", json={"enabled": True})
    assert res.status_code == 200, f"Heavy rain enable failed: {res.text}"
    data = res.json()
    assert data["heavy_rain_active"] is True
    assert "previous_risk" in data
    assert "new_risk" in data
    assert "risk_change" in data
    assert "affected_factors" in data
    assert "recommended_safer_route" in data
    assert len(data["routes"]) == 3
    print("✓ POST /api/risk/heavy-rain (enable) passed")

    # Disable heavy rain to restore baseline
    res = client.post("/api/risk/heavy-rain", json={"enabled": False})
    assert res.status_code == 200
    data = res.json()
    assert data["heavy_rain_active"] is False
    print("✓ POST /api/risk/heavy-rain (disable) passed")

def run_all_tests():
    print("=" * 60)
    print("Starting RouteSafe AI Backend Automated Verification Suite")
    print("=" * 60)
    test_health()
    test_routes()
    test_calculate_routes()
    test_hazards()
    test_hazard_report()
    test_dashboard_stats()
    test_dashboard_hotspots()
    test_dashboard_charts()
    test_risk_settings()
    test_heavy_rain()
    print("=" * 60)
    print("ALL 11 BACKEND API TEST SUITES PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
