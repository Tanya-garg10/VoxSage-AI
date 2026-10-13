import numpy as np
from typing import Dict, Any, Tuple, List
from backend.schemas.models import AlignmentInfo, SpeechAnalysis

class TemporalAligner:
    """
    Performs acoustic trajectory alignment between reference and participant recordings.
    Uses Dynamic Time Warping (DTW) on normalized energy envelopes and speech ratios.
    """

    def __init__(self):
        pass

    def compute_dtw(self, seq_a: np.ndarray, seq_b: np.ndarray) -> Tuple[float, List[Tuple[int, int]]]:
        """
        Calculates DTW distance and optimal warping path between two 1D feature vectors.
        """
        n, m = len(seq_a), len(seq_b)
        if n == 0 or m == 0:
            return 0.0, []

        cost_matrix = np.full((n + 1, m + 1), np.inf, dtype=np.float32)
        cost_matrix[0, 0] = 0.0

        for i in range(1, n + 1):
            for j in range(1, m + 1):
                dist = abs(float(seq_a[i - 1]) - float(seq_b[j - 1]))
                cost_matrix[i, j] = dist + min(
                    cost_matrix[i - 1, j],      # insertion
                    cost_matrix[i, j - 1],      # deletion
                    cost_matrix[i - 1, j - 1]   # match
                )

        # Backtrack optimal warping path
        i, j = n, m
        path = []
        while i > 0 and j > 0:
            path.append((i - 1, j - 1))
            choices = [
                (cost_matrix[i - 1, j - 1], i - 1, j - 1),
                (cost_matrix[i - 1, j], i - 1, j),
                (cost_matrix[i, j - 1], i, j - 1),
            ]
            choices.sort(key=lambda x: x[0])
            _, i, j = choices[0]

        path.reverse()
        normalized_distance = float(cost_matrix[n, m] / (n + m))
        return normalized_distance, path

    def align(self, ref_analysis: SpeechAnalysis, part_analysis: SpeechAnalysis) -> AlignmentInfo:
        ref_dur = ref_analysis.duration
        part_dur = part_analysis.duration
        dur_ratio = (part_dur / ref_dur) if ref_dur > 0 else 1.0

        ref_energies = np.array([f.energy for f in ref_analysis.frames], dtype=np.float32)
        part_energies = np.array([f.energy for f in part_analysis.frames], dtype=np.float32)

        # Normalize energy arrays for scale-invariant dynamic time warping
        if len(ref_energies) > 0 and np.max(ref_energies) > 0:
            ref_norm = ref_energies / np.max(ref_energies)
        else:
            ref_norm = ref_energies

        if len(part_energies) > 0 and np.max(part_energies) > 0:
            part_norm = part_energies / np.max(part_energies)
        else:
            part_norm = part_energies

        dtw_dist, _ = self.compute_dtw(ref_norm, part_norm)

        limitations = (
            "Temporal alignment is computed via acoustic energy envelope dynamic time warping (DTW). "
            "Note: Non-linear phrasing differences, speaker baseline pitch differences, and background noise "
            "can shift local temporal correspondence. Sub-word phonetic alignment requires phoneme forced alignment."
        )

        return AlignmentInfo(
            method="Acoustic Energy Dynamic Time Warping (DTW) with Duration Normalization",
            dtwDistance=round(dtw_dist, 4),
            referenceDuration=round(ref_dur, 2),
            participantDuration=round(part_dur, 2),
            durationRatio=round(dur_ratio, 3),
            limitations=limitations,
        )
