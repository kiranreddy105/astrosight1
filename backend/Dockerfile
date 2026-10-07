# ==============================================================================
# ASTROSIGHT Backend Dockerfile — Production 24/7 Cloud Intelligence Node
# ==============================================================================
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    DATA_DIR=/app/data \
    UPLOAD_DIR=/app/uploads \
    REPORT_DIR=/app/reports \
    PORT=8000

# Install minimal OS dependencies for headless OpenCV, PyTorch runtime & curl healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies with CPU-optimized PyTorch wheels (drastically reduces image size)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch torchvision && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and trained neural network weights
COPY app/ ./app/
COPY astrosight.db ./data/astrosight.db

# Ensure persistent mount points exist
RUN mkdir -p /app/data /app/uploads /app/reports

EXPOSE 8000

# Container health monitoring for cloud orchestrators (Render, Railway, Fly.io, ECS)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Production execution using multi-worker Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
