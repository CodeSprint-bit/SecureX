
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app import models
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.history import router as history_router
from app.routers.case_reports import router as case_reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="SecureX API",
    description="Backend for the SecureX document verification platform.",
    version="0.1.0",
    lifespan=lifespan,
)


# Register API routers.
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(history_router)
app.include_router(case_reports_router)

# Frontend access configuration.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to SecureX API",
        "status": "running",
    }


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected",
        "application": "SecureX",
    }
