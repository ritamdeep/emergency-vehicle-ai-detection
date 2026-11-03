import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

/**
 * TrafficSignal Component
 * 
 * Realistic, high-contrast 3-lamp traffic signal.
 * Fully accessible with color + icon + text readout.
 */
export default function TrafficSignal({
  signalId,
  roadName = `Road ${signalId}`,
  state = 'RED', // 'RED' | 'YELLOW' | 'GREEN'
  timer = 0,
  isPriority = false,
  compact = false,
}) {
  const isRed = state === 'RED';
  const isYellow = state === 'YELLOW';
  const isGreen = state === 'GREEN';

  if (compact) {
    return (
      <div
        className={`flex flex-col items-center bg-slate-900 border ${
          isPriority
            ? 'border-red-500 ring-2 ring-red-400 shadow-lg'
            : 'border-slate-700'
        } rounded-xl p-2 shadow-md`}
      >
        <span className="text-[10px] font-mono font-bold text-slate-300 mb-1">
          SIG {signalId}
        </span>

        {/* 3 Lamps Housing */}
        <div className="flex flex-col gap-1.5 p-1 bg-black/80 rounded-lg border border-slate-800">
          {/* Red */}
          <div
            title="Red signal (Stop)"
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              isRed
                ? 'bg-red-500 shadow-[0_0_10px_#ef4444] ring-1 ring-white/70 border border-red-400'
                : 'bg-slate-800/90 border border-slate-700/60'
            }`}
          />
          {/* Yellow */}
          <div
            title="Yellow signal (Clearance)"
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              isYellow
                ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b] ring-1 ring-white/70 border border-amber-300'
                : 'bg-slate-800/90 border border-slate-700/60'
            }`}
          />
          {/* Green */}
          <div
            title="Green signal (Go)"
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
              isGreen
                ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] ring-1 ring-white/70 border border-emerald-300'
                : 'bg-slate-800/90 border border-slate-700/60'
            }`}
          />
        </div>

        {/* Countdown Timer */}
        <div className="mt-1 text-[11px] font-mono font-bold text-white">
          {timer > 0 ? `${timer}s` : '--'}
        </div>
      </div>
    );
  }

  // Full sized signal card
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isPriority
          ? 'bg-red-50/70 border-red-300 shadow-sm'
          : 'bg-white border-slate-200/80 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div>
          <span className="text-sm font-semibold text-slate-900 block">
            Signal {signalId}
          </span>
          <span className="text-xs text-slate-500">
            {roadName}
          </span>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            isPriority
              ? 'bg-red-600 text-white animate-pulse'
              : isGreen
                ? 'bg-emerald-100 text-emerald-800'
                : isYellow
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isGreen && <CheckCircle2 className="w-3.5 h-3.5" />}
          {isYellow && <Clock className="w-3.5 h-3.5" />}
          {isRed && <AlertCircle className="w-3.5 h-3.5" />}
          {state}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {/* Signal Bezel */}
        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex gap-2">
          <div
            className={`w-5 h-5 rounded-full transition-all ${
              isRed
                ? 'bg-red-500 shadow-[0_0_12px_#ef4444] ring-1 ring-white/70 border border-red-400'
                : 'bg-slate-800/90 border border-slate-700/60'
            }`}
          />
          <div
            className={`w-5 h-5 rounded-full transition-all ${
              isYellow
                ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b] ring-1 ring-white/70 border border-amber-300'
                : 'bg-slate-800/90 border border-slate-700/60'
            }`}
          />
          <div
            className={`w-5 h-5 rounded-full transition-all ${
              isGreen
                ? 'bg-emerald-400 shadow-[0_0_12px_#10b981] ring-1 ring-white/70 border border-emerald-300'
                : 'bg-slate-800/90 border border-slate-700/60'
            }`}
          />
        </div>

        {/* Timer Readout */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
            Time Left
          </span>
          <span className="text-xl font-bold font-mono text-slate-900">
            {timer > 0 ? `${timer}s` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
