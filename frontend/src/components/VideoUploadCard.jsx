import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import { getActiveSegment } from '../utils/segmentUtils';
import InfoTooltip from './common/InfoTooltip';

/**
 * VideoUploadCard Component
 * 
 * CCTV Camera Lane Card with segment-synchronized detection:
 * - Removes video loop; plays when detection result arrives.
 * - getActiveSegment tracks entered/left boundaries with preroll and grace buffers.
 * - Truthful status: 'No video' / 'Analyzing' / 'Clear' / 'Ambulance' / 'Server unreachable'.
 * - Confidence readout visible ONLY while inside active segment.
 * - Demo mode fallbacks clearly labeled with 'Simulated' tag.
 */
export default function VideoUploadCard({
  laneId,
  roadName = 'Road',
  isEmergencyActive = false,
  demoMode = true,
  onAmbulanceDetected,
  onAmbulanceCleared,
  onVideoProcessed,
  onLogEvent,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'AI_DETECTION' | 'COMPLETE' | 'ERROR'
  const [detectionResult, setDetectionResult] = useState(null);
  const [segments, setSegments] = useState([]);
  const [activeSegment, setActiveSegment] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeSegmentRef = useRef(null);

  // Clear active emergency on component unmount
  useEffect(() => {
    return () => {
      if (activeSegmentRef.current) {
        activeSegmentRef.current = null;
        onAmbulanceCleared?.(laneId);
      }
    };
  }, [laneId, onAmbulanceCleared]);

  // Handle video timestamp progression & edge-triggered boundaries
  const handleTimeUpdate = () => {
    if (!videoRef.current || segments.length === 0) return;
    const t = videoRef.current.currentTime;

    const match = getActiveSegment(segments, t, {
      preroll: TRAFFIC_CONFIG.TIMINGS.SEGMENT_PREROLL_SEC,
      grace: TRAFFIC_CONFIG.TIMINGS.AMBULANCE_GRACE_SEC,
    });

    if (match && !activeSegmentRef.current) {
      // ENTER segment
      activeSegmentRef.current = match;
      setActiveSegment(match);
      onAmbulanceDetected?.(laneId, match.confidence, detectionResult?.detections || []);
    } else if (!match && activeSegmentRef.current) {
      // LEAVE segment
      activeSegmentRef.current = null;
      setActiveSegment(null);
      onAmbulanceCleared?.(laneId);
    }
  };

  // Clear when video finishes playing
  const handleVideoEnded = () => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current = null;
      setActiveSegment(null);
      onAmbulanceCleared?.(laneId);
    }
  };

  // Handle file selection
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('video/')) {
      alert('Please upload a valid video file (.mp4, .mov, .avi).');
      return;
    }

    // Clear any previous active emergency on this lane before switching video
    if (activeSegmentRef.current) {
      activeSegmentRef.current = null;
      setActiveSegment(null);
      onAmbulanceCleared?.(laneId);
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setStatus('IDLE');
    setDetectionResult(null);
    setSegments([]);
    setErrorMessage(null);
    setIsSimulated(false);

    processVideo(selectedFile);
  };

  // Video processing pipeline
  const processVideo = async (videoFile) => {
    try {
      setStatus('UPLOADING');
      onLogEvent?.(`CCTV Lane ${laneId}: Uploading ${videoFile.name}...`, 'info');
      await new Promise(r => setTimeout(r, 300));

      setStatus('PROCESSING');
      onLogEvent?.(`CCTV Lane ${laneId}: Decoding video frames...`, 'info');
      await new Promise(r => setTimeout(r, 400));

      setStatus('AI_DETECTION');
      onLogEvent?.(`CCTV Lane ${laneId}: Running full YOLOv11 + HSV strobe scan...`, 'info');

      let result = null;
      try {
        result = await apiService.detectAmbulance(videoFile, laneId);
      } catch (err) {
        if (demoMode) {
          // Honest Demo Mode simulation fallback (15% to 55% of clip duration)
          const clipDuration = (videoRef.current?.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0)
            ? videoRef.current.duration
            : 10.0;
          
          const simStart = Number((clipDuration * 0.15).toFixed(2));
          const simEnd = Number((clipDuration * 0.55).toFixed(2));
          const simConf = 0.946;

          const simSegment = {
            start_sec: simStart,
            end_sec: simEnd,
            confidence: simConf,
          };

          result = {
            ambulance_detected: true,
            confidence: simConf,
            lane_id: laneId,
            road_id: Math.ceil(laneId / 2),
            signal_id: Math.ceil(laneId / 2),
            emergency: true,
            segments: [simSegment],
            detections: [{ frame: 120, time_sec: simStart, confidence: simConf, siren_active: true }],
            duration_sec: clipDuration,
            frames_scanned: Math.round(clipDuration * 30),
            total_frames: Math.round(clipDuration * 30),
            processing_time_sec: 0.35,
            processing_fps: 28.5,
            simulated: true,
          };
          setIsSimulated(true);
          onLogEvent?.(`CCTV Lane ${laneId}: Server unreachable — using simulated detection.`, 'warning');
        } else {
          // Backend unreachable and Demo Mode OFF: record nothing, report error
          setStatus('ERROR');
          setErrorMessage('Detection server unreachable');
          onLogEvent?.(`CCTV Lane ${laneId}: Detection failed — server unreachable.`, 'warning');
          return;
        }
      }

      setStatus('COMPLETE');
      setDetectionResult(result);
      setSegments(result.segments || []);
      setErrorMessage(null);

      // Record real analytics
      onVideoProcessed?.({
        frames: result.frames_scanned || result.total_frames || 0,
        durationSec: result.duration_sec || 0,
        processingTimeSec: result.processing_time_sec || 0,
        confidences: (result.segments || []).map(s => s.confidence),
        simulated: Boolean(result.simulated),
      });

      // Synchronize video playback from start
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }

      if (result.segments && result.segments.length > 0) {
        onLogEvent?.(`CCTV Lane ${laneId}: Analysis complete. Found ${result.segments.length} ambulance segment(s).`, 'info');
      } else {
        onLogEvent?.(`CCTV Lane ${laneId}: Analysis complete. Normal traffic detected.`, 'info');
      }
    } catch (error) {
      console.error(`Error on Lane ${laneId}:`, error);
      setStatus('ERROR');
      setErrorMessage(error.message || 'Detection failed');
      onLogEvent?.(`CCTV Lane ${laneId}: Detection failed (${error.message}).`, 'warning');
    }
  };

  // Manual Simulate Ambulance button
  const triggerSimulateAmbulance = () => {
    const simDuration = (videoRef.current?.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0)
      ? videoRef.current.duration
      : 10.0;

    const simSegment = {
      start_sec: Number((simDuration * 0.15).toFixed(2)),
      end_sec: Number((simDuration * 0.55).toFixed(2)),
      confidence: 0.946,
    };

    setIsSimulated(true);
    setSegments([simSegment]);
    setDetectionResult({
      ambulance_detected: true,
      confidence: 0.946,
      lane_id: laneId,
      road_id: Math.ceil(laneId / 2),
      signal_id: Math.ceil(laneId / 2),
      segments: [simSegment],
      simulated: true,
    });

    onVideoProcessed?.({
      frames: Math.round(simDuration * 30),
      durationSec: simDuration,
      processingTimeSec: 0.3,
      confidences: [0.946],
      simulated: true,
    });

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      // If no video, immediately trigger preemption with autoClearMs
      onAmbulanceDetected?.(laneId, 0.946, [{ frame: 120, confidence: 0.946 }], {
        autoClearMs: TRAFFIC_CONFIG.TIMINGS.DEMO_AUTO_CLEAR_MS
      });
    }

    onLogEvent?.(`CCTV Lane ${laneId}: Triggered ambulance simulation.`, 'info');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const isBusy = status === 'UPLOADING' || status === 'PROCESSING' || status === 'AI_DETECTION';
  const isInsideSegment = Boolean(activeSegment);
  const confidenceScore = isInsideSegment ? (activeSegment.confidence * 100).toFixed(0) : null;

  // Truthful lane status
  let statusText = 'No video';
  let statusBadgeStyle = 'text-slate-400 bg-slate-100';

  if (isBusy) {
    statusText = 'Analyzing';
    statusBadgeStyle = 'text-blue-600 bg-blue-50';
  } else if (errorMessage) {
    statusText = 'Server unreachable';
    statusBadgeStyle = 'text-amber-700 bg-amber-50';
  } else if (isInsideSegment || isEmergencyActive) {
    statusText = 'Ambulance';
    statusBadgeStyle = 'text-red-700 bg-red-50';
  } else if (previewUrl) {
    statusText = 'Clear';
    statusBadgeStyle = 'text-emerald-700 bg-emerald-50';
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        isDragging
          ? 'border-blue-500 bg-blue-50/50'
          : isInsideSegment
            ? 'border-red-400 ring-2 ring-red-400/30'
            : errorMessage
              ? 'border-amber-300'
              : 'border-slate-200/90'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
        className="hidden"
      />

      {/* Card Header: Lane, Road, Truthful Status */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800">
            Lane {laneId}
          </span>
          <span className="text-[11px] text-slate-500">
            ({roadName})
          </span>
          <InfoTooltip topicId="cctv-lane-feeds" label={`Lane ${laneId} feed`} />
        </div>

        {/* Truthful Status Badge */}
        <div className="flex items-center gap-1.5">
          {isSimulated && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              Simulated
            </span>
          )}

          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusBadgeStyle}`}>
            {isBusy ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            ) : errorMessage ? (
              <AlertCircle className="w-3 h-3 text-amber-600" />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isInsideSegment ? 'bg-red-600 animate-ping' : previewUrl ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            )}
            {statusText}
          </span>
        </div>
      </div>

      {/* Video Preview or Upload Dropzone (NO LOOP) */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <video
            ref={videoRef}
            src={previewUrl}
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-1.5">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 block font-mono">
              CCTV-0{laneId} Feed
            </span>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isBusy && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400 mb-1" />
            <span className="text-xs font-semibold">
              {status === 'UPLOADING' && 'Uploading video...'}
              {status === 'PROCESSING' && 'Extracting frames...'}
              {status === 'AI_DETECTION' && 'YOLO Neural Inference...'}
            </span>
          </div>
        )}

        {/* Hover / Tap Actions Bar (Progressive Disclosure) */}
        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Video
          </button>

          <button
            type="button"
            onClick={triggerSimulateAmbulance}
            className="w-full py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold border border-white/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Simulate Ambulance
          </button>
        </div>
      </div>

      {/* Card Footer: Confidence Readout (Shows ONLY while inside active segment) */}
      <div className="p-3 bg-white flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center">
          Confidence
          <InfoTooltip topicId="confidence-score" label="Confidence score guide" />
        </span>

        <span className={`font-mono font-bold ${
          isInsideSegment
            ? 'text-red-600 text-sm'
            : 'text-slate-400'
        }`}>
          {confidenceScore ? `${confidenceScore}%` : '--'}
        </span>
      </div>
    </div>
  );
}
