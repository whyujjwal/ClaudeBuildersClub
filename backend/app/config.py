from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_client_id: str = "PLACEHOLDER_GOOGLE_CLIENT_ID"
    jwt_secret_key: str = "PLACEHOLDER_CHANGE_ME"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60
    gcp_project_id: str = "ujjwal-gcloud"
    frontend_url: str = "http://localhost:3000"

    # Database backend: "postgres" for local dev, "firestore" for deployed
    db_backend: str = "postgres"
    database_url: str = "postgresql+asyncpg://localhost:5432/builders_club"

    class Config:
        env_file = ".env"


settings = Settings()
