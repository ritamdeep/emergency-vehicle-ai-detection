import React from 'react';
import InfoTooltip from './InfoTooltip';

/**
 * StatCard Component
 * 
 * Clean, minimal KPI card with 14px+ typography, large monospace numbers,
 * subtle supporting context, and optional InfoTooltip.
 */
export default function StatCard({
  label,
  value,
  unit = '',
  description = '',
  topicId = null,
  trend = null,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-sm font-medium text-slate-600 flex items-center">
          {label}
          {topicId && <InfoTooltip topicId={topicId} label={label} />}
        </span>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {trend}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-slate-900">
          {value}
        </span>
        {unit && (
          <span className="text-lg font-mono font-medium text-slate-500 ml-0.5">
            {unit}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
