import math
import numpy as np
from typing import Tuple, Dict, Any, List

class ControlledSyntheticGenerator:
    """
    Generates controlled audio test examples from base audio signals by applying
    isolated acoustic transformations (e.g. speed perturbation, inserted silence pauses,
    energy attenuation/fade, pitch shift).
    CRITICAL: All generated outputs are explicitly tagged as synthetic transformations.
    """

    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate

    def generate_base_speech_tone(self, duration_sec: float = 4.0) -> np.ndarray:
        """
        Synthesizes a realistic harmonic vocalic base signal with fundamental frequency
        inflection (F0 contour ~ 140Hz-170Hz) and formants (500Hz, 1500Hz, 2500Hz)
        with continuous natural phrasing.
        """
        sr = self.sample_rate
        total_samples = int(duration_sec * sr)
        t = np.linspace(0, duration_sec, total_samples, endpoint=False)

        # Dynamic F0 contour with natural intonation rise and fall
        f0 = 145.0 + 25.0 * np.sin(2 * np.pi * 0.4 * t) + 10.0 * np.cos(2 * np.pi * 0.8 * t)

        # Integrated phase for continuous frequency modulation
        phase = 2 * np.pi * np.cumsum(f0) / sr

        # Harmonic series with vocal tract envelope
        vocal = (
            0.55 * np.sin(phase)
            + 0.28 * np.sin(2 * phase)
            + 0.18 * np.sin(3 * phase)
            + 0.10 * np.sin(4 * phase)
        )

        # Syllabic amplitude envelope (4-5 speech syllables per second)
        syllable_env = 0.5 + 0.5 * np.sin(2 * np.pi * 4.2 * t)**2
        # Smooth attack and decay at sentence boundaries
        boundary_fade = np.clip(t / 0.15, 0, 1) * np.clip((duration_sec - t) / 0.15, 0, 1)

        signal = vocal * syllable_env * boundary_fade
        signal = signal / (np.max(np.abs(signal)) + 1e-6) * 0.75
        return signal.astype(np.float32)

    def apply_inserted_pause(
        self, base_signal: np.ndarray, pause_start_sec: float = 1.8, pause_duration_sec: float = 1.2
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Inserts silence into an existing speech stream at an exact timestamp.
        """
        sr = self.sample_rate
        idx_start = int(pause_start_sec * sr)
        pause_samples = int(pause_duration_sec * sr)

        part1 = base_signal[:idx_start]
        silence = np.zeros(pause_samples, dtype=np.float32)
        part2 = base_signal[idx_start:]

        modified = np.concatenate([part1, silence, part2])
        meta = {
            "transformation": "inserted_pause",
            "flaw_category": "excessive_pauses",
            "ground_truth_start": pause_start_sec,
            "ground_truth_end": round(pause_start_sec + pause_duration_sec, 2),
            "pause_duration_sec": pause_duration_sec,
            "is_synthetic": True,
            "annotation_method": "controlled_algorithmic_insertion",
        }
        return modified, meta

    def apply_speed_perturbation(
        self, base_signal: np.ndarray, speed_factor: float = 1.45
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Speeds up or slows down delivery using linear interpolation resample.
        """
        n_orig = len(base_signal)
        n_new = int(n_orig / speed_factor)
        x_orig = np.linspace(0, 1, n_orig)
        x_new = np.linspace(0, 1, n_new)
        modified = np.interp(x_new, x_orig, base_signal).astype(np.float32)

        meta = {
            "transformation": "speed_perturbation",
            "speed_factor": speed_factor,
            "flaw_category": "rushed_delivery" if speed_factor > 1.0 else "sluggish_tempo",
            "ground_truth_start": 0.0,
            "ground_truth_end": round(len(modified) / self.sample_rate, 2),
            "is_synthetic": True,
            "annotation_method": "controlled_resampling_perturbation",
        }
        return modified, meta

    def apply_energy_fade(
        self, base_signal: np.ndarray, fade_start_sec: float = 2.0, fade_duration_sec: float = 1.5, attenuation_ratio: float = 0.2
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Attenuates energy in a specific window to emulate vocal fade / drop in projection.
        """
        sr = self.sample_rate
        modified = base_signal.copy()
        start_idx = int(fade_start_sec * sr)
        end_idx = min(len(base_signal), int((fade_start_sec + fade_duration_sec) * sr))

        fade_len = end_idx - start_idx
        if fade_len > 0:
            scale_envelope = np.linspace(1.0, attenuation_ratio, fade_len, dtype=np.float32)
            modified[start_idx:end_idx] *= scale_envelope

        meta = {
            "transformation": "energy_fade",
            "flaw_category": "vocal_fade",
            "ground_truth_start": fade_start_sec,
            "ground_truth_end": round(fade_start_sec + fade_duration_sec, 2),
            "attenuation_ratio": attenuation_ratio,
            "is_synthetic": True,
            "annotation_method": "controlled_envelope_attenuation",
        }
        return modified, meta
