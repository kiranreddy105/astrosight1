import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Persistent Storage Directories (Volume mount points for 24/7 cloud deployment)
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data")))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
REPORT_DIR = Path(os.getenv("REPORT_DIR", str(BASE_DIR / "reports")))

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

# Dataset fallback (local windows path or container path)
DEFAULT_WIN_DATASET = Path(r"c:\Users\ASUS\Downloads\archive (2)\LU3M6TGT_yolo_format")
ENV_DATASET = os.getenv("DATASET_DIR")
if ENV_DATASET and Path(ENV_DATASET).exists():
    DATASET_DIR = Path(ENV_DATASET)
elif DEFAULT_WIN_DATASET.exists():
    DATASET_DIR = DEFAULT_WIN_DATASET
else:
    DATASET_DIR = BASE_DIR / "dataset"

SECRET_KEY = os.getenv("ASTROSIGHT_SECRET_KEY", "astrosight-super-secret-key-deep-space-orbital-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))  # 24 hours

# Database URL with backward compatibility: use existing DB in BASE_DIR if present, else DATA_DIR
DEFAULT_DB_FILE = BASE_DIR / "astrosight.db" if (BASE_DIR / "astrosight.db").exists() else DATA_DIR / "astrosight.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_FILE}")

# CORS configuration
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]

