"""
Seed script to promote a user to admin role.

Usage:
    python -m scripts.seed_admin admin@example.com

Run from the /backend directory.
"""
import asyncio
import sys

import firebase_admin
from google.cloud.firestore_v1 import AsyncClient

firebase_admin.initialize_app()


async def promote_to_admin(email: str) -> None:
    from app.config import settings

    db = AsyncClient(project=settings.gcp_project_id)
    collection = db.collection("users")

    docs = collection.where("email", "==", email).limit(1).stream()
    found = False
    async for doc in docs:
        found = True
        await doc.reference.update({"role": "admin"})
        data = doc.to_dict()
        print(f"Promoted user to admin:")
        print(f"  UID:   {data.get('uid')}")
        print(f"  Email: {data.get('email')}")
        print(f"  Name:  {data.get('name')}")

    if not found:
        print(f"No user found with email: {email}")
        print("The user must sign in at least once before being promoted.")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.seed_admin <email>")
        sys.exit(1)

    asyncio.run(promote_to_admin(sys.argv[1]))
