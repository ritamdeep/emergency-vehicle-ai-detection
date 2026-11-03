import React from 'react';
import { X, Siren, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { TRAFFIC_CONFIG } from '../../config/trafficConfig';
import InfoTooltip from './InfoTooltip';

/**
 * DemoDrawer Component
 * 
 * Replaces the intrusive banner with a clean, slide-over drawer
 * containing instant simulation buttons for Lanes 1–8.
 * Triggers go through the same path as lane simulation (records processed video + auto-clears after 8s).
 */
export default function DemoDrawer() {
  const {
    isDemoDrawerOpen,
    closeDemoDrawer,
    mode,
    activateEmergency,
    clearEmergency,
    resetSimulation,
    recordVideoProcessed,
    backendStatus
  } = useTraffic();

  if (!isDemoDrawerOpen) return null;

  const isEmergency = mode === 'EMERGENCY';

  const handleSimulateLane = (laneId) => {
    // Record simulated processing telemetry
    recordVideoProcessed({
      frames: 300,
      durationSec: 10,
      processingTimeSec: 0.3,
      confidences: [0.946],
      simulated: true,
    });

    // Activate priority with autoClear timeout (8s)
    activateEmergency(laneId, 0.946, [{ frame: 120, confidence: 0.946 }], {
      autoClearMs: TRAFFIC_CONFIG.TIMINGS.DEMO_AUTO_CLEAR_MS
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeDemoDrawer}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slideLeft">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-base font-semibold text-slate-900">
                    Demo Simulation
                  </h2>
                  <InfoTooltip topicId="demo-mode" label="Demo mode guide" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test priority overrides across all 8 inbound lanes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDemoDrawer}
              aria-label="Close demo drawer"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Backend Status Note */}
            {backendStatus !== 'online' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Detection server is <strong>{backendStatus === 'unconfigured' ? 'not configured' : 'offline'}</strong>. Demo Mode runs with honest simulated telemetry.
                </span>
              </div>
            )}

            {/* Status Callout */}
            <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
              isEmergency
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              {isEmergency ? (
                <Siren className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-0.5">
                  Current Junction State
                </p>
                <p className="font-medium text-sm">
                  {isEmergency
                    ? 'Emergency preemption active. Cross-traffic is held at red.'
                    : 'Intersection is operating on standard round-robin rotation.'}
                </p>

                {isEmergency && (
                  <button
                    type="button"
                    onClick={clearEmergency}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resume Normal Cycle
                  </button>
                )}
              </div>
            </div>

            {/* Lane Simulation Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Simulate Ambulance Arrival:
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Auto-clears after 8s
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((laneId) => {
                  const lane = TRAFFIC_CONFIG.LANES[laneId];
                  return (
                    <button
                      key={laneId}
                      type="button"
                      onClick={() => handleSimulateLane(laneId)}
                      className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all active:scale-98 group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-slate-900 font-semibold text-sm">
                        <span>Lane {laneId}</span>
                        <Siren className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {lane.roadName} • Signal {lane.signalId}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetSimulation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Simulation
            </button>

            <button
              type="button"
              onClick={closeDemoDrawer}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
