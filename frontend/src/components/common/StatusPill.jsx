import React from 'react';
import { Siren, CheckCircle2 } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

/**
 * StatusPill Component
 * 
 * Clean, single status badge replacing dense multi-badge headers.
 * Shows either "Normal traffic rotation" or "Ambulance priority active".
 */
export default function StatusPill({ mode = 'NORMAL', withTooltip = true, className = '' }) {
  const isEmergency = mode === 'EMERGENCY';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
        isEmergency
          ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isEmergency && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isEmergency ? 'bg-red-600' : 'bg-emerald-500'
          }`}
        />
      </span>

      <span className="font-semibold tracking-tight flex items-center gap-1.5">
        {isEmergency ? (
          <>
            <Siren className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            Ambulance Priority Active
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Normal Traffic Flow
          </>
        )}
      </span>

      {withTooltip && <InfoTooltip topicId="system-status" label="System status guide" />}
    </div>
  );
}
