import React from 'react';
import { Siren, ArrowRight, RotateCcw } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { useRouter } from '../../context/RouterContext';

/**
 * EmergencyAlertStrip Component
 * 
 * Persistent, minimal top alert strip shown only when an emergency is active.
 * Provides instant situational awareness from any route with a 1-click action to view or clear.
 */
export default function EmergencyAlertStrip() {
  const { mode, emergencyData, clearEmergency } = useTraffic();
  const { navigate } = useRouter();

  if (mode !== 'EMERGENCY' || !emergencyData || !emergencyData.active) {
    return null;
  }

  const { laneId, roadName, signalId, confidence } = emergencyData;
  const confText = typeof confidence === 'number' ? `${(confidence * 100).toFixed(0)}%` : '95%';

  return (
    <div
      role="alert"
      className="bg-red-600 text-white px-4 py-2 text-xs md:text-sm font-medium shadow-md transition-all duration-300 animate-slideDown flex items-center justify-between gap-3 sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <Siren className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="font-semibold tracking-wide">Ambulance detected:</span>
          <span className="truncate">
            Lane {laneId} ({roadName}) • Signal {signalId} held green ({confText} match)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/junction')}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
          >
            View Junction
            <ArrowRight className="w-3 h-3" />
          </button>
          
          <button
            type="button"
            onClick={clearEmergency}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-red-700 hover:bg-red-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Resume normal cycle
          </button>
        </div>
      </div>
    </div>
  );
}
