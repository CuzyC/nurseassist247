# backend/config.py
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    
    # Try to read DATABASE_URL from the environment first.
    # If it's not set, fall back to local Postgres with user/db/password = owner
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        # "postgresql+psycopg2://owner:owner@localhost:5432/owner",
        f"sqlite:///{os.path.join(BASE_DIR, 'accommodations.db')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # You can override this with an env var in production
    SECRET_KEY = os.getenv("SECRET_KEY", "test_dev123")

    #JWT SETTINGS
    JWT_SECRET_KEY = "test_secret_key"  # change for production
    JWT_ACCESS_TOKEN_EXPIRES = 900      # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = 86400   # 1 day
