"""
app/main.py
-----------
The entry point of the FastAPI application.

Responsibilities:
  1. Create the FastAPI app instance with metadata
  2. Configure CORS middleware
  3. Register all route modules (routers)
  4. Auto-create database tables on startup
  5. Provide a health-check endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database import Base, engine
from app.routers import feedback_router

# -------------------------------------------------------------------
# 1. Import all models so SQLAlchemy knows about them
#    This must happen BEFORE calling Base.metadata.create_all()
# -------------------------------------------------------------------
from app.models import feedback_model  # noqa: F401  (imported for side effects)


# -------------------------------------------------------------------
# 2. Auto-create tables in the database on startup
#    SQLAlchemy reads all registered models and creates missing tables.
#    If the table already exists, it is NOT dropped — safe to call repeatedly.
# -------------------------------------------------------------------
Base.metadata.create_all(bind=engine)


# -------------------------------------------------------------------
# 3. Create the FastAPI application instance
#    Metadata here powers the auto-generated Swagger UI
# -------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",         # Swagger UI available at http://localhost:8000/docs
    redoc_url="/redoc",       # ReDoc UI available at http://localhost:8000/redoc
    openapi_url="/openapi.json",
)


# -------------------------------------------------------------------
# 4. CORS Middleware
#    Cross-Origin Resource Sharing — allows the frontend (on a different
#    port/domain) to call this API. For Phase-1, we allow all origins.
#    In production, restrict this to specific allowed origins.
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all origins (dev only — restrict in prod)
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods: GET, POST, PUT, DELETE
    allow_headers=["*"],          # Allow all headers
)


# -------------------------------------------------------------------
# 5. Register Routers
#    Each router module handles a specific resource (/feedback here).
#    We use a /api/v1 prefix so the API is versioned from the start.
# -------------------------------------------------------------------
app.include_router(
    feedback_router.router,
    prefix="/api/v1",   # full URL: /api/v1/feedback
)


# -------------------------------------------------------------------
# 6. Root Health Check Endpoint
#    A simple endpoint to verify the API is running.
#    Useful for Docker health checks and uptime monitors.
# -------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="API Health Check")
def health_check():
    """
    Root endpoint — returns a confirmation that the API is running.

    Access: http://localhost:8000/
    """
    return {
        "status": "healthy",
        "app": settings.APP_TITLE,
        "version": settings.APP_VERSION,
        "docs": "http://localhost:8000/docs",
        "message": "Feedback Management System API is running successfully! 🚀",
    }


# -------------------------------------------------------------------
# 7. Application startup/shutdown event handlers (optional logging)
# -------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    """Runs when the application starts."""
    print(f"\n🚀 {settings.APP_TITLE} v{settings.APP_VERSION} is starting...")
    print("📄 Swagger UI: http://localhost:8000/docs")
    print("📋 ReDoc UI:   http://localhost:8000/redoc\n")


@app.on_event("shutdown")
async def on_shutdown():
    """Runs when the application shuts down."""
    print("\n🛑 Application shutdown complete.")
