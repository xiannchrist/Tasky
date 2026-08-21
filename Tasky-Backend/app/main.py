"""
Tasky Backend — FastAPI Application Entry Point

Main application with CORS, router registration, lifespan events,
health checks, and API documentation at /api/docs and /api/redoc.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")

    # Start background scheduler
    from app.workers.scheduler import start_scheduler, stop_scheduler
    try:
        start_scheduler()
    except Exception as e:
        logger.warning(f"Scheduler start skipped: {e}")

    yield

    # Shutdown
    try:
        stop_scheduler()
    except Exception as e:
        logger.warning(f"Scheduler stop error: {e}")

    logger.info(f"{settings.APP_NAME} shutting down")


# ── Create FastAPI app ──

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Tasky Backend API — Multi-user academic task management "
        "with LMS synchronization and push notifications."
    ),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── Security & Middleware ──

from app.core.middleware import SecurityHeadersMiddleware

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──

from app.routers import auth, users, tasks, subjects, lms, notifications, devices

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(subjects.router)
app.include_router(lms.router)
app.include_router(notifications.router)
app.include_router(devices.router)


# ── Health Check Endpoints (Root & API) ──

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Universal cloud health check endpoint (compatible with Render, Railway, AWS ECS)."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
@app.get("/api", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME} Production API",
        "docs": "/api/docs",
        "health": "/api/health",
        "version": settings.APP_VERSION,
        "status": "online",
    }
