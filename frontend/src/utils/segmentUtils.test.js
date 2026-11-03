import { describe, it, expect } from 'vitest';
import { getActiveSegment } from './segmentUtils';

describe('getActiveSegment', () => {
  const sampleSegments = [
    { start_sec: 2.0, end_sec: 5.0, confidence: 0.94 },
    { start_sec: 10.0, end_sec: 12.0, confidence: 0.88 },
  ];

  it('returns null for empty or invalid inputs', () => {
    expect(getActiveSegment([], 3.0)).toBeNull();
    expect(getActiveSegment(null, 3.0)).toBeNull();
    expect(getActiveSegment(sampleSegments, NaN)).toBeNull();
    expect(getActiveSegment(sampleSegments, '3.0')).toBeNull();
  });

  it('returns null when timestamp is well before any segment', () => {
    // 2.0 start with preroll 0.2 means active from 1.8
    expect(getActiveSegment(sampleSegments, 1.0)).toBeNull();
    expect(getActiveSegment(sampleSegments, 1.79)).toBeNull();
  });

  it('activates within the preroll window', () => {
    // at 1.8, should match due to preroll=0.2
    const seg = getActiveSegment(sampleSegments, 1.8);
    expect(seg).not.toBeNull();
    expect(seg.confidence).toBe(0.94);
  });

  it('matches inside the core segment window', () => {
    const seg = getActiveSegment(sampleSegments, 3.5);
    expect(seg).not.toBeNull();
    expect(seg.start_sec).toBe(2.0);
  });

  it('stays active during the post-segment grace period', () => {
    // end_sec: 5.0, grace: 1.5 -> active through 6.5
    expect(getActiveSegment(sampleSegments, 5.5)).not.toBeNull();
    expect(getActiveSegment(sampleSegments, 6.5)).not.toBeNull();
  });

  it('clears after the grace window expires', () => {
    // at 6.51, segment 1 is expired; segment 2 starts at 10.0 (preroll 9.8)
    expect(getActiveSegment(sampleSegments, 6.51)).toBeNull();
    expect(getActiveSegment(sampleSegments, 8.0)).toBeNull();
  });

  it('detects second segment correctly', () => {
    const seg = getActiveSegment(sampleSegments, 10.5);
    expect(seg).not.toBeNull();
    expect(seg.start_sec).toBe(10.0);
    expect(seg.confidence).toBe(0.88);
  });

  it('respects custom preroll and grace options', () => {
    // With preroll 1.0, 2.0 starts at 1.0; with grace 0.0, 5.0 ends at 5.0
    expect(getActiveSegment(sampleSegments, 1.2, { preroll: 1.0, grace: 0.0 })).not.toBeNull();
    expect(getActiveSegment(sampleSegments, 5.1, { preroll: 1.0, grace: 0.0 })).toBeNull();
  });
});
