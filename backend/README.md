# RouteSafe AI — Backend & Risk Engine

The backend for **RouteSafe AI** is built with **Python 3**, **FastAPI**, **SQLite**, and **Pydantic**, featuring an automated multi-factor weighted risk engine for student navigation.

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application instance, CORS & lifespan
│   ├── database.py          # SQLite database connection, tables & demo seeding
│   ├── models.py            # Internal domain data classes
│   ├── schemas.py           # Pydantic request & response models
│   ├── routes/
│   │   ├── routes.py        # /api/routes, /api/routes/calculate, /api/risk/*
│   │   ├── hazards.py       # /api/hazards, /api/hazards/report
│   │   ├── reports.py       # /api/reports, /api/reports/{id}
│   │   └── dashboard.py     # /api/dashboard/stats, /api/dashboard/hotspots, /api/dashboard/charts
│   └── services/
│       └── risk_engine.py   # Multi-factor risk calculation & adverse weather multipliers
├── requirements.txt
└── README.md
```

## How to Run

From the `backend/` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive OpenAPI documentation is automatically exposed at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Multi-Factor Risk Calculation Engine

Risk scores are normalized between **0 and 100**:
- **LOW RISK (0–30)**: Green corridor, continuous streetlighting, active emergency blue-light pillars.
- **MEDIUM RISK (31–60)**: Amber corridor, moderate congestion or minor road surface irregularities.
- **HIGH RISK (61–100)**: Red corridor, severe accident choke point, deep flooding, or dark alleyways.

### Formula

$$\text{Risk Score} = \sum (\text{factor}_i \times \text{weight}_i)$$

Default factor weights:
- **Accident Risk**: 25% (`0.25`)
- **Flood Risk**: 20% (`0.20`)
- **Traffic Congestion Risk**: 20% (`0.20`)
- **Lighting Risk**: 15% (`0.15`)
- **Road Condition Risk**: 20% (`0.20`)

### Heavy Rain Simulation

When Heavy Rain mode is activated via `POST /api/risk/heavy-rain`:
- **Flood risk** surges by **+120%** (`x2.2` multiplier).
- **Traffic congestion risk** increases by **+30%** (`x1.3` multiplier).
- **Road condition / slickness risk** increases by **+35%** (`x1.35` multiplier).
- All 3 route alternatives (**Fastest**, **Safest**, **Balanced**) are automatically recalculated in real time.

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, SQLite connection, and version status |
| `GET` | `/api/routes` | Returns the 3 routes (*Fastest*, *Safest*, *Balanced*) with current scores |
| `POST` | `/api/routes/calculate` | Computes route safety between custom student origin & destination |
| `GET` | `/api/hazards` | Returns verified active hazard points with geographic coordinates |
| `POST` | `/api/hazards` | Creates a verified hazard entry |
| `POST` | `/api/hazards/report` | Student crowdsourced hazard report submission |
| `GET` | `/api/dashboard/stats` | Active students, high-risk zones, and incident telemetry |
| `GET` | `/api/dashboard/hotspots` | Geographic hazard hotspots with risk weights for heatmap rendering |
| `GET` | `/api/dashboard/charts` | Formatted chart payloads for hazards by type, risk distribution & trends |
| `POST` | `/api/risk/settings` | Updates risk weight coefficients |
| `POST` | `/api/risk/heavy-rain` | Toggles adverse weather mode and returns route delta |
