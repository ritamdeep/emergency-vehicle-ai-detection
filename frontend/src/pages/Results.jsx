import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import StatCard from '../components/common/StatCard';
import CollapsibleSection from '../components/common/CollapsibleSection';
import ConfusionMatrix from '../components/ConfusionMatrix';
import ModelMetrics from '../components/ModelMetrics';
import InfoTooltip from '../components/common/InfoTooltip';
import StatusPill from '../components/common/StatusPill';

/**
 * Results / Analysis Page (/results)
 * 
 * Minimal, progressive disclosure design:
 * - Top: Exactly 3 primary numbers (Videos Processed, Ambulances Detected, Average Confidence).
 * - Collapsible 'Show details' sections for confidence curves, confusion matrix, and benchmark metrics.
 */
export default function Results() {
  const { analytics, backendMetrics, confusionMatrix, metricsSource, mode } = useTraffic();

  const {
    totalVideosProcessed,
    totalFrames,
    ambulanceDetections,
    confidenceList,
    totalEmergencyDurationSec,
    fps,
    processingTimeSec,
    simulatedCount
  } = analytics;

  const avgConf = confidenceList.length > 0
    ? ((confidenceList.reduce((a, b) => a + b, 0) / confidenceList.length) * 100).toFixed(1)
    : '--';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Performance & Analysis
            </h1>
            <InfoTooltip topicId="video-analysis-statistics" label="Performance guide" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Key operational metrics from processed CCTV videos and neural evaluation benchmarks.
          </p>
        </div>

        <StatusPill mode={mode} withTooltip={false} />
      </div>

      {/* Top: Exactly 3 Key Numbers */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Videos Processed"
            value={totalVideosProcessed}
            description="CCTV traffic streams evaluated"
            topicId="video-upload"
          />

          <StatCard
            label="Ambulances Detected"
            value={ambulanceDetections}
            description="Verified emergency vehicles"
            topicId="ai-detection"
          />

          <StatCard
            label="Average Confidence"
            value={avgConf}
            unit={avgConf !== '--' ? '%' : ''}
            description="Mean neural detection probability"
            topicId="confidence-score"
          />
        </div>

        {simulatedCount > 0 && (
          <p className="text-xs text-slate-500 italic text-right">
            * Includes simulated data ({simulatedCount} simulated {simulatedCount === 1 ? 'event' : 'events'})
          </p>
        )}
      </div>

      {/* Collapsible Sections (Progressive Disclosure) */}
      <div className="space-y-4 pt-2">
        {/* 1. Confidence Curve */}
        <CollapsibleSection
          title="Confidence Over Time"
          subtitle="Visual curve of AI detection confidence across processed frames"
          topicId="confidence-score"
          defaultOpen={false}
          badge={`${confidenceList.length} events`}
        >
          {confidenceList.length > 0 ? (
            <div className="space-y-3">
              <div className="h-36 w-full flex items-end justify-center gap-2 pt-6 pb-2 px-3 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                {confidenceList.map((val, idx) => {
                  const heightPercent = Math.max(15, Math.min(100, Math.round(val * 100)));
                  return (
                    <div
                      key={idx}
                      className="flex-1 max-w-[48px] min-w-[16px] flex flex-col items-center h-full justify-end group relative"
                    >
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none transition-all z-20">
                        {(val * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Start</span>
                <span>Timeline of Confidence Peaks</span>
                <span>End</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 font-medium">
              No confidence data yet. Upload or simulate a video feed on the Cameras page.
            </div>
          )}
        </CollapsibleSection>

        {/* 2. System Throughput & Telemetry */}
        <CollapsibleSection
          title="Processing Throughput & Timing"
          subtitle="Frame extraction speed, hardware FPS, and preemption durations"
          topicId="video-analysis-statistics"
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Frames</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                {totalFrames > 0 ? totalFrames.toLocaleString() : '--'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-xs text-slate-500 block">Processing Speed</span>
              <span className="text-xl font-bold font-mono text-blue-600 mt-1 block">
                {fps !== null && fps > 0 ? `${fps} FPS` : '--'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-xs text-slate-500 block">Processing Time</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                {processingTimeSec > 0 ? `${processingTimeSec.toFixed(1)}s` : '--'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-xs text-slate-500 block">Priority Duration</span>
              <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">
                {totalEmergencyDurationSec > 0 ? `${totalEmergencyDurationSec.toFixed(1)}s` : '--'}
              </span>
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Confusion Matrix */}
        <CollapsibleSection
          title="Model Confusion Matrix"
          subtitle="Ground truth validation breakdown (TP, FP, FN, TN)"
          topicId="confusion-matrix"
          defaultOpen={false}
          badge={metricsSource || 'Validation run (static)'}
        >
          <ConfusionMatrix matrixData={confusionMatrix} />
        </CollapsibleSection>

        {/* 4. Model Evaluation Benchmarks */}
        <CollapsibleSection
          title="Neural Evaluation Benchmarks"
          subtitle="Precision, Recall, F1 Score, and Mean Average Precision"
          topicId="evaluation-metrics"
          defaultOpen={false}
          badge={metricsSource || 'Validation run (static)'}
        >
          <ModelMetrics metrics={backendMetrics} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
