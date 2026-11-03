import React from 'react';
import TrafficSignal from './TrafficSignal';
import InfoTooltip from './common/InfoTooltip';
import { Siren } from 'lucide-react';

/**
 * TrafficJunction Component
 * 
 * 4-Road, 8-Lane Central Intersection Visualizer.
 * Refined for the light theme with high-contrast road asphalt,
 * crisp lane dividers, zebra crossings, and dynamic emergency preemption rays.
 */
export default function TrafficJunction({
  signals,
  emergencyData,
  mode,
}) {
  const isEmergency = mode === 'EMERGENCY';
  const emergencyLaneId = emergencyData?.laneId;
  const emergencyRoadId = emergencyData?.roadId;

  return (
    <div className="relative w-full aspect-square max-w-[620px] mx-auto bg-slate-50/80 rounded-3xl p-4 md:p-6 border border-slate-200/90 shadow-sm flex items-center justify-center overflow-hidden">
      {/* Background Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700 bg-white/95 px-3 py-1 rounded-full border border-slate-200 shadow-xs flex items-center">
          4-Way Intersection
          <InfoTooltip topicId="junction-diagram" label="Intersection diagram guide" />
        </span>

        {isEmergency && (
          <span className="text-xs font-semibold text-red-700 bg-red-100/90 border border-red-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <Siren className="w-3.5 h-3.5" />
            Priority Corridor Active
          </span>
        )}
      </div>

      {/* Main Intersection Canvas Container */}
      <div className="relative w-full h-full max-w-[500px] max-h-[500px]">
        {/* ============================================================== */}
        {/* ROADWAYS LAYOUT (Crossroads) */}
        {/* ============================================================== */}

        {/* 1. North-South Roadway */}
        <div
          className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 bg-slate-900 border-x-2 border-slate-700 transition-all duration-300 ${
            isEmergency && (emergencyRoadId === 1 || emergencyRoadId === 3)
              ? 'ring-4 ring-red-500/40'
              : ''
          }`}
        >
          {/* North Road Centerline (Double Yellow Solid) */}
          <div className="absolute top-0 bottom-[60%] left-1/2 -translate-x-1/2 w-1 border-r border-amber-400 opacity-80" />
          
          {/* South Road Centerline */}
          <div className="absolute top-[60%] bottom-0 left-1/2 -translate-x-1/2 w-1 border-r border-amber-400 opacity-80" />

          {/* Lane Dashed Dividers */}
          <div className="absolute top-0 bottom-[60%] left-1/4 w-0.5 border-r border-dashed border-white/50" />
          <div className="absolute top-0 bottom-[60%] right-1/4 w-0.5 border-r border-dashed border-white/50" />
          <div className="absolute top-[60%] bottom-0 left-1/4 w-0.5 border-r border-dashed border-white/50" />
          <div className="absolute top-[60%] bottom-0 right-1/4 w-0.5 border-r border-dashed border-white/50" />

          {/* North Zebra Pedestrian Crossing */}
          <div className="absolute top-[28%] left-0 right-0 h-5 flex justify-between px-2 pointer-events-none opacity-80">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-2 h-full bg-white rounded-[1px]" />
            ))}
          </div>

          {/* South Zebra Pedestrian Crossing */}
          <div className="absolute bottom-[28%] left-0 right-0 h-5 flex justify-between px-2 pointer-events-none opacity-80">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-2 h-full bg-white rounded-[1px]" />
            ))}
          </div>
        </div>

        {/* 2. East-West Roadway */}
        <div
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-32 sm:h-40 bg-slate-900 border-y-2 border-slate-700 transition-all duration-300 ${
            isEmergency && (emergencyRoadId === 2 || emergencyRoadId === 4)
              ? 'ring-4 ring-red-500/40'
              : ''
          }`}
        >
          {/* West Centerline */}
          <div className="absolute left-0 right-[60%] top-1/2 -translate-y-1/2 h-1 border-b border-amber-400 opacity-80" />
          
          {/* East Centerline */}
          <div className="absolute left-[60%] right-0 top-1/2 -translate-y-1/2 h-1 border-b border-amber-400 opacity-80" />

          {/* West & East Lane Dashed Dividers */}
          <div className="absolute left-0 right-[60%] top-1/4 h-0.5 border-b border-dashed border-white/50" />
          <div className="absolute left-0 right-[60%] bottom-1/4 h-0.5 border-b border-dashed border-white/50" />
          <div className="absolute left-[60%] right-0 top-1/4 h-0.5 border-b border-dashed border-white/50" />
          <div className="absolute left-[60%] right-0 bottom-1/4 h-0.5 border-b border-dashed border-white/50" />

          {/* West Zebra Crossing */}
          <div className="absolute left-[28%] top-0 bottom-0 w-5 flex flex-col justify-between py-2 pointer-events-none opacity-80">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-2 w-full bg-white rounded-[1px]" />
            ))}
          </div>

          {/* East Zebra Crossing */}
          <div className="absolute right-[28%] top-0 bottom-0 w-5 flex flex-col justify-between py-2 pointer-events-none opacity-80">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-2 w-full bg-white rounded-[1px]" />
            ))}
          </div>
        </div>

        {/* 3. Central Crossing Hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center z-10">
          <div className="absolute inset-2 border-2 border-dashed border-amber-400/30 rounded-md pointer-events-none" />
          <div className="text-center p-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 block">
              JUNCTION
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              AI Priority
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROAD 1 (NORTH): LANES 1 & 2 + SIGNAL 1 */}
        {/* ============================================================== */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
          <span className="text-[10px] font-mono font-semibold text-slate-600 mb-1">
            North (Road 1)
          </span>

          <div className="flex gap-2 items-center">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 1
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              Lane 1 ↓
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 2
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              Lane 2 ↓
            </span>
          </div>
        </div>

        {/* Signal 1 (North - Road 1 • Top-Right Corner) */}
        <div className="absolute top-[18%] left-[82%] -translate-x-1/2 -translate-y-1/2 z-30">
          <TrafficSignal
            signalId={1}
            roadName="Road 1"
            state={signals[1].state}
            timer={signals[1].timer}
            isPriority={emergencyRoadId === 1}
            compact={true}
          />
        </div>

        {/* ============================================================== */}
        {/* ROAD 2 (EAST): LANES 3 & 4 + SIGNAL 2 */}
        {/* ============================================================== */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-end z-30">
          <span className="text-[10px] font-mono font-semibold text-slate-600 mb-1">
            East (Road 2)
          </span>

          <div className="flex flex-col gap-1 items-end">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 3
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              ← Lane 3
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 4
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              ← Lane 4
            </span>
          </div>
        </div>

        {/* Signal 2 (East - Road 2 • Bottom-Right Corner) */}
        <div className="absolute top-[82%] left-[82%] -translate-x-1/2 -translate-y-1/2 z-30">
          <TrafficSignal
            signalId={2}
            roadName="Road 2"
            state={signals[2].state}
            timer={signals[2].timer}
            isPriority={emergencyRoadId === 2}
            compact={true}
          />
        </div>

        {/* ============================================================== */}
        {/* ROAD 3 (SOUTH): LANES 5 & 6 + SIGNAL 3 */}
        {/* ============================================================== */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
          <div className="flex gap-2 items-center mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 5
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              ↑ Lane 5
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 6
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              ↑ Lane 6
            </span>
          </div>

          <span className="text-[10px] font-mono font-semibold text-slate-600">
            South (Road 3)
          </span>
        </div>

        {/* Signal 3 (South - Road 3 • Bottom-Left Corner) */}
        <div className="absolute top-[82%] left-[18%] -translate-x-1/2 -translate-y-1/2 z-30">
          <TrafficSignal
            signalId={3}
            roadName="Road 3"
            state={signals[3].state}
            timer={signals[3].timer}
            isPriority={emergencyRoadId === 3}
            compact={true}
          />
        </div>

        {/* ============================================================== */}
        {/* ROAD 4 (WEST): LANES 7 & 8 + SIGNAL 4 */}
        {/* ============================================================== */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-start z-30">
          <span className="text-[10px] font-mono font-semibold text-slate-600 mb-1">
            West (Road 4)
          </span>

          <div className="flex flex-col gap-1 items-start">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 7
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              Lane 7 →
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                emergencyLaneId === 8
                  ? 'bg-red-600 text-white shadow-md animate-bounce'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              Lane 8 →
            </span>
          </div>
        </div>

        {/* Signal 4 (West - Road 4 • Top-Left Corner) */}
        <div className="absolute top-[18%] left-[18%] -translate-x-1/2 -translate-y-1/2 z-30">
          <TrafficSignal
            signalId={4}
            roadName="Road 4"
            state={signals[4].state}
            timer={signals[4].timer}
            isPriority={emergencyRoadId === 4}
            compact={true}
          />
        </div>

        {/* Dynamic Priority Corridor Laser Overlay */}
        {isEmergency && emergencyRoadId && (
          <div className="absolute inset-0 pointer-events-none z-15">
            {emergencyRoadId === 3 && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1/2 bg-gradient-to-t from-red-500/40 via-red-500/20 to-transparent animate-pulse" />
            )}
            {emergencyRoadId === 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 bg-gradient-to-b from-red-500/40 via-red-500/20 to-transparent animate-pulse" />
            )}
            {emergencyRoadId === 2 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-16 bg-gradient-to-l from-red-500/40 via-red-500/20 to-transparent animate-pulse" />
            )}
            {emergencyRoadId === 4 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-16 bg-gradient-to-r from-red-500/40 via-red-500/20 to-transparent animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
