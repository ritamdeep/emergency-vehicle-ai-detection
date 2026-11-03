import { useState, useEffect, useRef, useCallback } from 'react';
import { TRAFFIC_CONFIG, getRoadAndSignalForLane } from '../config/trafficConfig';

export function useTrafficController() {
  // Traffic controller state
  const [mode, setMode] = useState('NORMAL'); // 'NORMAL' | 'EMERGENCY'

  // 4 Signal states: each has state ('RED' | 'YELLOW' | 'GREEN') and timer in seconds
  const [signals, setSignals] = useState({
    1: { id: 1, state: 'GREEN', timer: TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION, roadId: 1 },
    2: { id: 2, state: 'RED', timer: 0, roadId: 2 },
    3: { id: 3, state: 'RED', timer: 0, roadId: 3 },
    4: { id: 4, state: 'RED', timer: 0, roadId: 4 },
  });

  // Cyclic progression state
  const [currentRoadIndex, setCurrentRoadIndex] = useState(0); // 0 -> Road 1, 1 -> Road 2, etc.
  const [currentPhase, setCurrentPhase] = useState('GREEN'); // 'GREEN' | 'YELLOW'
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION);

  // Active Emergency Data
  const [emergencyData, setEmergencyData] = useState(null);

  // Timeline events log
  const [timelineEvents, setTimelineEvents] = useState([
    {
      id: 1,
      time: '00:00',
      timestamp: Date.now(),
      text: 'System Initialized. Junction operating in NORMAL mode.',
      type: 'info'
    }
  ]);

  // Demo Mode toggle
  const [demoMode, setDemoMode] = useState(true);

  // Analytics aggregations (Initialized without fake values: frames=0, fps=null, processingTimeSec=0)
  const [analytics, setAnalytics] = useState({
    totalVideosProcessed: 0,
    totalFrames: 0,
    ambulanceDetections: 0,
    confidenceList: [],
    emergencyEventsCount: 0,
    totalEmergencyDurationSec: 0,
    fps: null,
    processingTimeSec: 0,
    simulatedCount: 0,
  });

  // Precise timing & state refs to eliminate race conditions
  const activeLanesRef = useRef(new Set());
  const currentEmergencyRef = useRef(null);
  const clearanceTimerRef = useRef(null);
  const autoClearTimersRef = useRef(new Map());
  const emergencyStartTimestampRef = useRef(null);
  const sessionStartTimeRef = useRef(Date.now());

  // Clean up all pending timers on unmount
  useEffect(() => {
    const clearanceTimer = clearanceTimerRef;
    const autoClearTimers = autoClearTimersRef;
    return () => {
      if (clearanceTimer.current) {
        clearTimeout(clearanceTimer.current);
        clearanceTimer.current = null;
      }
      autoClearTimers.current.forEach((tId) => clearTimeout(tId));
      autoClearTimers.current.clear();
    };
  }, []);

  // Helper to format offset time (e.g. "00:04")
  const getFormattedOffset = useCallback(() => {
    const elapsedSec = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
    const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const secs = (elapsedSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  // Helper to add timeline event
  const logEvent = useCallback((text, type = 'info', meta = {}) => {
    setTimelineEvents(prev => [
      {
        id: Date.now() + Math.random(),
        time: getFormattedOffset(),
        timestamp: Date.now(),
        text,
        type,
        ...meta
      },
      ...prev.slice(0, 49) // Keep last 50 events
    ]);
  }, [getFormattedOffset]);

  // Cancel clearance buffer timer safely
  const cancelClearanceBuffer = useCallback(() => {
    if (clearanceTimerRef.current) {
      clearTimeout(clearanceTimerRef.current);
      clearanceTimerRef.current = null;
      return true;
    }
    return false;
  }, []);

  // Clear Emergency function (handles individual lane exit or force-clear)
  const clearEmergency = useCallback((laneId) => {
    if (typeof laneId === 'number') {
      // 1. Clear auto-clear timer for this lane if one exists
      if (autoClearTimersRef.current.has(laneId)) {
        clearTimeout(autoClearTimersRef.current.get(laneId));
        autoClearTimersRef.current.delete(laneId);
      }

      // 2. Remove lane from active set
      if (!activeLanesRef.current.has(laneId)) {
        return; // Nothing to clear for this lane
      }
      activeLanesRef.current.delete(laneId);

      const { laneName } = getRoadAndSignalForLane(laneId);

      // 3. If other lanes still have active ambulances, hand over priority
      if (activeLanesRef.current.size > 0) {
        const nextLaneId = activeLanesRef.current.values().next().value;
        const nextInfo = getRoadAndSignalForLane(nextLaneId);

        const nextEmergency = {
          active: true,
          laneId: nextLaneId,
          laneName: nextInfo.laneName,
          roadId: nextInfo.roadId,
          roadName: nextInfo.roadName,
          signalId: nextInfo.signalId,
          confidence: currentEmergencyRef.current?.confidence || 0.946,
          startTime: Date.now(),
          detections: []
        };
        currentEmergencyRef.current = nextEmergency;
        setEmergencyData(nextEmergency);

        setSignals({
          1: { id: 1, state: nextInfo.signalId === 1 ? 'GREEN' : 'RED', timer: nextInfo.signalId === 1 ? 99 : 0, roadId: 1 },
          2: { id: 2, state: nextInfo.signalId === 2 ? 'GREEN' : 'RED', timer: nextInfo.signalId === 2 ? 99 : 0, roadId: 2 },
          3: { id: 3, state: nextInfo.signalId === 3 ? 'GREEN' : 'RED', timer: nextInfo.signalId === 3 ? 99 : 0, roadId: 3 },
          4: { id: 4, state: nextInfo.signalId === 4 ? 'GREEN' : 'RED', timer: nextInfo.signalId === 4 ? 99 : 0, roadId: 4 },
        });

        logEvent(`Ambulance left ${laneName}. Priority handed over to ${nextInfo.laneName} (${nextInfo.roadName}).`, 'info');
        return;
      }

      // 4. No lanes remain active -> Start safety clearance buffer (3s)
      logEvent(`Ambulance left ${laneName}. Starting ${TRAFFIC_CONFIG.TIMINGS.CLEARANCE_BUFFER}s intersection clearance buffer...`, 'warning');

      clearanceTimerRef.current = setTimeout(() => {
        clearanceTimerRef.current = null;
        setMode('NORMAL');
        setEmergencyData(null);
        currentEmergencyRef.current = null;

        const durationSec = emergencyStartTimestampRef.current
          ? (Date.now() - emergencyStartTimestampRef.current) / 1000
          : 0;
        emergencyStartTimestampRef.current = null;

        // Use functional state updates to avoid reading stale currentRoadIndex
        setCurrentRoadIndex((prevIdx) => {
          const nextIdx = (prevIdx + 1) % TRAFFIC_CONFIG.CYCLE_SEQUENCE.length;
          const nextActiveRoadId = TRAFFIC_CONFIG.CYCLE_SEQUENCE[nextIdx];

          setSignals({
            1: { id: 1, state: nextActiveRoadId === 1 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 1 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 1 },
            2: { id: 2, state: nextActiveRoadId === 2 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 2 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 2 },
            3: { id: 3, state: nextActiveRoadId === 3 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 3 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 3 },
            4: { id: 4, state: nextActiveRoadId === 4 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 4 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 4 },
          });

          return nextIdx;
        });

        setCurrentPhase('GREEN');
        setPhaseSecondsLeft(TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION);

        logEvent('Clearance buffer ended. Normal traffic rotation resumed.', 'success');

        if (durationSec > 0) {
          setAnalytics(prev => ({
            ...prev,
            totalEmergencyDurationSec: Number((prev.totalEmergencyDurationSec + durationSec).toFixed(1))
          }));
        }
      }, TRAFFIC_CONFIG.TIMINGS.CLEARANCE_BUFFER * 1000);
      return;
    }

    // Force-clear triggered manually (e.g. click event with no laneId)
    cancelClearanceBuffer();
    autoClearTimersRef.current.forEach((tId) => clearTimeout(tId));
    autoClearTimersRef.current.clear();
    activeLanesRef.current.clear();

    if (currentEmergencyRef.current || emergencyStartTimestampRef.current) {
      const durationSec = emergencyStartTimestampRef.current
        ? (Date.now() - emergencyStartTimestampRef.current) / 1000
        : 0;
      emergencyStartTimestampRef.current = null;
      currentEmergencyRef.current = null;
      setEmergencyData(null);
      setMode('NORMAL');

      setCurrentRoadIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % TRAFFIC_CONFIG.CYCLE_SEQUENCE.length;
        const nextActiveRoadId = TRAFFIC_CONFIG.CYCLE_SEQUENCE[nextIdx];

        setSignals({
          1: { id: 1, state: nextActiveRoadId === 1 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 1 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 1 },
          2: { id: 2, state: nextActiveRoadId === 2 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 2 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 2 },
          3: { id: 3, state: nextActiveRoadId === 3 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 3 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 3 },
          4: { id: 4, state: nextActiveRoadId === 4 ? 'GREEN' : 'RED', timer: nextActiveRoadId === 4 ? TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION : 0, roadId: 4 },
        });

        return nextIdx;
      });

      setCurrentPhase('GREEN');
      setPhaseSecondsLeft(TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION);

      logEvent('Emergency preemption cleared manually by operator.', 'info');

      if (durationSec > 0) {
        setAnalytics(prev => ({
          ...prev,
          totalEmergencyDurationSec: Number((prev.totalEmergencyDurationSec + durationSec).toFixed(1))
        }));
      }
    }
  }, [cancelClearanceBuffer, logEvent]);

  // Activate Emergency Priority
  const activateEmergency = useCallback((laneId, confidence = 0.946, detections = [], options = {}) => {
    const { autoClearMs } = options;
    const { roadId, signalId, roadName, laneName } = getRoadAndSignalForLane(laneId);
    if (!roadId) return;

    // 1. Cancel clearance buffer if active (the ambulance reappeared or another arrived)
    const cancelledBuffer = cancelClearanceBuffer();
    if (cancelledBuffer) {
      logEvent(`Ambulance reappeared during clearance buffer. Emergency priority continued.`, 'emergency');
    }

    // 2. Check if this same lane is already active and no buffer was pending (Idempotency)
    const isAlreadyActive = activeLanesRef.current.has(laneId);
    if (isAlreadyActive && !cancelledBuffer) {
      // Re-arm auto-clear timer if specified
      if (autoClearMs) {
        if (autoClearTimersRef.current.has(laneId)) {
          clearTimeout(autoClearTimersRef.current.get(laneId));
        }
        const timer = setTimeout(() => clearEmergency(laneId), autoClearMs);
        autoClearTimersRef.current.set(laneId, timer);
      }
      return; // No-op
    }

    // 3. Register lane in active set
    const wasEmpty = activeLanesRef.current.size === 0;
    activeLanesRef.current.add(laneId);

    // Schedule auto-clear if requested
    if (autoClearMs) {
      if (autoClearTimersRef.current.has(laneId)) {
        clearTimeout(autoClearTimersRef.current.get(laneId));
      }
      const timer = setTimeout(() => clearEmergency(laneId), autoClearMs);
      autoClearTimersRef.current.set(laneId, timer);
    }

    // 4. If another lane already holds priority, add to active set and keep current priority
    if (!wasEmpty && currentEmergencyRef.current && currentEmergencyRef.current.laneId !== laneId) {
      logEvent(`Ambulance also detected on ${laneName} (${roadName}). Queueing priority.`, 'emergency', { laneId, confidence });
      return;
    }

    // 5. Grant priority to this lane
    setMode('EMERGENCY');
    if (!emergencyStartTimestampRef.current) {
      emergencyStartTimestampRef.current = Date.now();
    }

    const newEmergency = {
      active: true,
      laneId,
      laneName,
      roadId,
      roadName,
      signalId,
      confidence: typeof confidence === 'number' ? confidence : 0.946,
      startTime: Date.now(),
      detections
    };
    currentEmergencyRef.current = newEmergency;
    setEmergencyData(newEmergency);

    setSignals({
      1: { id: 1, state: signalId === 1 ? 'GREEN' : 'RED', timer: signalId === 1 ? 99 : 0, roadId: 1 },
      2: { id: 2, state: signalId === 2 ? 'GREEN' : 'RED', timer: signalId === 2 ? 99 : 0, roadId: 2 },
      3: { id: 3, state: signalId === 3 ? 'GREEN' : 'RED', timer: signalId === 3 ? 99 : 0, roadId: 3 },
      4: { id: 4, state: signalId === 4 ? 'GREEN' : 'RED', timer: signalId === 4 ? 99 : 0, roadId: 4 },
    });

    logEvent(`🚨 Ambulance detected in ${laneName} (${roadName})`, 'emergency', { laneId, confidence });
    logEvent(`Emergency priority activated: Signal ${signalId} set to GREEN. Cross-traffic RED.`, 'emergency-action');

    // Count detections and events only on NEW activation transitions
    if (wasEmpty) {
      setAnalytics(prev => ({
        ...prev,
        ambulanceDetections: prev.ambulanceDetections + 1,
        emergencyEventsCount: prev.emergencyEventsCount + 1,
      }));
    }
  }, [cancelClearanceBuffer, clearEmergency, logEvent]);

  // Reset Simulation to default factory state
  const resetSimulation = useCallback(() => {
    cancelClearanceBuffer();
    autoClearTimersRef.current.forEach((tId) => clearTimeout(tId));
    autoClearTimersRef.current.clear();
    activeLanesRef.current.clear();
    currentEmergencyRef.current = null;
    emergencyStartTimestampRef.current = null;
    sessionStartTimeRef.current = Date.now();

    setMode('NORMAL');
    setEmergencyData(null);
    setCurrentRoadIndex(0);
    setCurrentPhase('GREEN');
    setPhaseSecondsLeft(TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION);

    setSignals({
      1: { id: 1, state: 'GREEN', timer: TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION, roadId: 1 },
      2: { id: 2, state: 'RED', timer: 0, roadId: 2 },
      3: { id: 3, state: 'RED', timer: 0, roadId: 3 },
      4: { id: 4, state: 'RED', timer: 0, roadId: 4 },
    });

    setTimelineEvents([
      {
        id: Date.now(),
        time: '00:00',
        timestamp: Date.now(),
        text: 'Simulation Reset. Junction returned to default NORMAL cycle.',
        type: 'info'
      }
    ]);

    // Zero out analytics; no fake hardcoded numbers
    setAnalytics({
      totalVideosProcessed: 0,
      totalFrames: 0,
      ambulanceDetections: 0,
      confidenceList: [],
      emergencyEventsCount: 0,
      totalEmergencyDurationSec: 0,
      fps: null,
      processingTimeSec: 0,
      simulatedCount: 0,
    });
  }, [cancelClearanceBuffer]);

  // Normal Traffic Light State Machine Loop (Active only when mode === 'NORMAL')
  useEffect(() => {
    if (mode === 'EMERGENCY') return;

    const interval = setInterval(() => {
      setPhaseSecondsLeft(prevSec => {
        if (prevSec > 1) {
          const nextSec = prevSec - 1;
          const activeRoadId = TRAFFIC_CONFIG.CYCLE_SEQUENCE[currentRoadIndex];
          setSignals(prevSignals => ({
            ...prevSignals,
            [activeRoadId]: { ...prevSignals[activeRoadId], timer: nextSec }
          }));
          return nextSec;
        }

        // Timer reached 0: Transition Phase
        if (currentPhase === 'GREEN') {
          setCurrentPhase('YELLOW');
          const yellowDuration = TRAFFIC_CONFIG.TIMINGS.YELLOW_DURATION;
          const activeRoadId = TRAFFIC_CONFIG.CYCLE_SEQUENCE[currentRoadIndex];

          setSignals(prevSignals => ({
            ...prevSignals,
            [activeRoadId]: { id: activeRoadId, state: 'YELLOW', timer: yellowDuration, roadId: activeRoadId }
          }));
          return yellowDuration;
        } else {
          // Transition from YELLOW to next Road GREEN using functional updater
          const nextRoadIdx = (currentRoadIndex + 1) % TRAFFIC_CONFIG.CYCLE_SEQUENCE.length;
          setCurrentRoadIndex(nextRoadIdx);
          setCurrentPhase('GREEN');

          const greenDuration = TRAFFIC_CONFIG.TIMINGS.GREEN_DURATION;
          const nextActiveRoadId = TRAFFIC_CONFIG.CYCLE_SEQUENCE[nextRoadIdx];

          setSignals(() => {
            const updated = {};
            [1, 2, 3, 4].forEach(rId => {
              if (rId === nextActiveRoadId) {
                updated[rId] = { id: rId, state: 'GREEN', timer: greenDuration, roadId: rId };
              } else {
                updated[rId] = { id: rId, state: 'RED', timer: 0, roadId: rId };
              }
            });
            return updated;
          });

          return greenDuration;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, currentPhase, currentRoadIndex]);

  // Record a processed video in analytics with real metrics
  const recordVideoProcessed = useCallback((payload = {}) => {
    const frames = Number(payload.frames || 0);
    const processingTimeSec = Number(payload.processingTimeSec || 0);
    const confidences = Array.isArray(payload.confidences) ? payload.confidences : [];
    const simulated = Boolean(payload.simulated);

    setAnalytics(prev => {
      const newTotalFrames = prev.totalFrames + frames;
      const newProcessingTime = Number((prev.processingTimeSec + processingTimeSec).toFixed(3));
      const calculatedFps = newProcessingTime > 0
        ? Number((newTotalFrames / newProcessingTime).toFixed(1))
        : null;

      return {
        ...prev,
        totalVideosProcessed: prev.totalVideosProcessed + 1,
        totalFrames: newTotalFrames,
        processingTimeSec: newProcessingTime,
        fps: calculatedFps,
        confidenceList: confidences.length > 0
          ? [...prev.confidenceList, ...confidences]
          : prev.confidenceList,
        simulatedCount: prev.simulatedCount + (simulated ? 1 : 0),
      };
    });
  }, []);

  return {
    mode,
    signals,
    currentRoadIndex,
    currentPhase,
    phaseSecondsLeft,
    emergencyData,
    timelineEvents,
    demoMode,
    setDemoMode,
    analytics,
    activateEmergency,
    clearEmergency,
    resetSimulation,
    recordVideoProcessed,
    logEvent,
  };
}
