import React from 'react';
import { Target } from 'lucide-react';
import InfoTooltip from './common/InfoTooltip';

/**
 * ModelMetrics Component
 * 
 * Standard machine learning benchmark cards (Precision, Recall, F1, mAP).
 * Light theme design with clean 14px typography and large monospace values.
 */
export default function ModelMetrics({ metrics = null }) {
  const metricCards = [
    { label: 'Precision', key: 'precision', desc: 'Positive predictive value' },
    { label: 'Recall', key: 'recall', desc: 'True positive sensitivity' },
    { label: 'F1 Score', key: 'f1', desc: 'Harmonic mean of P & R' },
    { label: 'mAP@50', key: 'map50', desc: 'Mean Avg Precision (IoU 0.50)' },
    { label: 'mAP@50-95', key: 'map50_95', desc: 'Strict Mean Avg Precision' },
  ];

  const hasMetrics = metrics && Object.keys(metrics).length > 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
              Evaluation Metrics
              <InfoTooltip topicId="evaluation-metrics" label="Evaluation metrics guide" />
            </h3>
            <span className="text-[11px] text-slate-500">
              YOLOv11 Evaluation Scores
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricCards.map(({ label, key, desc }) => {
          const val = hasMetrics && metrics[key] ? metrics[key] : null;
          return (
            <div
              key={key}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-600 block">
                  {label}
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {val ? (typeof val === 'number' ? `${(val * 100).toFixed(1)}%` : val) : '--'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block leading-tight">
                {desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
