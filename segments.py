"""
Segment Clustering Module for Video Detections

Provides pure functions to merge discrete temporal detection hits into continuous
time segments with start_sec, end_sec, and maximum confidence.
"""

from typing import List, Tuple, Dict, Any


def merge_hits_into_segments(
    hits: List[Tuple[float, float]], gap_sec: float = 1.5
) -> List[Dict[str, Any]]:
    """
    Merges discrete detection timestamp hits into contiguous segments.

    Args:
        hits: List of (t_sec, confidence) tuples representing positive detections.
        gap_sec: Maximum time gap in seconds between consecutive hits to merge them
                 into the same contiguous segment. Defaults to 1.5.

    Returns:
        List of dicts: [{'start_sec': float, 'end_sec': float, 'confidence': float}]
        sorted by start_sec ascending.
    """
    if not hits:
        return []

    # Ensure input hits are sorted by timestamp
    sorted_hits = sorted(hits, key=lambda h: h[0])

    segments: List[Dict[str, Any]] = []
    current_start, current_end = sorted_hits[0][0], sorted_hits[0][0]
    current_max_conf = sorted_hits[0][1]

    for t_sec, conf in sorted_hits[1:]:
        if t_sec - current_end <= gap_sec:
            # Within threshold gap: extend current segment
            current_end = t_sec
            if conf > current_max_conf:
                current_max_conf = conf
        else:
            # Exceeded gap threshold: seal current segment and start new one
            segments.append({
                "start_sec": round(float(current_start), 3),
                "end_sec": round(float(current_end), 3),
                "confidence": round(float(current_max_conf), 3),
            })
            current_start = t_sec
            current_end = t_sec
            current_max_conf = conf

    # Append trailing segment
    segments.append({
        "start_sec": round(float(current_start), 3),
        "end_sec": round(float(current_end), 3),
        "confidence": round(float(current_max_conf), 3),
    })

    return segments
