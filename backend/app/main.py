from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db
from .routes.routes import router as routes_router
from .routes.hazards import router as hazards_router
from .routes.reports import router as reports_router
from .routes.dashboard import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema and demo data on startup
    init_db()
    yield

app = FastAPI(
    title="RouteSafe AI — Backend & Risk Engine",
    description="Student Safety Navigation Platform API with multi-factor weighted risk routing, heavy rain simulations, and hazard management.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for local development and container preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check Endpoint
@app.get("/api/health", tags=["System Health"])
def health_check():
    """
    Health check endpoint returning platform and risk engine status.
    """
    return {
        "status": "healthy",
        "service": "RouteSafe AI Backend",
        "version": "2.0.0",
        "database": "SQLite",
        "engine": "Multi-Factor Weighted Risk Engine",
        "demo_mode": "Synthetic Campus Dataset"
    }

# Include all sub-routers
app.include_router(routes_router)
app.include_router(hazards_router)
app.include_router(reports_router)
app.include_router(dashboard_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
