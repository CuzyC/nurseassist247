# backend/config.py
import os
import urllib.parse

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

    # Read DB URL from env (set by Render or your .env)
    db_url = os.getenv("DATABASE_URL")

    if db_url:
        # SQLAlchemy prefers postgresql://
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)

        # Append sslmode=require safely (if not already present)
        parsed = urllib.parse.urlparse(db_url)
        if "sslmode" not in parsed.query:
            if parsed.query:
                db_url = db_url + "&sslmode=require"
            else:
                db_url = db_url + "?sslmode=require"

        SQLALCHEMY_DATABASE_URI = db_url
    else:
        # fallback to sqlite for local dev
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'accommodations.db')}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.getenv("SECRET_KEY", "test_dev123")
    # Make JWT secret configurable for production
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "test_secret_key")
    JWT_ACCESS_TOKEN_EXPIRES = 900
    JWT_REFRESH_TOKEN_EXPIRES = 86400
