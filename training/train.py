import os
from pathlib import Path
import torch
from ultralytics import YOLO

def main():
    # Detect the best available device
    if torch.backends.mps.is_available():
        device = 'mps'
    elif torch.cuda.is_available():
        device = 'cuda'
    else:
        device = 'cpu'
    
    print(f"Using device: {device}")
    
    # Path to dataset configuration
    dataset_yaml = os.path.abspath("merged_dataset/data.yaml")
    print(f"Dataset configuration path: {dataset_yaml}")
    
    if not os.path.exists(dataset_yaml):
        print(f"Error: {dataset_yaml} not found!")
        return

    # Load pre-trained model weights (start from previous best checkpoint)
    REPO_ROOT = Path(__file__).resolve().parent.parent
    model_weights = str(REPO_ROOT / "models" / "baseline_50ep.pt")
    if not os.path.exists(model_weights):
        model_weights = str(REPO_ROOT / "models" / "best.pt")
    if not os.path.exists(model_weights):
        model_weights = "yolo11n.pt"
    print(f"Loading checkpoint model: {model_weights}")
    model = YOLO(model_weights)
    
    # Configure training parameters
    epochs = 25
    patience = 8
    batch_size = 16
    img_size = 640
    
    print(f"Starting fine-tuning on {dataset_yaml} for {epochs} epochs (patience={patience}, batch_size={batch_size})...")
    
    # Start training
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        patience=patience,
        imgsz=img_size,
        batch=batch_size,
        device=device,
        weight_decay=0.0005,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        fliplr=0.5,
        project="runs/detect",
        name="train_emergency_v2",
        exist_ok=True
    )
    
    print("Training completed successfully!")
    out_best = "runs/detect/train_emergency_v2/weights/best.pt"
    print(f"Trained model saved in: {out_best}")
    
    # Sync updated weights to default location for app.py
    target_best = str(REPO_ROOT / "models" / "best.pt")
    if os.path.exists(out_best):
        import shutil
        shutil.copy2(out_best, target_best)
        print(f"Synced updated weights to: {target_best}")

if __name__ == "__main__":
    main()
