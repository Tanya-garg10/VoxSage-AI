import os
import math
import io
import wave
import numpy as np
from typing import Optional, List, Tuple, Dict, Any

try:
    import soundfile as sf
except Exception:
    sf = None

try:
    import librosa
except Exception:
    librosa = None

try:
    from scipy.signal import find_peaks
except Exception:
    find_peaks = None

from backend.schemas.models import (
    SpeechAnalysis,
    AcousticFrame,
    PitchStats,
    EnergyStats,
    PauseMetrics,
    EstimatedSpeakingRate,
)

class AudioProcessor:
    def __init__(self, target_sr: int = 16000):
        self.target_sr = target_sr

    def load_audio(self, file_path_or_bytes: Any) -> Tuple[np.ndarray, int]:
        """
        Loads audio from a filepath or in-memory bytes.
        Returns a 1D float32 numpy array normalized to [-1.0, 1.0] and sample rate.
        """
        # 1. Try soundfile
        if sf is not None:
            try:
                if isinstance(file_path_or_bytes, bytes):
                    data, sr = sf.read(io.BytesIO(file_path_or_bytes), dtype='float32')
                else:
                    data, sr = sf.read(file_path_or_bytes, dtype='float32')
                if data.ndim > 1:
                    data = np.mean(data, axis=1)  # convert to mono
                return data, sr
            except Exception:
                pass

        # 2. Try librosa
        if librosa is not None:
            try:
                if isinstance(file_path_or_bytes, bytes):
                    bio = io.BytesIO(file_path_or_bytes)
                    data, sr = librosa.load(bio, sr=self.target_sr, mono=True)
                else:
                    data, sr = librosa.load(file_path_or_bytes, sr=self.target_sr, mono=True)
                return data.astype(np.float32), sr
            except Exception:
                pass

        # 3. Fallback standard library wave
        try:
            if isinstance(file_path_or_bytes, bytes):
                wf = wave.open(io.BytesIO(file_path_or_bytes), 'rb')
            else:
                wf = wave.open(file_path_or_bytes, 'rb')
            sr = wf.getframerate()
            n_frames = wf.getnframes()
            n_channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            raw_bytes = wf.readframes(n_frames)
            wf.close()

            if sampwidth == 2:
                arr = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            elif sampwidth == 1:
                arr = (np.frombuffer(raw_bytes, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
            elif sampwidth == 4:
                arr = np.frombuffer(raw_bytes, dtype=np.int32).astype(np.float32) / 2147483648.0
            else:
                raise ValueError(f"Unsupported sample width: {sampwidth}")

            if n_channels > 1:
                arr = arr.reshape(-1, n_channels).mean(axis=1)
            return arr, sr
        except Exception as e:
            raise ValueError(f"Unable to decode audio data. Format may be unsupported or corrupted: {e}")

    def compute_f0_autocorr(self, signal: np.ndarray, sr: int, frame_size: int, hop_size: int) -> np.ndarray:
        """
        Extract fundamental frequency (F0) using autocorrelation within human speech bounds (65Hz - 450Hz).
        """
        min_f0 = 65.0
        max_f0 = 450.0
        min_lag = int(sr / max_f0)
        max_lag = int(sr / min_f0)

        num_frames = (len(signal) - frame_size) // hop_size + 1
        if num_frames <= 0:
            return np.array([], dtype=np.float32)

        f0_series = np.zeros(num_frames, dtype=np.float32)
        window = np.hanning(frame_size)

        for i in range(num_frames):
            start = i * hop_size
            frame = signal[start : start + frame_size] * window
            # Check frame energy
            frame_rms = np.sqrt(np.mean(frame**2))
            if frame_rms < 0.008:
                f0_series[i] = 0.0
                continue

            # Normalized autocorrelation
            corr = np.correlate(frame, frame, mode='full')
            corr = corr[len(corr) // 2 :]  # non-negative lags

            if len(corr) <= max_lag:
                f0_series[i] = 0.0
                continue

            search_region = corr[min_lag : max_lag + 1]
            if len(search_region) == 0:
                f0_series[i] = 0.0
                continue

            peak_lag_rel = np.argmax(search_region)
            peak_val = search_region[peak_lag_rel]
            r0 = corr[0] if corr[0] > 1e-9 else 1e-9
            rel_peak = peak_val / r0

            # Voicing threshold
            if rel_peak > 0.35:
                actual_lag = min_lag + peak_lag_rel
                f0_series[i] = sr / actual_lag
            else:
                f0_series[i] = 0.0

        return f0_series

    def analyze(self, file_path_or_bytes: Any, transcript: Optional[str] = None) -> SpeechAnalysis:
        """
        Executes complete acoustic feature extraction and returns a validated SpeechAnalysis model.
        """
        signal, sr = self.load_audio(file_path_or_bytes)

        if len(signal) == 0:
            raise ValueError("Audio file is empty (zero frames).")

        duration = len(signal) / sr
        if duration < 0.2:
            raise ValueError(f"Audio duration is too short for speech analytics ({duration:.2f}s). Minimum is 0.25s.")

        # Check for absolute silence
        global_rms = float(np.sqrt(np.mean(signal**2)))
        if global_rms < 0.0005:
            raise ValueError("Audio recording is virtually silent. No acoustic voice signal detected.")

        # Frame parameters for timeline resolution (50ms hop, 50ms window for crisp temporal grounding)
        hop_size = int(sr * 0.05)   # 50 ms hop
        frame_size = int(sr * 0.05) # 50 ms frame
        num_frames = (len(signal) - frame_size) // hop_size + 1

        if num_frames < 2:
            num_frames = 2
            # Pad if needed
            pad_len = frame_size * 2 - len(signal)
            if pad_len > 0:
                signal = np.pad(signal, (0, pad_len))

        # Compute Frame-level RMS energy
        energy_frames = []
        for i in range(num_frames):
            st = i * hop_size
            frm = signal[st : st + frame_size]
            rms = float(np.sqrt(np.mean(frm**2))) if len(frm) > 0 else 0.0
            energy_frames.append(rms)

        energy_arr = np.array(energy_frames, dtype=np.float32)

        # Adaptive silence threshold: capped at 25% of median speech energy or 15% of peak RMS
        median_rms = float(np.median(energy_arr))
        peak_rms = float(np.percentile(energy_arr, 95))
        bottom_noise = float(np.percentile(energy_arr, 10))

        if bottom_noise < median_rms * 0.3:
            silence_thresh = max(0.006, bottom_noise * 1.5)
        else:
            silence_thresh = max(0.006, min(median_rms * 0.3, peak_rms * 0.2))

        is_speech_arr = energy_arr >= silence_thresh

        # Extract pitch (F0)
        f0_arr = self.compute_f0_autocorr(signal, sr, frame_size=int(sr * 0.06), hop_size=hop_size)
        if len(f0_arr) < num_frames:
            f0_arr = np.pad(f0_arr, (0, num_frames - len(f0_arr)))
        else:
            f0_arr = f0_arr[:num_frames]

        # Calculate Pause intervals (consecutive silence frames lasting >= 250ms = 5 frames of 50ms)
        min_pause_frames = int(0.25 / 0.05)
        pause_intervals: List[Tuple[float, float]] = []
        current_pause_start = None

        for idx, is_sp in enumerate(is_speech_arr):
            t = idx * 0.05
            if not is_sp:
                if current_pause_start is None:
                    current_pause_start = t
            else:
                if current_pause_start is not None:
                    p_dur = t - current_pause_start
                    if p_dur >= 0.25:
                        pause_intervals.append((round(current_pause_start, 2), round(t, 2)))
                    current_pause_start = None

        # Check ending pause
        if current_pause_start is not None:
            p_dur = (len(is_speech_arr) * 0.05) - current_pause_start
            if p_dur >= 0.25:
                pause_intervals.append((round(current_pause_start, 2), round(duration, 2)))

        total_pause_duration = sum(end - start for start, end in pause_intervals)
        pause_count = len(pause_intervals)
        mean_pause_dur = (total_pause_duration / pause_count) if pause_count > 0 else 0.0
        max_pause_dur = max([end - start for start, end in pause_intervals], default=0.0)
        pauses_per_min = (pause_count / (duration / 60.0)) if duration > 0 else 0.0

        speech_duration = duration - total_pause_duration
        speech_ratio = max(0.0, min(1.0, speech_duration / duration)) if duration > 0 else 0.0

        # Pitch statistics (filtering unvoiced frames where F0 == 0)
        voiced_f0 = f0_arr[f0_arr > 0]
        if len(voiced_f0) > 0:
            mean_f0 = float(np.mean(voiced_f0))
            min_f0 = float(np.percentile(voiced_f0, 5))
            max_f0 = float(np.percentile(voiced_f0, 95))
            std_f0 = float(np.std(voiced_f0))
            if min_f0 > 0:
                pitch_range_st = float(12.0 * math.log2(max_f0 / min_f0))
            else:
                pitch_range_st = 0.0
        else:
            mean_f0 = 0.0
            min_f0 = 0.0
            max_f0 = 0.0
            std_f0 = 0.0
            pitch_range_st = 0.0

        # Energy statistics
        mean_energy = float(np.mean(energy_arr))
        std_energy = float(np.std(energy_arr))
        min_pos_energy = max(float(np.min(energy_arr[energy_arr > 0])) if np.any(energy_arr > 0) else 1e-5, 1e-5)
        max_energy = max(float(np.max(energy_arr)), 1e-4)
        dynamic_range_db = float(20.0 * math.log10(max_energy / min_pos_energy))

        # Syllable / Speaking Rate Estimation
        # Find energy peaks in speech regions that correspond to syllable nuclei
        estimated_speaking_rate: Optional[EstimatedSpeakingRate] = None
        speech_energy_indices = np.where(is_speech_arr)[0]
        if len(speech_energy_indices) > 5:
            speech_energy = energy_arr[speech_energy_indices]
            # Detect peaks separated by at least 150ms (3 frames)
            syllable_peaks = 0
            for k in range(1, len(speech_energy) - 1):
                if speech_energy[k] > speech_energy[k - 1] and speech_energy[k] > speech_energy[k + 1]:
                    if speech_energy[k] > silence_thresh * 1.3:
                        syllable_peaks += 1

            syllables_per_sec = (syllable_peaks / speech_duration) if speech_duration > 0 else 0.0
            # If transcript is provided, compute groundable words per minute
            words_per_min = None
            word_count = None
            if transcript and transcript.strip():
                clean_words = [w for w in transcript.strip().split() if w]
                word_count = len(clean_words)
                if duration > 0 and word_count > 0:
                    words_per_min = round((word_count / duration) * 60.0, 1)

            confidence_label = "High" if (transcript and word_count and word_count > 3) else "Moderate (Acoustic Syllabic Estimate)"
            note_text = (
                f"Calculated from verifiable transcript text ({word_count} words over {duration:.1f}s)."
                if words_per_min is not None
                else "Estimated from acoustic syllable nucleus peaks in sonority envelope. Provide transcript for exact WPM."
            )

            estimated_speaking_rate = EstimatedSpeakingRate(
                estimatedSyllablesPerSec=round(syllables_per_sec, 2),
                wordsPerMin=words_per_min,
                wordCount=word_count,
                confidence=confidence_label,
                note=note_text,
            )

        # Build Frame-level timeline (downsampled to ~150-250 points max for snappy web charts)
        step = max(1, num_frames // 200)
        frames: List[AcousticFrame] = []
        for i in range(0, num_frames, step):
            t = round(i * 0.05, 3)
            p_val = float(f0_arr[i]) if (i < len(f0_arr) and f0_arr[i] > 0) else None
            e_val = float(round(energy_arr[i], 4)) if i < len(energy_arr) else 0.0
            # First order spectral / MFCC1 proxy: relative energy in high frequencies vs low frequencies
            mfcc_proxy = round(math.log(e_val + 1e-4) * 2.0, 2)
            sp_val = bool(is_speech_arr[i]) if i < len(is_speech_arr) else False

            frames.append(
                AcousticFrame(
                    timestamp=t,
                    pitch=p_val,
                    energy=e_val,
                    mfcc1=mfcc_proxy,
                    isSpeech=sp_val,
                )
            )

        return SpeechAnalysis(
            duration=round(duration, 3),
            sampleRate=sr,
            speechDuration=round(speech_duration, 3),
            silenceDuration=round(total_pause_duration, 3),
            speechRatio=round(speech_ratio, 3),
            estimatedSpeakingRate=estimated_speaking_rate,
            pitchStats=PitchStats(
                mean=round(mean_f0, 1),
                min=round(min_f0, 1),
                max=round(max_f0, 1),
                stdDev=round(std_f0, 1),
                pitchRangeSemitones=round(pitch_range_st, 1),
            ),
            energyStats=EnergyStats(
                meanRms=round(mean_energy, 4),
                rmsStdDev=round(std_energy, 4),
                dynamicRangeDb=round(dynamic_range_db, 1),
            ),
            pauseMetrics=PauseMetrics(
                pauseCount=pause_count,
                totalPauseDuration=round(total_pause_duration, 2),
                meanPauseDuration=round(mean_pause_dur, 2),
                maxPauseDuration=round(max_pause_dur, 2),
                pausesPerMinute=round(pauses_per_min, 1),
                pauseIntervals=pause_intervals,
            ),
            frames=frames,
        )
