import sys
import os
import unittest
import numpy as np

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.analysis.audio_processor import AudioProcessor
from backend.comparison.aligner import TemporalAligner
from backend.comparison.deviations import DeviationDetector
from backend.evaluation.synthetic_generator import ControlledSyntheticGenerator
from backend.evaluation.evaluator import BenchmarkEvaluator

class TestVoxSageAudioPipeline(unittest.TestCase):
    def setUp(self):
        self.processor = AudioProcessor(target_sr=16000)
        self.aligner = TemporalAligner()
        self.detector = DeviationDetector()
        self.generator = ControlledSyntheticGenerator(sample_rate=16000)
        self.evaluator = BenchmarkEvaluator()

    def test_synthetic_tone_generation(self):
        signal = self.generator.generate_base_speech_tone(duration_sec=3.0)
        self.assertEqual(len(signal), 3 * 16000)
        self.assertGreater(np.max(np.abs(signal)), 0.1)

    def test_inserted_pause_transformation(self):
        base = self.generator.generate_base_speech_tone(duration_sec=3.0)
        modified, meta = self.generator.apply_inserted_pause(base, pause_start_sec=1.0, pause_duration_sec=1.0)
        self.assertEqual(len(modified), 4 * 16000)
        self.assertEqual(meta["flaw_category"], "excessive_pauses")
        self.assertEqual(meta["is_synthetic"], True)
        self.assertEqual(meta["ground_truth_start"], 1.0)
        self.assertEqual(meta["ground_truth_end"], 2.0)

    def test_speed_perturbation_transformation(self):
        base = self.generator.generate_base_speech_tone(duration_sec=3.0)
        modified, meta = self.generator.apply_speed_perturbation(base, speed_factor=1.5)
        self.assertEqual(len(modified), 2 * 16000)
        self.assertEqual(meta["flaw_category"], "rushed_delivery")
        self.assertEqual(meta["is_synthetic"], True)

    def test_energy_fade_transformation(self):
        base = self.generator.generate_base_speech_tone(duration_sec=4.0)
        modified, meta = self.generator.apply_energy_fade(base, fade_start_sec=2.0, fade_duration_sec=1.5, attenuation_ratio=0.1)
        self.assertEqual(len(modified), len(base))
        self.assertEqual(meta["flaw_category"], "vocal_fade")
        # Check energy in faded region is lower
        energy_orig = np.mean(base[int(2.5 * 16000):int(3.5 * 16000)]**2)
        energy_faded = np.mean(modified[int(2.5 * 16000):int(3.5 * 16000)]**2)
        self.assertLess(energy_faded, energy_orig)

    def test_dtw_calculation(self):
        seq_a = np.array([0.1, 0.5, 0.8, 0.2], dtype=np.float32)
        seq_b = np.array([0.1, 0.5, 0.8, 0.2], dtype=np.float32)
        dist, path = self.aligner.compute_dtw(seq_a, seq_b)
        self.assertAlmostEqual(dist, 0.0, places=3)
        self.assertGreater(len(path), 0)

    def test_interval_iou(self):
        # Exact match
        iou1 = self.evaluator.compute_interval_iou(1.0, 3.0, 1.0, 3.0)
        self.assertAlmostEqual(iou1, 1.0, places=3)

        # 50% overlap
        iou2 = self.evaluator.compute_interval_iou(1.0, 3.0, 2.0, 4.0)
        self.assertAlmostEqual(iou2, 1.0 / 3.0, places=3)

        # Disjoint
        iou3 = self.evaluator.compute_interval_iou(1.0, 2.0, 3.0, 4.0)
        self.assertAlmostEqual(iou3, 0.0, places=3)

    def test_autocorrelation_f0_pitch(self):
        # Generate pure 200 Hz tone
        sr = 16000
        t = np.linspace(0, 0.5, int(sr * 0.5), endpoint=False)
        tone = np.sin(2 * np.pi * 200.0 * t).astype(np.float32)
        f0_arr = self.processor.compute_f0_autocorr(tone, sr, frame_size=int(sr * 0.06), hop_size=int(sr * 0.05))
        voiced = f0_arr[f0_arr > 0]
        self.assertGreater(len(voiced), 0)
        mean_f0 = np.mean(voiced)
        self.assertAlmostEqual(mean_f0, 200.0, delta=10.0)

if __name__ == "__main__":
    unittest.main()
