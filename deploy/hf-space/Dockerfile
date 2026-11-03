FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    HOME=/home/user

# Install system dependencies (OpenCV headless runtime + git)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user (Hugging Face Spaces default UID 1000)
RUN useradd -m -u 1000 user
WORKDIR /app

# Clone project repository directly into /app
RUN git clone --depth 1 https://github.com/ritamdeep/emergency-vehicle-ai-detection /app \
    && chown -R user:user /app

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    -r requirements.txt \
    fastapi \
    uvicorn \
    python-multipart \
    opencv-python-headless

# Switch to non-root user
USER user

EXPOSE 7860

# Run FastAPI server
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "7860"]
