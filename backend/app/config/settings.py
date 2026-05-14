"""
config/settings.py
------------------
Loads environment variables from the .env file using Pydantic's BaseSettings.
This keeps sensitive config (like DB credentials) out of source code.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from the .env file.
    Each attribute maps directly to an environment variable.
    """

    # --- Database Configuration ---
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "feedback_db"

    # --- App Configuration ---
    APP_TITLE: str = "Feedback Management System"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "A REST API for managing academic feedback submissions."
    DEBUG: bool = True

    class Config:
        # Tell Pydantic to read from the .env file in the project root
        env_file = ".env"
        env_file_encoding = "utf-8"


# Create a single, shared instance of Settings (singleton pattern)
settings = Settings()
