import sqlite3
import json
import os
from pathlib import Path
from typing import Generator

# SQLite database file located in backend/
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "routesafe.db"

def get_connection() -> sqlite3.Connection:
    """Returns a SQLite connection configured with dict-like row access."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema and seeds initial synthetic data."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. hazards table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hazards (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            location_name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            reported_at TEXT NOT NULL,
            verified_count INTEGER DEFAULT 1,
            image_url TEXT,
            is_active INTEGER DEFAULT 1
        )
    """)

    # 2. route_data table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS route_data (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            distance TEXT NOT NULL,
            travel_time TEXT NOT NULL,
            base_accident_risk REAL NOT NULL,
            base_flood_risk REAL NOT NULL,
            base_traffic_risk REAL NOT NULL,
            base_lighting_risk REAL NOT NULL,
            base_road_risk REAL NOT NULL,
            description TEXT NOT NULL,
            highlights TEXT NOT NULL,
            coordinates TEXT NOT NULL
        )
    """)

    # 3. hazard_reports table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hazard_reports (
            id TEXT PRIMARY KEY,
            location TEXT NOT NULL,
            hazard_types TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT NOT NULL,
            photo_url TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'pending',
            created_at TEXT NOT NULL
        )
    """)

    # 4. students table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            current_route_id TEXT,
            last_active TEXT NOT NULL
        )
    """)

    # 5. risk_settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            accident_weight REAL NOT NULL DEFAULT 0.25,
            flood_weight REAL NOT NULL DEFAULT 0.20,
            traffic_weight REAL NOT NULL DEFAULT 0.20,
            lighting_weight REAL NOT NULL DEFAULT 0.15,
            road_weight REAL NOT NULL DEFAULT 0.20,
            heavy_rain_active INTEGER NOT NULL DEFAULT 0,
            flood_multiplier REAL NOT NULL DEFAULT 2.2,
            traffic_multiplier REAL NOT NULL DEFAULT 1.3,
            road_multiplier REAL NOT NULL DEFAULT 1.35,
            updated_at TEXT NOT NULL
        )
    """)

    conn.commit()
    seed_demo_data(conn)
    conn.close()

def seed_demo_data(conn: sqlite3.Connection):
    """Seeds synthetic demo data if tables are empty."""
    cursor = conn.cursor()

    # Check risk_settings
    cursor.execute("SELECT COUNT(*) FROM risk_settings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO risk_settings (
                id, accident_weight, flood_weight, traffic_weight,
                lighting_weight, road_weight, heavy_rain_active,
                flood_multiplier, traffic_multiplier, road_multiplier, updated_at
            ) VALUES (1, 0.25, 0.20, 0.20, 0.15, 0.20, 0, 2.2, 1.3, 1.35, datetime('now'))
        """)

    # Check route_data
    cursor.execute("SELECT COUNT(*) FROM route_data")
    if cursor.fetchone()[0] == 0:
        # Route 1: Fastest
        fastest_coords = [
            [37.8655, -122.2685],
            [37.8675, -122.2680],
            [37.8708, -122.2661],
            [37.8725, -122.2645],
            [37.8740, -122.2615],
            [37.8748, -122.2588]
        ]
        cursor.execute("""
            INSERT INTO route_data (
                id, name, category, distance, travel_time,
                base_accident_risk, base_flood_risk, base_traffic_risk,
                base_lighting_risk, base_road_risk, description, highlights, coordinates
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "route-fastest",
            "Fastest",
            "Fastest",
            "3.8 km",
            "22 min",
            65.0, # accident
            72.0, # flood (vulnerable to underpass)
            80.0, # traffic
            55.0, # lighting
            68.0, # road condition
            "Direct transit route via Oxford St & Telegraph corridor. Shortest transit time but passes through heavy traffic and underpass flooding choke point.",
            json.dumps(["Shortest travel time", "Passes Oxford underpass", "High traffic volume during rush hour"]),
            json.dumps(fastest_coords)
        ))

        # Route 2: Safest
        safest_coords = [
            [37.8655, -122.2685],
            [37.8650, -122.2650],
            [37.8652, -122.2610],
            [37.8670, -122.2565],
            [37.8710, -122.2545],
            [37.8738, -122.2560],
            [37.8748, -122.2588]
        ]
        cursor.execute("""
            INSERT INTO route_data (
                id, name, category, distance, travel_time,
                base_accident_risk, base_flood_risk, base_traffic_risk,
                base_lighting_risk, base_road_risk, description, highlights, coordinates
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "route-safest",
            "Safest",
            "Safest",
            "4.9 km",
            "29 min",
            20.0, # accident
            15.0, # flood (elevated terrain)
            25.0, # traffic
            18.0, # lighting (continuous LED Blue-Light)
            35.0, # road condition
            "Campus Safety Blue-Light corridor with 100% active LED streetlighting, emergency pillars, and continuous student patrol presence.",
            json.dumps(["Blue Light emergency phones", "High pedestrian visibility", "Zero flood or obstacle alerts"]),
            json.dumps(safest_coords)
        ))

        # Route 3: Balanced
        balanced_coords = [
            [37.8655, -122.2685],
            [37.8680, -122.2660],
            [37.8700, -122.2625],
            [37.8725, -122.2600],
            [37.8748, -122.2588]
        ]
        cursor.execute("""
            INSERT INTO route_data (
                id, name, category, distance, travel_time,
                base_accident_risk, base_flood_risk, base_traffic_risk,
                base_lighting_risk, base_road_risk, description, highlights, coordinates
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "route-balanced",
            "Balanced",
            "Balanced",
            "4.3 km",
            "25 min",
            40.0, # accident
            35.0, # flood
            45.0, # traffic
            40.0, # lighting
            55.0, # road condition
            "Even balance between travel time and well-monitored roads. Bypasses the severe Oxford flood zone via residential avenues.",
            json.dumps(["Moderate travel time", "Bypasses low-lying underpass", "Well-paved residential lanes"]),
            json.dumps(balanced_coords)
        ))

    # Check hazards
    cursor.execute("SELECT COUNT(*) FROM hazards")
    if cursor.fetchone()[0] == 0:
        demo_hazards = [
            ("haz-1", "Flooding", "High", "Deep standing water (6-8 inches) under railway underpass; pedestrian path submerged.", "Underpass on Oxford St", 37.8708, -122.2661, "15 mins ago", 14, None, 1),
            ("haz-2", "Poor Lighting", "Medium", "3 consecutive streetlamps dark; low visibility corridor after 7:00 PM.", "East Bancroft Pathway", 37.8682, -122.2605, "35 mins ago", 8, None, 1),
            ("haz-3", "Accident", "High", "Scooter collision with construction barrier; emergency vehicle on scene.", "Telegraph & Haste Intersection", 37.8659, -122.2589, "8 mins ago", 22, None, 1),
            ("haz-4", "Pothole", "Medium", "Large broken asphalt pothole along the designated student bike lane.", "Dana Street Bike Route", 37.8672, -122.2635, "1 hour ago", 5, None, 1),
            ("haz-5", "Construction", "Low", "Sidewalk scaffolding and debris fence; temporary bypass walkway open.", "Shattuck & Allston Way", 37.8691, -122.2678, "3 hours ago", 11, None, 1),
            ("haz-6", "High Traffic", "Medium", "Heavy bumper-to-bumper vehicle congestion during peak evening transit rush.", "Fulton Transit Corridor", 37.8665, -122.2668, "25 mins ago", 9, None, 1),
        ]
        cursor.executemany("""
            INSERT INTO hazards (
                id, type, severity, description, location_name,
                latitude, longitude, reported_at, verified_count, image_url, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_hazards)

    # Check students
    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] == 0:
        demo_students = [
            ("stu-1", "STU-8492", "Alex Chen", "online", "route-safest", "Just now"),
            ("stu-2", "STU-5120", "Jordan Lee", "in_transit", "route-balanced", "2 mins ago"),
            ("stu-3", "STU-9381", "Taylor Patel", "safe_at_destination", "route-safest", "10 mins ago"),
            ("stu-4", "STU-4219", "Samira Khan", "in_transit", "route-safest", "4 mins ago"),
        ]
        cursor.executemany("""
            INSERT INTO students (id, student_id, name, status, current_route_id, last_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, demo_students)

    # Check hazard_reports
    cursor.execute("SELECT COUNT(*) FROM hazard_reports")
    if cursor.fetchone()[0] == 0:
        demo_reports = [
            ("rep-1", "Oxford Underpass", json.dumps(["Flooding"]), "High", "Water accumulating rapidly after downpour", None, 37.8708, -122.2661, "verified", "2026-09-17 06:15:00"),
            ("rep-2", "East Bancroft Pathway", json.dumps(["Poor Lighting"]), "Medium", "Street lamps flickering and shut off completely", None, 37.8682, -122.2605, "verified", "2026-09-17 05:55:00"),
            ("rep-3", "Dana Street Bike Route", json.dumps(["Pothole"]), "Medium", "Bike wheel damage hazard near curb", None, 37.8672, -122.2635, "pending", "2026-09-17 05:30:00")
        ]
        cursor.executemany("""
            INSERT INTO hazard_reports (id, location, hazard_types, severity, description, photo_url, latitude, longitude, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_reports)

    conn.commit()
