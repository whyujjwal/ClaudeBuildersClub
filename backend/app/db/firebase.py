import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import AsyncClient

_db: AsyncClient | None = None


def init_firebase() -> None:
    """Initialize Firebase Admin SDK. Uses Application Default Credentials."""
    if not firebase_admin._apps:
        firebase_admin.initialize_app()


async def get_firestore_client() -> AsyncClient:
    """Get or create the async Firestore client singleton."""
    global _db
    if _db is None:
        from app.config import settings

        _db = AsyncClient(project=settings.gcp_project_id)
    return _db
