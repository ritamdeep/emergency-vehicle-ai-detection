"""
Unit tests for segments.merge_hits_into_segments
"""

import pytest
from segments import merge_hits_into_segments


def test_empty():
    assert merge_hits_into_segments([], gap_sec=1.5) == []


def test_single_hit():
    hits = [(2.5, 0.88)]
    expected = [{"start_sec": 2.5, "end_sec": 2.5, "confidence": 0.88}]
    assert merge_hits_into_segments(hits, gap_sec=1.5) == expected


def test_merge_hits():
    # Hits at 1.0, 2.0, 3.2 (gaps: 1.0, 1.2 <= 1.5) -> should merge into one segment [1.0, 3.2]
    hits = [(1.0, 0.70), (2.0, 0.95), (3.2, 0.82)]
    result = merge_hits_into_segments(hits, gap_sec=1.5)
    assert len(result) == 1
    assert result[0]["start_sec"] == 1.0
    assert result[0]["end_sec"] == 3.2
    assert result[0]["confidence"] == 0.95


def test_split_hits():
    # Hits at 1.0, 2.0, then gap of 3.0s to 5.0, 6.0 -> 2 segments
    hits = [(1.0, 0.80), (2.0, 0.85), (5.0, 0.92), (6.0, 0.90)]
    result = merge_hits_into_segments(hits, gap_sec=1.5)
    assert len(result) == 2
    assert result[0] == {"start_sec": 1.0, "end_sec": 2.0, "confidence": 0.85}
    assert result[1] == {"start_sec": 5.0, "end_sec": 6.0, "confidence": 0.92}


def test_unsorted_input():
    # Hits out of chronological order
    hits = [(6.0, 0.90), (1.0, 0.80), (5.0, 0.92), (2.0, 0.85)]
    result = merge_hits_into_segments(hits, gap_sec=1.5)
    assert len(result) == 2
    assert result[0]["start_sec"] == 1.0
    assert result[0]["end_sec"] == 2.0
    assert result[1]["start_sec"] == 5.0
    assert result[1]["end_sec"] == 6.0


def test_max_confidence():
    # Verify the segment retains the peak confidence regardless of position
    hits = [(10.0, 0.60), (11.0, 0.99), (12.0, 0.40)]
    result = merge_hits_into_segments(hits, gap_sec=1.5)
    assert len(result) == 1
    assert result[0]["confidence"] == 0.99
