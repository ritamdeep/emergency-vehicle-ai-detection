/**
 * API Service Layer for AI-Based Emergency Traffic Signal Management System
 * 
 * Communicates with the Python/YOLO detection backend.
 * Base URL configurable via VITE_API_URL environment variable.
 */

import { TRAFFIC_CONFIG } from '../config/trafficConfig';

class TrafficApiService {
  constructor(baseUrl = TRAFFIC_CONFIG.API.BASE_URL) {
    this.baseUrl = baseUrl ? baseUrl.replace(/\/+$/, '') : null;
  }

  isConfigured() {
    return Boolean(this.baseUrl);
  }

  /**
   * Check connection status of the backend API
   */
  async checkHealth() {
    if (!this.baseUrl) {
      return { online: false, unconfigured: true, status: 'unconfigured' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(`${this.baseUrl}${TRAFFIC_CONFIG.API.ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { online: false, unconfigured: false, status: 'offline', error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { online: true, unconfigured: false, status: 'online', ...data };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        online: false,
        unconfigured: false,
        status: 'offline',
        error: error.name === 'AbortError' ? 'Health check timed out' : error.message,
      };
    }
  }

  /**
   * Send video file for a specific lane to the AI detection model
   * 
   * @param {File} videoFile - The video file to process
   * @param {number} laneId - The lane ID (1 through 8)
   * @returns {Promise<Object>} Detection response
   */
  async detectAmbulance(videoFile, laneId) {
    if (!this.baseUrl) {
      throw new Error('Detection server is unconfigured. Set VITE_API_URL or enable Demo Mode.');
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('lane_id', laneId.toString());

    try {
      let endpoint = `${this.baseUrl}${TRAFFIC_CONFIG.API.ENDPOINTS.DETECT}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Fallback to secondary endpoint if 404
        if (response.status === 404) {
          const fallbackEndpoint = `${this.baseUrl}${TRAFFIC_CONFIG.API.ENDPOINTS.PROCESS_VIDEO}`;
          const fallbackRes = await fetch(fallbackEndpoint, {
            method: 'POST',
            body: formData,
          });
          if (!fallbackRes.ok) {
            throw new Error(`API error (${fallbackRes.status}): ${fallbackRes.statusText}`);
          }
          return await fallbackRes.json();
        }
        throw new Error(`API error (${response.status}): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[TrafficApiService] Detection request failed on lane ${laneId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch model evaluation performance metrics (Precision, Recall, mAP) from backend
   */
  async fetchModelMetrics() {
    if (!this.baseUrl) return null;

    try {
      const response = await fetch(`${this.baseUrl}${TRAFFIC_CONFIG.API.ENDPOINTS.METRICS}`, {
        method: 'GET',
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
}

export const apiService = new TrafficApiService();
export default apiService;
