# Emergency Vehicle Traffic Signal Management System 🚑

An AI-powered Emergency Vehicle Priority Traffic Management System that leverages real-time computer vision and deep learning to detect and classify emergency vehicles—such as ambulances, fire engines, and police vehicles—and automatically coordinate with municipal traffic signal controllers to activate green lights along their approach. Designed for a four-road, eight-lane intersection, the system aims to reduce emergency response times, minimize traffic congestion, and enable safer, faster passage for emergency services.

---

## Overview

In urban environments, emergency vehicles frequently encounter severe traffic congestion, leading to delayed medical and rescue response times. This system provides an autonomous solution:
- Monitors traffic lanes using CCTV camera feeds.
- Detects approaching emergency vehicles using a fine-tuned YOLOv11 model combined with HSV color analysis for flashing siren strobes.
- Automatically overrides normal traffic light cycles to grant an immediate green wave corridor to the emergency vehicle's road while holding conflicting roads at red.
- Resumes normal round-robin signal cycling once the vehicle has cleared the junction.

---

## Core System Architecture

### 1. Junction Layout (4 Roads, 8 Lanes, 4 Signals)
- Road 1 (North): Lanes 1 and 2 (Monitored by Signal 1)
- Road 2 (East): Lanes 3 and 4 (Monitored by Signal 2)
- Road 3 (South): Lanes 5 and 6 (Monitored by Signal 3)
- Road 4 (West): Lanes 7 and 8 (Monitored by Signal 4)

### 2. Signal Preemption State Machine
- Normal Cycle: Sequential round-robin cycling through Road 1, Road 2, Road 3, and Road 4.
  - Green Duration: 10 seconds
  - Yellow Clearance Duration: 3 seconds
  - Conflicting Signals: Held at Red
- Emergency Preemption Mode:
  - Triggered automatically when an ambulance is identified in any lane video.
  - Determines the corresponding road and traffic signal from the detected lane.
  - Immediately transitions the corresponding signal to Priority Green.
  - Forces all conflicting intersection signals to Red.
  - Highlights the emergency corridor with laser guidance overlays.
- Safe Recovery Mode:
  - Once the emergency vehicle clears the junction, a 3.0-second post-clearance buffer runs.
  - Safely transitions through a yellow phase before returning the intersection to normal cyclic operation.

### 3. Detection Engine & Anti-Overfitting Safeguards
- Deep Learning Architecture: Ultralytics YOLOv11 Nano.
- Dual-Threshold Filtering :
  - Emergency Vehicles: Confidence threshold of 0.20 (prioritizing high recall).
  - Normal Traffic: Confidence threshold of 0.30 (filtering background noise).
- HSV Siren Strobe Scanner:
  - Analyzes the upper 35% roof region of vehicle candidate boxes.
  - Calibrated hue, saturation, and value thresholds for flashing blue and red strobes.
  - Rejects false positives from brake lights and halogen headlights.
- Temporal IoU Tracking:
  - Intersection-over-Union threshold of 0.50.
  - 8-frame memory buffer bridges dark flash intervals during alternating strobe phases.
  - Nested containment suppression filters out sub-bounding boxes for wheels, sirens, and body fragments.

---

## Repository Structure

```text
emergency-vehicle-project/
|-- api_server.py                 # FastAPI backend connecting to the YOLOv11 model
|-- app.py                        # Streamlit dashboard interface
|-- config.py                     # Central constants, model registry, and timing parameters
|-- detect_video.py               # Video processing script for offline generation
|-- inference.py                  # Model loader, IoU tracker, HSV strobe scanner, and OpenCV HUD
|-- ui_components.py              # Modular UI components for the dashboard
|-- requirements.txt              # Python production dependencies
|-- packages.txt                  # Linux system packages (ffmpeg, libgl1, libglib2.0-0)
|-- .gitignore                    # Clean Git exclusion rules
|-- README.md                     # Documentation
|-- frontend/                     # React + Vite Command Center Web Application
|   |-- index.html                # Main HTML entry point
|   |-- package.json              # Frontend dependencies (React, Vite, Tailwind CSS, Lucide)
|   |-- vite.config.js            # Vite bundler configuration
|   |-- postcss.config.js         # PostCSS configuration
|   `-- src/
|       |-- App.jsx               # Main React application shell
|       |-- main.jsx              # Application bootstrap
|       |-- index.css             # Styling, glassmorphic panels, and signal glow shaders
|       |-- config/
|       |   `-- trafficConfig.js  # Junction mappings and timing configurations
|       |-- services/
|       |   `-- api.js            # Frontend API client communicating with backend
|       |-- hooks/
|       |   `-- useTrafficController.js # Preemption state machine and cyclic scheduler
|       |-- components/
|       |   |-- Header.jsx        # Status bar and mode indicators
|       |   |-- TrafficJunction.jsx # Central 4-road graphical intersection visualizer
|       |   |-- TrafficSignal.jsx # 3-lamp traffic signal component
|       |   |-- Lane.jsx          # Lane markings and directional chevrons
|       |   |-- VideoUploadCard.jsx # 8 CCTV lane video upload cards with previews
|       |   |-- EmergencyBanner.jsx # Critical preemption alert banner
|       |   |-- DetectionTimeline.jsx # Real-time event log with timestamps
|       |   |-- TrafficControlStatus.jsx # Telemetry panel for Signals 1 through 4
|       |   |-- AnalyticsDashboard.jsx # Comprehensive analysis results and telemetry charts
|       |   |-- ConfusionMatrix.jsx # Validation split confusion matrix
|       |   |-- ModelMetrics.jsx  # Precision, Recall, F1, and mAP metric cards
|       |   `-- DemoControls.jsx  # Interactive Demo Mode testing harness
|       `-- pages/
|           `-- Dashboard.jsx     # Master dashboard page
`-- runs/                         # Model training outputs and evaluated checkpoints
    `-- detect/
        |-- train_emergency_v2/weights/best.pt # Fine-tuned 25-epoch checkpoint
        `-- runs/detect/train_emergency/weights/best.pt # Baseline 50-epoch checkpoint
```

---

## Installation & Setup

### Prerequisites
- Python 3.10, 3.11, or 3.12
- Node.js v18 or higher with npm

### 1. Clone the Repository
```bash
git clone https://github.com/vishalsoni2006/emergency-vehicle-project.git
cd emergency-vehicle-project
```

### 2. Python Backend Setup
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

pip install -r requirements.txt
pip install fastapi uvicorn python-multipart
```

### 3. Frontend Web Application Setup
```bash
cd frontend
npm install
cd ..
```

---

## Running the Application

### Option A: Complete Web Application (Recommended)

1. Start the FastAPI Model Backend:
```bash
python api_server.py
```
The backend starts on `http://localhost:8000` and automatically loads the trained YOLO checkpoint.

2. Start the React Frontend Dashboard:
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

### Option B: Classic Streamlit Application

If you prefer the single-process Streamlit dashboard:
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## API Documentation

The FastAPI backend exposes the following REST endpoints:

### GET /health
Checks server and model status.
- Response:
```json
{
  "status": "online",
  "model_loaded": true,
  "weights_path": "runs/detect/train_emergency_v2/weights/best.pt"
}
```

### POST /detect or POST /process-video
Processes an uploaded CCTV lane video and evaluates emergency preemption across full clip duration.
- Request: `multipart/form-data`
  - `video`: Video file (.mp4, .avi, .mov)
  - `lane_id`: Integer between 1 and 8
- Response:
```json
{
  "ambulance_detected": true,
  "confidence": 0.946,
  "lane_id": 5,
  "road_id": 3,
  "signal_id": 3,
  "emergency": true,
  "fps": 30.0,
  "total_frames": 360,
  "frames_scanned": 120,
  "duration_sec": 12.0,
  "processing_time_sec": 0.85,
  "processing_fps": 141.2,
  "truncated": false,
  "segments": [
    {
      "start_sec": 1.4,
      "end_sec": 6.8,
      "confidence": 0.946
    }
  ],
  "detections": [
    {
      "frame": 42,
      "timestamp_sec": 1.4,
      "confidence": 0.946,
      "siren_active": true
    }
  ]
}
```

### GET /metrics
Returns validation split metrics and the evaluation confusion matrix.
- Response:
```json
{
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
```

---

## Model Evaluation Results

Evaluation performed on 2,123 validation images (2,763 instances):

| Metric | Score |
| :--- | :--- |
| Ambulance Precision | 83.9% |
| Ambulance Recall | 84.9% |
| Ambulance mAP@0.50 | 88.1% |
| Overall Model Precision | 83.7% |
| Overall Model Recall | 76.2% |
| Overall Model mAP@0.50 | 83.5% |
| Overall Model mAP@0.50:0.95 | 64.7% |

---

## Architecture & Deployment

This project operates on a decoupled, three-tier cloud architecture designed for cost-free, production-grade deployment:

```
┌─────────────────────────────────┐       ┌──────────────────────────────────────┐
│         Vercel (Frontend)       │       │    Hugging Face Spaces (AI Backend)  │
│  - React 19 + Vite SPA          │ ───►  │  - FastAPI + Python 3.11 Docker      │
│  - Client-side Hash Routing     │       │  - Ultralytics YOLOv11 Nano          │
│  - Root Directory = frontend    │       │  - Port 7860                         │
└─────────────────────────────────┘       └──────────────────────────────────────┘
                 ▲                                           ▲
                 │                                           │
                 └───────────────────┬───────────────────────┘
                                     │
                       ┌───────────────────────────┐
                       │    GitHub (Source Repo)   │
                       │  ritamdeep/               │
                       │  emergency-vehicle-ai-    │
                       │  detection                │
                       └───────────────────────────┘
```

### 1. Backend: Hugging Face Spaces (Docker)

The backend runs containerized on Hugging Face Spaces using the dedicated deployment files located in [`deploy/hf-space/`](deploy/hf-space/):

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set the **Space name** to `emergency-vehicle-api` under your username (resulting in `https://ritamdeep-emergency-vehicle-api.hf.space`).
3. Select **Docker** as the Space SDK and **Blank** as the template (free CPU tier).
4. In your Space repository, commit the two files from `deploy/hf-space/`:
   - `README.md` (contains Space metadata YAML with `sdk: docker` and `app_port: 7860`)
   - `Dockerfile` (builds Python 3.11-slim, clones the repo, installs dependencies, and serves on port 7860)
5. Hugging Face will automatically build and launch the container.
6. Verify deployment by visiting `https://ritamdeep-emergency-vehicle-api.hf.space/health` (should return `status: online`).

> **Known Limits (Free CPU Tier):**
> - Free Spaces sleep after 48 hours of inactivity. The first request after sleeping may take 30–60 seconds to cold-start.
> - For optimal inference latency on CPU, test with video clips between 5 and 15 seconds.

---

### 2. Frontend: Vercel

The frontend is a lightweight React 19 + Vite SPA that builds to static assets:

1. Import your GitHub repository (`ritamdeep/emergency-vehicle-ai-detection`) in [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://ritamdeep-emergency-vehicle-api.hf.space` *(ensure no trailing slash)*
4. Click **Deploy**. Vercel will install dependencies via `npm ci` and build the application using `vite build`.

> **Note:** Because Vite bakes `VITE_API_URL` into client-side bundles at build time, any changes to this environment variable in Vercel require triggering a redeployment. If `VITE_API_URL` is omitted, the frontend automatically activates self-contained Demo / Offline mode with explicit indicators.

---

### 3. Local Development

To run the full stack locally:

```bash
# Terminal 1: Backend API
python -m uvicorn api_server:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the local command center.

---

## Acknowledgements & Credits

This project is based on and extends the original work from [vishalsoni2006/emergency-vehicle-project](https://github.com/vishalsoni2006/emergency-vehicle-project), licensed under the MIT License.

---

## License

```text
MIT License

Copyright (c) 2026 Ritam Deep Chowdhury
Original Work Copyright (c) 2026 Vishal Soni

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
