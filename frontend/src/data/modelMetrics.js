/**
 * Static Baseline Evaluation Metrics
 * 
 * Sourced from the YOLOv11 evaluation split (2,123 validation images, 2,763 instances)
 * as documented in api_server.py and the project report.
 * Used as default indicators whenever the backend is unconfigured or offline.
 */

export const STATIC_MODEL_METRICS = {
  metrics: {
    precision: 0.839,
    recall: 0.849,
    f1: 0.844,
    map50: 0.881,
    map50_95: 0.677,
  },
  confusion_matrix: {
    tp: 411,
    fn: 73,
    fp: 79,
    tn: 1560,
  },
  validation_images: 2123,
  instances: 2763,
  model_name: 'YOLOv11 Nano (train_emergency_v2)',
};
