"""
FastAPI Detection Server for AI-Based Emergency Traffic Signal Management System

Provides REST API endpoints connecting the React frontend to the existing
trained YOLOv11 emergency vehicle detection checkpoint.

Endpoints:
- GET  /health          : Status health check
- POST /detect          : Process CCTV lane video for emergency ambulances
- POST /process-video   : Alias for /detect
- GET  /metrics         : Real model evaluation metrics and confusion matrix
"""

import os
import sys
import shutil
import tempfile
import time
import math
from pathlib import Path
import cv2
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent

# Ensure backend directory is in sys.path for direct script execution
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("YOLO_CONFIG_DIR", str((REPO_ROOT / ".ultralytics").resolve()))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# Import inference utilities from existing codebase
from config import MODEL_REGISTRY, EMERGENCY_CONF_THRESH
from inference import check_siren_hsv, filter_contained_boxes
from segments import merge_hits_into_segments

STRIDE = 3
MAX_SCAN_SECONDS = 300
SEGMENT_MERGE_GAP_SEC = 1.5

app = FastAPI(title="Emergency Ambulance Traffic Preemption API")

# Enable Cross-Origin Resource Sharing (CORS) for Frontend
# Note: allow_credentials must be False when allow_origins is ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Candidate weight paths built with Path from __file__
CANDIDATE_WEIGHTS = [
    REPO_ROOT / "models" / "best.pt",
    REPO_ROOT / "models" / "baseline_50ep.pt",
    BASE_DIR / "best.pt",
    REPO_ROOT / "best.pt",
]

WEIGHTS_PATH = None
for candidate in CANDIDATE_WEIGHTS:
    if candidate.exists():
        WEIGHTS_PATH = str(candidate.resolve()).replace("\\", "/")
        break

if not WEIGHTS_PATH:
    raise FileNotFoundError(
        f"No model weights file could be located in candidate paths: {[str(p) for p in CANDIDATE_WEIGHTS]}"
    )

print(f"[API Server] Loading YOLO checkpoint: {WEIGHTS_PATH}")
model = YOLO(WEIGHTS_PATH)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": True,
        "weights_path": WEIGHTS_PATH,
        "system": "AI Emergency Traffic Signal Management Backend"
    }


@app.post("/detect")
@app.post("/process-video")
def detect_ambulance(
    video: UploadFile = File(...),
    lane_id: int = Form(1)
):
    """
    Ingests video for a specific lane, runs YOLO inference and HSV siren validation
    across the entire video stream, clusters detections into continuous segments,
    and returns comprehensive detection and processing telemetry.
    
    Declared as synchronous 'def' so FastAPI executes it in an external threadpool,
    preventing blocking of concurrent asynchronous endpoints such as /health.
    """
    if lane_id < 1 or lane_id > 8:
        raise HTTPException(status_code=400, detail="Lane ID must be between 1 and 8.")

    start_perf = time.perf_counter()

    # Save uploaded video to temporary file
    suffix = os.path.splitext(video.filename or "")[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        tmp_path = tmp_file.name
        shutil.copyfileobj(video.file, tmp_file)

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not decode uploaded video stream.")

        raw_fps = cap.get(cv2.CAP_PROP_FPS)
        if raw_fps is None or math.isnan(raw_fps) or raw_fps <= 0:
            video_fps = 30.0
        else:
            video_fps = float(raw_fps)

        total_cap_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_cap_frames < 0:
            total_cap_frames = 0

        frame_idx = 0
        frames_scanned = 0
        truncated = False
        hits = []
        detections_list = []
        max_confidence = 0.0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            t_sec = (frame_idx - 1) / video_fps

            # Safety cap check
            if t_sec > MAX_SCAN_SECONDS:
                truncated = True
                break

            # Stride sub-sampling
            if frame_idx % STRIDE != 0:
                continue

            frames_scanned += 1
            frame_resized = cv2.resize(frame, (640, 640))
            results = model(frame_resized, verbose=False, conf=0.10)

            for result in results:
                boxes = result.boxes if hasattr(result, 'boxes') else []
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = str(model.names[cls_id]).lower()

                    is_ambulance = (cls_id == 0) or ('ambulance' in class_name) or ('fire' in class_name)
                    if not is_ambulance:
                        continue

                    xyxy = box.xyxy[0].cpu().numpy().astype(int)
                    x1, y1, x2, y2 = xyxy
                    siren_active = check_siren_hsv(frame_resized, x1, y1, x2, y2)

                    if conf >= EMERGENCY_CONF_THRESH or siren_active:
                        if conf > max_confidence:
                            max_confidence = conf

                        hits.append((t_sec, conf))
                        detections_list.append({
                            "frame": frame_idx,
                            "time_sec": round(t_sec, 3),
                            "confidence": round(conf, 3),
                            "siren_active": siren_active
                        })

        cap.release()

        proc_time_sec = round(time.perf_counter() - start_perf, 3)
        actual_total_frames = max(total_cap_frames, frame_idx)
        duration_sec = round(frame_idx / video_fps, 3) if video_fps > 0 else 0.0
        proc_fps = round(frames_scanned / proc_time_sec, 2) if proc_time_sec > 0 else 0.0

        # Cluster hits into temporal segments
        segments = merge_hits_into_segments(hits, gap_sec=SEGMENT_MERGE_GAP_SEC)
        ambulance_found = len(segments) > 0

        # Sort top 10 detections by confidence descending
        top_detections = sorted(detections_list, key=lambda d: d["confidence"], reverse=True)[:10]

        # Map lane to Road and Signal:
        # Lane 1, 2 -> Road 1, Signal 1
        # Lane 3, 4 -> Road 2, Signal 2
        # Lane 5, 6 -> Road 3, Signal 3
        # Lane 7, 8 -> Road 4, Signal 4
        road_id = (lane_id + 1) // 2
        signal_id = road_id

        return {
            "ambulance_detected": ambulance_found,
            "confidence": round(max_confidence, 3) if ambulance_found else 0.0,
            "lane_id": lane_id,
            "road_id": road_id,
            "signal_id": signal_id,
            "emergency": ambulance_found,
            "detections": top_detections,
            "segments": segments,
            "fps": round(video_fps, 2),
            "total_frames": actual_total_frames,
            "frames_scanned": frames_scanned,
            "duration_sec": duration_sec,
            "processing_time_sec": proc_time_sec,
            "processing_fps": proc_fps,
            "truncated": truncated
        }

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/metrics")
def get_metrics():
    """
    Returns real model validation metrics and evaluation confusion matrix.
    """
    return {
        "metrics": {
            "precision": 0.839,
            "recall": 0.849,
            "f1": 0.844,
            "map50": 0.881,
            "map50_95": 0.677
        },
        "confusion_matrix": {
            "tp": 411,
            "fn": 73,
            "fp": 79,
            "tn": 1560
        }
    }


if __name__ == "__main__":
    import uvicorn
    print(f"[API Server] Starting FastAPI on http://localhost:8000 (Model: {WEIGHTS_PATH})")
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
