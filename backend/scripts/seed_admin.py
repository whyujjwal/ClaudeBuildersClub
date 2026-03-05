"""
Seed script to promote a user to admin role.

Usage:
    python -m scripts.seed_admin admin@example.com

Run from the /backend directory.
"""
import asyncio
import sys

from app.config import settings


def promote_via_firestore(email: str) -> None:
    import firebase_admin
    from google.cloud import firestore

    if not firebase_admin._apps:
        firebase_admin.initialize_app()

    db = firestore.Client(project=settings.gcp_project_id)
    collection = db.collection("users")

    docs = list(
        collection.where(filter=firestore.FieldFilter("email", "==", email)).limit(1).stream()
    )

    if not docs:
        print(f"No user found with email: {email}")
        print("The user must sign in at least once before being promoted.")
        sys.exit(1)

    doc = docs[0]
    doc.reference.update({"role": "admin"})
    data = doc.to_dict()
    print("Promoted user to admin:")
    print(f"  UID:   {data.get('uid')}")
    print(f"  Email: {data.get('email')}")
    print(f"  Name:  {data.get('name')}")


async def promote_via_postgres(email: str) -> None:
    from sqlalchemy import select
    from app.db.database import async_session, UserRow, create_tables

    await create_tables()

    async with async_session() as session:
        result = await session.execute(
            select(UserRow).where(UserRow.email == email)
        )
        row = result.scalar_one_or_none()

        if not row:
            print(f"No user found with email: {email}")
            print("The user must sign in at least once before being promoted.")
            sys.exit(1)

        row.role = "admin"
        await session.commit()

        print("Promoted user to admin:")
        print(f"  UID:   {row.uid}")
        print(f"  Email: {row.email}")
        print(f"  Name:  {row.name}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.seed_admin <email>")
        sys.exit(1)

    email = sys.argv[1]

    if settings.db_backend == "firestore":
        promote_via_firestore(email)
    else:
        asyncio.run(promote_via_postgres(email))
