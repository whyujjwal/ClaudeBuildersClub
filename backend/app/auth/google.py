from google.oauth2 import id_token
from google.auth.transport import requests

from app.config import settings


async def verify_google_token(token: str) -> dict | None:
    """Verify a Google ID token and return the payload."""
    try:
        payload = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.google_client_id,
        )
        if payload["iss"] not in (
            "accounts.google.com",
            "https://accounts.google.com",
        ):
            return None
        return payload
    except ValueError:
        return None
