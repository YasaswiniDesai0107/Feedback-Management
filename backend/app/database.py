"""
app/database.py
---------------
Sets up the SQLAlchemy database engine and session factory.

SQLAlchemy works in 3 layers:
  1. Engine      → the actual database connection (MySQL here)
  2. SessionLocal → a factory that creates individual DB sessions per request
  3. Base        → a base class all ORM models will inherit from
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings

# -------------------------------------------------------------------
# 1. Build the MySQL connection URL from .env settings
#    Format: mysql+pymysql://user:password@host:port/database
# -------------------------------------------------------------------
DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

# -------------------------------------------------------------------
# 2. Create the Engine
#    echo=True logs all SQL statements to the console (helpful in dev)
# -------------------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,       # prints SQL queries when DEBUG=True
    pool_pre_ping=True,        # auto-reconnect if a DB connection drops
)

# -------------------------------------------------------------------
# 3. Create the SessionLocal factory
#    autocommit=False → we manually commit transactions (safer)
#    autoflush=False  → don't auto-sync until we explicitly flush/commit
# -------------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# -------------------------------------------------------------------
# 4. Declarative Base
#    All SQLAlchemy models will inherit from this Base class.
#    It keeps track of all models and their corresponding tables.
# -------------------------------------------------------------------
Base = declarative_base()


# -------------------------------------------------------------------
# 5. Dependency Injection helper for FastAPI routes
#    Yields a DB session per request, then closes it automatically.
#    Usage in route: db: Session = Depends(get_db)
# -------------------------------------------------------------------
def get_db():
    """
    FastAPI dependency that provides a database session.
    The 'yield' ensures the session is always closed after the request,
    even if an error occurs (like a try/finally block).
    """
    db = SessionLocal()
    try:
        yield db          # inject the session into the route function
    finally:
        db.close()        # always close the session after the request
