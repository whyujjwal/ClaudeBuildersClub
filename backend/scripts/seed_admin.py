"""
Seed script to promote a user to admin role.

Usage:
    python -m scripts.seed_admin admin@example.com

Run from the /backend directory.
"""
import sys

import firebase_admin
from google.cloud import firestore

firebase_admin.initialize_app()


def promote_to_admin(email: str) -> None:
    from app.config import settings

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


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.seed_admin <email>")
        sys.exit(1)

    promote_to_admin(sys.argv[1])
