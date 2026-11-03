FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    PYTHONPATH=/app/backend

WORKDIR /app

# Install system dependencies from packages.txt
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt \
    fastapi \
    uvicorn \
    python-multipart

# Copy backend application and trained model weights
COPY backend/ backend/
COPY models/ models/

EXPOSE 7860

WORKDIR /app/backend

# Run FastAPI server with dynamic port support
CMD ["sh", "-c", "uvicorn api_server:app --host 0.0.0.0 --port ${PORT:-7860}"]
