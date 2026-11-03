import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import InfoTooltip from '../components/common/InfoTooltip';
import StatusPill from '../components/common/StatusPill';
import { 
  Clock, 
  Siren, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

/**
 * Events / Activity Page (/events)
 * 
 * Simple vertical list combining:
 * - Real-time chronological detection timeline
 * - Emergency incident audit summary
 * - Friendly actionable empty states
 */
export default function Events() {
  const { timelineEvents, lastSummary, mode, openDemoDrawer } = useTraffic();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Activity & Incident Log
            </h1>
            <InfoTooltip topicId="detection-timeline" label="Activity log guide" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit trail of AI detections, signal state transitions, and emergency preemption events.
          </p>
        </div>

        <StatusPill mode={mode} withTooltip={false} />
      </div>

      {/* Emergency Incident Audit Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center">
                Latest Emergency Incident Debrief
                <InfoTooltip topicId="emergency-event-summary" label="Incident summary guide" />
              </h2>
              <span className="text-xs text-slate-500">
                Post-incident automated audit
              </span>
            </div>
          </div>
        </div>

        {lastSummary ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Ambulance Verified</span>
              <span className="font-semibold text-red-600 text-sm mt-0.5 block">
                Yes (Lane {lastSummary.laneId})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Corridor</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {lastSummary.roadName}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Signal Action</span>
              <span className="font-semibold text-emerald-600 text-sm mt-0.5 block">
                Signal {lastSummary.signalId} (Green)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Recovery Status</span>
              <span className="font-semibold text-blue-600 text-sm mt-0.5 block">
                Automated Recovery
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              No emergency overrides recorded during this monitoring session. Traffic is flowing smoothly.
            </span>
          </div>
        )}
      </div>

      {/* Chronological Event Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Live Timeline
              </h2>
              <span className="text-xs text-slate-500">
                Newest events appear first
              </span>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {timelineEvents.length} events
          </span>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">
              No activity recorded yet.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={openDemoDrawer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Trigger Demo Simulation
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {timelineEvents.map((evt) => {
              let icon = <Info className="w-4 h-4 text-slate-400" />;
              let cardBg = 'bg-slate-50 border-slate-200/80 text-slate-700';

              if (evt.type === 'emergency' || evt.type === 'emergency-action') {
                icon = <Siren className="w-4 h-4 text-red-600" />;
                cardBg = 'bg-red-50/70 border-red-200 text-red-900';
              } else if (evt.type === 'detection') {
                icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
                cardBg = 'bg-amber-50/70 border-amber-200 text-amber-900';
              } else if (evt.type === 'success') {
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                cardBg = 'bg-emerald-50/70 border-emerald-200 text-emerald-900';
              }

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 text-xs transition-all ${cardBg}`}
                >
                  <div className="shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-medium text-slate-900">
                      {evt.text}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">
                      {evt.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
