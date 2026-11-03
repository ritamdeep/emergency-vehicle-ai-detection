/**
 * Detection Segment Utilities
 * 
 * Pure functions for synchronizing video playback timestamp with
 * detected ambulance time segments.
 */

/**
 * Finds the active ambulance detection segment for a given playback timestamp t.
 *
 * @param {Array<{start_sec: number, end_sec: number, confidence: number}>} segments
 * @param {number} t - Current playback time in seconds
 * @param {Object} options
 * @param {number} [options.preroll=0.2] - Early trigger buffer in seconds before segment start
 * @param {number} [options.grace=1.5] - Post-segment hold buffer in seconds after segment end
 * @returns {Object|null} Matching active segment or null if outside any detection window
 */
export function getActiveSegment(segments, t, { preroll = 0.2, grace = 1.5 } = {}) {
  if (!Array.isArray(segments) || segments.length === 0 || typeof t !== 'number' || isNaN(t)) {
    return null;
  }

  let bestMatch = null;

  for (const seg of segments) {
    if (typeof seg?.start_sec === 'number' && typeof seg?.end_sec === 'number') {
      const activeStart = seg.start_sec - preroll;
      const activeEnd = seg.end_sec + grace;

      if (t >= activeStart && t <= activeEnd) {
        if (!bestMatch || (seg.confidence ?? 0) > (bestMatch.confidence ?? 0)) {
          bestMatch = seg;
        }
      }
    }
  }

  return bestMatch;
}
