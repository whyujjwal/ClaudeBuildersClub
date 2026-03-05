"""PostgreSQL database setup using SQLAlchemy async."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, relationship

from app.config import settings

# ── ORM Base ──────────────────────────────────────────────────────────────────


class Base(DeclarativeBase):
    pass


# ── Tables ────────────────────────────────────────────────────────────────────


class UserRow(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    picture = Column(String, default="")
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True))
    last_login = Column(DateTime(timezone=True))
    onboarding_completed = Column(Boolean, default=False)
    track = Column(String, nullable=True)
    path = Column(String, nullable=True)
    interests = Column(ARRAY(String), default=list)
    prd_document = Column(Text, nullable=True)

    memberships = relationship("GroupMemberRow", back_populates="user")
    managed_groups = relationship("GroupRow", back_populates="pm")


class GroupRow(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    join_code = Column(String(6), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    pm_uid = Column(String, ForeignKey("users.uid"), nullable=False)
    track = Column(String, nullable=True)

    pm = relationship("UserRow", back_populates="managed_groups")
    memberships = relationship(
        "GroupMemberRow", back_populates="group", cascade="all, delete-orphan"
    )


class GroupMemberRow(Base):
    __tablename__ = "group_members"

    group_id = Column(
        String, ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True
    )
    user_uid = Column(
        String, ForeignKey("users.uid", ondelete="CASCADE"), primary_key=True
    )
    joined_at = Column(DateTime(timezone=True), nullable=False)
    is_pm = Column(Boolean, default=False)

    group = relationship("GroupRow", back_populates="memberships")
    user = relationship("UserRow", back_populates="memberships")


# ── Engine & Session ──────────────────────────────────────────────────────────

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_tables() -> None:
    """Create all tables (safe to call repeatedly)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
