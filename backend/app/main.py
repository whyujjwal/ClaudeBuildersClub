from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.groups.router import router as groups_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.db_backend == "firestore":
        from app.db.firebase import init_firebase, get_firestore_client

        init_firebase()
        await get_firestore_client()
    else:
        from app.db.database import create_tables

        await create_tables()
    yield


app = FastAPI(
    title="Claude Builders Club API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(groups_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
