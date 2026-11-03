import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import VideoUploadCard from '../components/VideoUploadCard';
import InfoTooltip from '../components/common/InfoTooltip';
import StatusPill from '../components/common/StatusPill';
import { Video } from 'lucide-react';

/**
 * Cameras Page (/cameras)
 * 
 * Clean 4x2 grid of 8 CCTV lane video feeds.
 * Action buttons (Upload Video / Simulate Ambulance) appear smoothly on hover/tap.
 */
export default function Cameras() {
  const {
    mode,
    emergencyData,
    demoMode,
    activateEmergency,
    clearEmergency,
    recordVideoProcessed,
    logEvent,
    backendStatus
  } = useTraffic();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              CCTV Surveillance Feeds
            </h1>
            <InfoTooltip topicId="cctv-lane-feeds" label="CCTV lane feeds guide" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            8 inbound camera streams covering all approach lanes. Hover any feed to upload or test.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              backendStatus === 'online'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : backendStatus === 'offline'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-500 animate-pulse'
                  : backendStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
            />
            <span>
              Backend: {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Not configured'}
            </span>
          </div>

          <StatusPill mode={mode} withTooltip={false} />
        </div>
      </div>

      {/* Quick Instruction Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
        <span className="flex items-center gap-2">
          <Video className="w-4 h-4 text-blue-600 shrink-0" />
          Drag and drop video footage onto any camera tile, or click "Simulate Ambulance" on hover to test.
        </span>
        <span className="font-mono text-slate-500 hidden sm:inline">
          4 Roads • 8 Inbound Lanes
        </span>
      </div>

      {/* 4x2 Camera Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((laneId) => {
          const laneConfig = TRAFFIC_CONFIG.LANES[laneId];
          const isLaneEmergency = emergencyData?.laneId === laneId;

          return (
            <VideoUploadCard
              key={laneId}
              laneId={laneId}
              roadName={laneConfig.roadName}
              isEmergencyActive={isLaneEmergency}
              demoMode={demoMode}
              onAmbulanceDetected={(id, conf, dets) => activateEmergency(id, conf, dets)}
              onAmbulanceCleared={clearEmergency}
              onVideoProcessed={recordVideoProcessed}
              onLogEvent={logEvent}
            />
          );
        })}
      </div>
    </div>
  );
}
