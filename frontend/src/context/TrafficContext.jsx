/**
 * Traffic Context Provider
 * 
 * Centralizes the live simulation state machine, metrics, backend status,
 * and demo controls so all routes share synchronized signal states, timers, and telemetry.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTrafficController } from '../hooks/useTrafficController';
import { apiService } from '../services/api';
import { STATIC_MODEL_METRICS } from '../data/modelMetrics';

const TrafficContext = createContext(null);

export function TrafficProvider({ children }) {
  const controller = useTrafficController();

  // Initialize metrics with static baseline defaults so panels never display '--'
  const [backendMetrics, setBackendMetrics] = useState(STATIC_MODEL_METRICS.metrics);
  const [confusionMatrix, setConfusionMatrix] = useState(STATIC_MODEL_METRICS.confusion_matrix);
  const [metricsSource, setMetricsSource] = useState('Validation run (static)');

  // Backend connection status: 'online' | 'offline' | 'unconfigured'
  const [backendStatus, setBackendStatus] = useState(
    apiService.isConfigured() ? 'offline' : 'unconfigured'
  );

  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [lastSummary, setLastSummary] = useState(null);

  // Sync last emergency incident for audit summary
  useEffect(() => {
    if (controller.emergencyData && controller.emergencyData.active) {
      setLastSummary({
        laneId: controller.emergencyData.laneId,
        roadName: controller.emergencyData.roadName,
        signalId: controller.emergencyData.signalId,
        confidence: controller.emergencyData.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    }
  }, [controller.emergencyData]);

  // Health check and metrics synchronization (runs on load and every 30s)
  useEffect(() => {
    let isMounted = true;

    const checkServer = async () => {
      if (!apiService.isConfigured()) {
        if (isMounted) setBackendStatus('unconfigured');
        return;
      }

      const health = await apiService.checkHealth();
      if (!isMounted) return;

      if (health.online) {
        setBackendStatus('online');
        // Fetch live evaluation metrics when server is online
        const liveMetrics = await apiService.fetchModelMetrics();
        if (isMounted && liveMetrics) {
          if (liveMetrics.metrics) setBackendMetrics(liveMetrics.metrics);
          if (liveMetrics.confusion_matrix) setConfusionMatrix(liveMetrics.confusion_matrix);
          setMetricsSource('Live from server');
        }
      } else {
        setBackendStatus(health.unconfigured ? 'unconfigured' : 'offline');
      }
    };

    checkServer();
    const intervalId = setInterval(checkServer, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const value = {
    ...controller,
    backendStatus,
    backendMetrics,
    confusionMatrix,
    metricsSource,
    lastSummary,
    isDemoDrawerOpen,
    setIsDemoDrawerOpen,
    openDemoDrawer: () => setIsDemoDrawerOpen(true),
    closeDemoDrawer: () => setIsDemoDrawerOpen(false),
  };

  return (
    <TrafficContext.Provider value={value}>
      {children}
    </TrafficContext.Provider>
  );
}

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
}
