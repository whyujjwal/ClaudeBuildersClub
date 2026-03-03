import secrets
import string
from datetime import datetime, timezone

from app.db.firebase import get_firestore_client
from app.groups.models import Group, GroupMember, CreateGroupRequest
from app.users.models import UserProfile

COLLECTION = "groups"


def _generate_join_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


def _to_response(data: dict) -> Group:
    """Convert a raw Firestore dict to a Group model, coercing nested dicts."""
    members = [
        GroupMember(**m) if isinstance(m, dict) else m
        for m in data.get("members", [])
    ]
    return Group(
        id=data["id"],
        name=data["name"],
        description=data.get("description"),
        join_code=data["join_code"],
        created_at=data["created_at"],
        pm_uid=data["pm_uid"],
        member_uids=data.get("member_uids", []),
        members=members,
        track=data.get("track"),
    )


async def _unique_join_code() -> str:
    db = await get_firestore_client()
    for _ in range(10):
        code = _generate_join_code()
        docs = db.collection(COLLECTION).where("join_code", "==", code)
        found = [d async for d in docs.stream()]
        if not found:
            return code
    raise RuntimeError("Could not generate unique join code")


async def create_group(pm: UserProfile, data: CreateGroupRequest) -> Group:
    """Create a new group. The creating user becomes the project manager."""
    db = await get_firestore_client()

    # One group per user — reject if already in a group
    existing = await get_user_group(pm.uid)
    if existing:
        raise ValueError("You are already in a group. Leave it first.")

    now = datetime.now(timezone.utc)
    join_code = await _unique_join_code()
    group_id = secrets.token_urlsafe(8)

    pm_member = GroupMember(
        uid=pm.uid,
        name=pm.name,
        email=pm.email,
        picture=pm.picture,
        joined_at=now,
        is_pm=True,
    )

    group = Group(
        id=group_id,
        name=data.name,
        description=data.description,
        join_code=join_code,
        created_at=now,
        pm_uid=pm.uid,
        member_uids=[pm.uid],
        members=[pm_member],
        track=pm.track,
    )

    # Firestore can't serialise datetime inside nested dicts directly so we
    # dump with mode="json" to get ISO strings, then store as-is.
    await db.collection(COLLECTION).document(group_id).set(
        group.model_dump(mode="json")
    )
    return group


async def join_group(user: UserProfile, join_code: str) -> Group:
    """Join an existing group using its invite code."""
    db = await get_firestore_client()

    # One group per user
    existing = await get_user_group(user.uid)
    if existing:
        raise ValueError("You are already in a group. Leave it first.")

    query = db.collection(COLLECTION).where("join_code", "==", join_code.upper().strip())
    docs = [doc async for doc in query.stream()]

    if not docs:
        raise ValueError("Invalid join code — no group found.")

    doc = docs[0]
    data = doc.to_dict()

    if user.uid in data.get("member_uids", []):
        raise ValueError("You are already a member of this group.")

    now = datetime.now(timezone.utc)
    new_member = GroupMember(
        uid=user.uid,
        name=user.name,
        email=user.email,
        picture=user.picture,
        joined_at=now,
        is_pm=False,
    )

    updated_members = data.get("members", []) + [new_member.model_dump(mode="json")]
    updated_uids = data.get("member_uids", []) + [user.uid]

    await doc.reference.update({"members": updated_members, "member_uids": updated_uids})

    data["members"] = updated_members
    data["member_uids"] = updated_uids
    return _to_response(data)


async def get_user_group(uid: str) -> Group | None:
    """Return the group the user currently belongs to, or None."""
    db = await get_firestore_client()
    query = db.collection(COLLECTION).where("member_uids", "array_contains", uid)
    docs = [doc async for doc in query.stream()]
    if not docs:
        return None
    return _to_response(docs[0].to_dict())


async def get_group_by_id(group_id: str) -> Group | None:
    db = await get_firestore_client()
    doc = await db.collection(COLLECTION).document(group_id).get()
    if not doc.exists:
        return None
    return _to_response(doc.to_dict())


async def leave_group(user_uid: str, group_id: str) -> None:
    """Non-PM member leaves the group."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(group_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise ValueError("Group not found.")

    data = doc.to_dict()
    if data["pm_uid"] == user_uid:
        raise ValueError("Project manager cannot leave — transfer PM role or delete the group.")

    updated_members = [m for m in data.get("members", []) if m["uid"] != user_uid]
    updated_uids = [u for u in data.get("member_uids", []) if u != user_uid]
    await doc_ref.update({"members": updated_members, "member_uids": updated_uids})


async def remove_member(pm_uid: str, group_id: str, target_uid: str) -> Group:
    """PM removes another member from the group."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(group_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise ValueError("Group not found.")

    data = doc.to_dict()
    if data["pm_uid"] != pm_uid:
        raise ValueError("Only the project manager can remove members.")
    if target_uid == pm_uid:
        raise ValueError("PM cannot remove themselves.")

    updated_members = [m for m in data.get("members", []) if m["uid"] != target_uid]
    updated_uids = [u for u in data.get("member_uids", []) if u != target_uid]
    await doc_ref.update({"members": updated_members, "member_uids": updated_uids})

    data["members"] = updated_members
    data["member_uids"] = updated_uids
    return _to_response(data)


async def delete_group(pm_uid: str, group_id: str) -> None:
    """PM deletes the group entirely."""
    db = await get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(group_id)
    doc = await doc_ref.get()
    if not doc.exists:
        raise ValueError("Group not found.")

    data = doc.to_dict()
    if data["pm_uid"] != pm_uid:
        raise ValueError("Only the project manager can delete the group.")

    await doc_ref.delete()
