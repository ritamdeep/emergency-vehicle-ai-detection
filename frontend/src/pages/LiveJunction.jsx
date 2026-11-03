import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import TrafficJunction from '../components/TrafficJunction';
import TrafficSignal from '../components/TrafficSignal';
import InfoTooltip from '../components/common/InfoTooltip';
import StatusPill from '../components/common/StatusPill';
import { Siren, RotateCcw, AlertTriangle } from 'lucide-react';

/**
 * Live Junction Page (/junction)
 * 
 * Focus:
 * - Intersection diagram as hero, centered and large.
 * - Compact signal status panel beside it (4 signals, state, countdown).
 * - Emergency override information displayed ONLY when active.
 */
export default function LiveJunction() {
  const {
    signals,
    emergencyData,
    mode,
    clearEmergency,
    currentPhase,
    currentRoadIndex
  } = useTraffic();

  const isEmergency = mode === 'EMERGENCY';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Live Junction Monitor
            </h1>
            <InfoTooltip topicId="junction-diagram" label="Junction diagram guide" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time optical preemption visualizer for the 4-way, 8-lane intersection.
          </p>
        </div>

        <StatusPill mode={mode} withTooltip={false} />
      </div>

      {/* Emergency Active Card (Shown ONLY when emergency active) */}
      {isEmergency && emergencyData && emergencyData.active && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <Siren className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Ambulance Priority Active
                </span>
                <InfoTooltip topicId="emergency-mode" label="Emergency mode guide" />
              </div>
              <p className="text-sm text-red-900 font-medium">
                Approaching in {emergencyData.laneName} ({emergencyData.roadName}) • Signal {emergencyData.signalId} held green
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearEmergency}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resume Normal Cycle
          </button>
        </div>
      )}

      {/* Hero Layout: Junction (Left/Main) + Signal Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Intersection Diagram (Hero) */}
        <div className="lg:col-span-8 flex justify-center">
          <TrafficJunction
            signals={signals}
            emergencyData={emergencyData}
            mode={mode}
          />
        </div>

        {/* Compact Signal-Status Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center">
                <h2 className="text-sm font-semibold text-slate-900">
                  Signal Controllers
                </h2>
                <InfoTooltip topicId="traffic-signals" label="Traffic signals guide" />
              </div>
              <span className="text-xs font-mono text-slate-400">
                4 SIGNALS
              </span>
            </div>

            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((sigId) => {
                const sig = signals[sigId];
                const isPriority = isEmergency && emergencyData?.signalId === sigId;
                const roadNames = ['North (Road 1)', 'East (Road 2)', 'South (Road 3)', 'West (Road 4)'];
                
                return (
                  <TrafficSignal
                    key={sigId}
                    signalId={sigId}
                    roadName={roadNames[sigId - 1]}
                    state={sig.state}
                    timer={sig.timer}
                    isPriority={isPriority}
                    compact={false}
                  />
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Current Rotation:</span>
              <span className="font-semibold text-slate-700">
                {isEmergency
                  ? 'Overridden by Emergency'
                  : `Road ${currentRoadIndex + 1} (${currentPhase} phase)`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
