import time
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import UPLOAD_DIR, REPORT_DIR, CORS_ORIGINS
from .database import engine, Base, SessionLocal
from .models import User
from .services.authentication import hash_password
from .routers import auth_router, analysis_router
from .init_samples import setup_sample_images

START_TIME = time.time()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AstroSight API",
    description="Autonomous AI Planetary Crater Intelligence & Spatial Analysis Platform",
    version="2.4.0"
)

# CORS Middleware for production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/api/reports", StaticFiles(directory=str(REPORT_DIR)), name="reports")

# Include Routers
app.include_router(auth_router.router)
app.include_router(analysis_router.router)

@app.on_event("startup")
def on_startup():
    # Setup test and demo specimens
    try:
        setup_sample_images()
    except Exception as e:
        print(f"Error setting up sample images: {e}")

    # Seed initial test account if not exists
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "commander@astrosight.org").first()
        if not existing:
            demo_user = User(
                name="Dr. Helena Vance",
                email="commander@astrosight.org",
                hashed_password=hash_password("Password123!"),
                role="Chief Planetary Geoscientist",
                favorite_planet="Moon"
            )
            db.add(demo_user)
            db.commit()
            print("Default mission researcher initialized: commander@astrosight.org / Password123!")
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    uptime_sec = round(time.time() - START_TIME, 1)
    return {
        "status": "OPERATIONAL",
        "system": "AstroSight Planetary Intelligence Node",
        "version": "2.4.0",
        "core": "PyTorch / OpenCV / FastAPI",
        "dataset": "LU3M6TGT YOLO Benchmark Active",
        "uptime_seconds": uptime_sec,
        "mode": "PRODUCTION_24_7"
    }
