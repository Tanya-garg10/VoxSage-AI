import uuid
import numpy as np
from typing import List, Tuple, Dict, Any
from backend.schemas.models import (
    SpeechAnalysis,
    FlawGrounding,
    ComparisonSummary,
    ContrastiveComparisonResult,
    AlignmentInfo,
)

class DeviationDetector:
    """
    Evaluates contrastive acoustic deviations between reference and participant recordings,
    grounding candidate delivery issues to specific temporal windows in the participant timeline.
    """

    def __init__(
        self,
        energy_deviation_threshold: float = 0.35,
        pause_duration_threshold_sec: float = 0.8,
        pitch_deviation_st_threshold: float = 3.5,
    ):
        self.energy_deviation_threshold = energy_deviation_threshold
        self.pause_duration_threshold_sec = pause_duration_threshold_sec
        self.pitch_deviation_st_threshold = pitch_deviation_st_threshold

    def detect_deviations(
        self, ref: SpeechAnalysis, part: SpeechAnalysis, alignment: AlignmentInfo
    ) -> List[FlawGrounding]:
        deviations: List[FlawGrounding] = []
        dur_ratio = alignment.durationRatio

        # 1. Macro-level Tempo & Overall Duration Divergence
        if dur_ratio < 0.78:
            deviations.append(
                FlawGrounding(
                    id=str(uuid.uuid4())[:8],
                    startTime=0.0,
                    endTime=min(part.duration, 4.0),
                    feature="speaking_rate",
                    severity="high" if dur_ratio < 0.65 else "medium",
                    title="Candidate Delivery Issue: Accelerated / Rushed Delivery",
                    measuredDeviation=f"{(1.0 - dur_ratio) * 100:.1f}% faster than reference",
                    referenceValue=f"{ref.duration:.2f}s total duration",
                    participantValue=f"{part.duration:.2f}s total duration",
                    evidence=f"Participant delivered the text in {part.duration:.2f}s compared to reference pace of {ref.duration:.2f}s (duration ratio: {dur_ratio:.2f}).",
                    suggestion="Pace your delivery deliberately; allow key phrases to breathe rather than rushing through transitions.",
                    confidence=0.88,
                    category="rushed_delivery",
                )
            )
        elif dur_ratio > 1.28:
            deviations.append(
                FlawGrounding(
                    id=str(uuid.uuid4())[:8],
                    startTime=0.0,
                    endTime=min(part.duration, 4.0),
                    feature="speaking_rate",
                    severity="high" if dur_ratio > 1.45 else "medium",
                    title="Candidate Delivery Issue: Sluggish / Overly Prolonged Delivery",
                    measuredDeviation=f"{(dur_ratio - 1.0) * 100:.1f}% slower than reference",
                    referenceValue=f"{ref.duration:.2f}s total duration",
                    participantValue=f"{part.duration:.2f}s total duration",
                    evidence=f"Participant delivery took {part.duration:.2f}s vs {ref.duration:.2f}s reference cadence (duration ratio: {dur_ratio:.2f}).",
                    suggestion="Maintain rhythmic momentum between clauses; reduce stagnant latency between vocalized phrases.",
                    confidence=0.86,
                    category="sluggish_tempo",
                )
            )

        # 2. Pause Anomalies & Hesitations
        # Inspect participant pauses that exceed reference pause profile or are unusually extended
        for p_start, p_end in part.pauseMetrics.pauseIntervals:
            p_len = p_end - p_start
            if p_len >= self.pause_duration_threshold_sec:
                # Map participant time back to reference time roughly
                ref_mapped_t = p_start / dur_ratio if dur_ratio > 0 else p_start
                # Check if reference had a pause at ref_mapped_t
                ref_has_pause = any(
                    abs(rp_start - ref_mapped_t) < 0.5 for rp_start, rp_end in ref.pauseMetrics.pauseIntervals
                )

                if not ref_has_pause or p_len > 1.5:
                    sev = "high" if p_len > 1.8 else "medium"
                    deviations.append(
                        FlawGrounding(
                            id=str(uuid.uuid4())[:8],
                            startTime=round(p_start, 2),
                            endTime=round(p_end, 2),
                            feature="pause_anomaly",
                            severity=sev,
                            title="Candidate Delivery Issue: Unnatural Extended Pause / Hesitation",
                            measuredDeviation=f"{p_len:.2f}s silence interval",
                            referenceValue=f"Mean ref pause: {ref.pauseMetrics.meanPauseDuration:.2f}s",
                            participantValue=f"{p_len:.2f}s pause at {p_start:.2f}s",
                            evidence=f"Participant halted speech for {p_len:.2f}s between {p_start:.2f}s and {p_end:.2f}s, whereas reference maintained verbal continuity.",
                            suggestion="Shorten inter-phrase hesitation. If pausing for dramatic emphasis, cap the silence window to ~0.4s to 0.6s.",
                            confidence=0.92,
                            category="excessive_pauses",
                        )
                    )

        # 3. Temporal Frame-by-Frame Acoustic Dynamics (Pitch & Energy)
        # Sample participant frames and align with corresponding reference frames
        num_frames = min(len(part.frames), len(ref.frames))
        if num_frames > 4:
            # Detect local energy collapse / vocal fade in participant
            ref_energies = [f.energy for f in ref.frames]
            part_energies = [f.energy for f in part.frames]
            ref_max_e = max(ref_energies) if ref_energies else 1.0
            part_max_e = max(part_energies) if part_energies else 1.0

            # Scan windows of 1-2 seconds (e.g. 10 frames)
            window_size = 8
            for w in range(0, num_frames - window_size, window_size):
                p_win = part.frames[w : w + window_size]
                ref_idx = min(int(w / dur_ratio), len(ref.frames) - window_size) if dur_ratio > 0 else w
                ref_win = ref.frames[max(0, ref_idx) : max(0, ref_idx) + window_size]

                t_start = p_win[0].timestamp
                t_end = p_win[-1].timestamp

                # Check for vocal energy fade (participant dropped substantially while reference projected)
                p_mean_e = np.mean([f.energy for f in p_win])
                r_mean_e = np.mean([f.energy for f in ref_win]) if ref_win else 0.0

                p_norm_e = p_mean_e / (part_max_e + 1e-6)
                r_norm_e = r_mean_e / (ref_max_e + 1e-6)

                if r_norm_e > 0.45 and p_norm_e < 0.18:
                    # Participant severely lost vocal power during an active phrase
                    deviations.append(
                        FlawGrounding(
                            id=str(uuid.uuid4())[:8],
                            startTime=round(t_start, 2),
                            endTime=round(t_end, 2),
                            feature="vocal_energy",
                            severity="medium",
                            title="Candidate Delivery Issue: Vocal Energy Fade / Low Projection",
                            measuredDeviation=f"{((r_norm_e - p_norm_e) / r_norm_e) * 100:.1f}% relative energy drop",
                            referenceValue=f"Proj: {r_norm_e:.2f} (RMS {r_mean_e:.3f})",
                            participantValue=f"Proj: {p_norm_e:.2f} (RMS {p_mean_e:.3f})",
                            evidence=f"Participant acoustic energy dropped to {p_norm_e:.2f} relative magnitude, while reference maintained solid breath support at {r_norm_e:.2f}.",
                            suggestion="Support phrase endings with diaphragmatic air support to prevent trailing off before finishing thoughts.",
                            confidence=0.84,
                            category="vocal_fade",
                        )
                    )
                    break  # report most salient energy flaw window

        # 4. Global Pitch Intonation & Monotone Detection
        ref_pitch_range = ref.pitchStats.pitchRangeSemitones
        part_pitch_range = part.pitchStats.pitchRangeSemitones
        if ref_pitch_range > 4.0 and part_pitch_range < 2.5:
            # Monotone delivery
            deviations.append(
                FlawGrounding(
                    id=str(uuid.uuid4())[:8],
                    startTime=round(part.duration * 0.15, 2),
                    endTime=round(part.duration * 0.75, 2),
                    feature="pitch_variation",
                    severity="high" if part_pitch_range < 1.6 else "medium",
                    title="Candidate Delivery Issue: Monotone Intonation / Flat Pitch Contour",
                    measuredDeviation=f"{ref_pitch_range - part_pitch_range:.1f} semitones narrower pitch dynamic",
                    referenceValue=f"{ref_pitch_range:.1f} semitones dynamic range (std {ref.pitchStats.stdDev:.1f} Hz)",
                    participantValue=f"{part_pitch_range:.1f} semitones dynamic range (std {part.pitchStats.stdDev:.1f} Hz)",
                    evidence=f"Participant maintained an uninflected pitch contour with only {part_pitch_range:.1f} semitones of pitch excursion, contrasting with reference melodic inflection ({ref_pitch_range:.1f} st).",
                    suggestion="Incorporate melodic variation on emphasize words (pitch accents) to guide listener focus.",
                    confidence=0.89,
                    category="monotone_pitch",
                )
            )

        # 5. Articulation & Spectral Mismatch
        if len(part.frames) > 10 and len(ref.frames) > 10:
            part_mfccs = [f.mfcc1 for f in part.frames]
            ref_mfccs = [f.mfcc1 for f in ref.frames]
            mfcc_diff = abs(np.mean(part_mfccs) - np.mean(ref_mfccs))
            if mfcc_diff > 3.0:
                mid_t = round(part.duration * 0.4, 2)
                deviations.append(
                    FlawGrounding(
                        id=str(uuid.uuid4())[:8],
                        startTime=mid_t,
                        endTime=round(min(part.duration, mid_t + 2.5), 2),
                        feature="acoustic_spectral",
                        severity="low",
                        title="Candidate Delivery Issue: Spectral Resonance & Articulation Discrepancy",
                        measuredDeviation=f"{mfcc_diff:.2f} MFCC-1 distance",
                        referenceValue=f"Mean MFCC1: {np.mean(ref_mfccs):.2f}",
                        participantValue=f"Mean MFCC1: {np.mean(part_mfccs):.2f}",
                        evidence="Discrepancy in spectral envelope balance, indicating either muffled consonants or variable microphone distance.",
                        suggestion="Articulate plosive and fricative consonants cleanly and maintain consistent distance from the microphone.",
                        confidence=0.74,
                        category="articulation_mismatch",
                    )
                )

        # Sort deviations chronologically by startTime
        deviations.sort(key=lambda d: d.startTime)
        return deviations

    def generate_summary(
        self, ref: SpeechAnalysis, part: SpeechAnalysis, deviations: List[FlawGrounding], alignment: AlignmentInfo
    ) -> ComparisonSummary:
        # Calculate quantitative acoustic similarity score (0 to 100)
        # Factor 1: Duration ratio (weight 25)
        dur_err = min(1.0, abs(alignment.durationRatio - 1.0))
        dur_score = (1.0 - dur_err) * 25.0

        # Factor 2: Pitch range congruence (weight 25)
        p_ref = max(0.1, ref.pitchStats.pitchRangeSemitones)
        p_part = max(0.1, part.pitchStats.pitchRangeSemitones)
        pitch_ratio = min(p_ref, p_part) / max(p_ref, p_part)
        pitch_score = pitch_ratio * 25.0

        # Factor 3: Pause ratio congruence (weight 25)
        ref_p_ratio = ref.silenceDuration / max(0.1, ref.duration)
        part_p_ratio = part.silenceDuration / max(0.1, part.duration)
        pause_score = (1.0 - min(1.0, abs(ref_p_ratio - part_p_ratio) * 2.0)) * 25.0

        # Factor 4: Energy dynamic range congruence (weight 25)
        dr_ref = max(1.0, ref.energyStats.dynamicRangeDb)
        dr_part = max(1.0, part.energyStats.dynamicRangeDb)
        energy_score = (min(dr_ref, dr_part) / max(dr_ref, dr_part)) * 25.0

        overall_score = round(max(10.0, min(100.0, dur_score + pitch_score + pause_score + energy_score)), 1)

        # Speaking rate text
        if alignment.durationRatio < 0.85:
            sp_rate_text = f"Accelerated delivery (ratio {alignment.durationRatio:.2f}). Participant finished {ref.duration - part.duration:.1f}s faster than reference."
        elif alignment.durationRatio > 1.15:
            sp_rate_text = f"Slower delivery (ratio {alignment.durationRatio:.2f}). Participant took {part.duration - ref.duration:.1f}s longer than reference."
        else:
            sp_rate_text = f"Well-matched cadence (ratio {alignment.durationRatio:.2f}). Temporal pacing closely matches reference."

        # Energy dynamics
        energy_text = (
            f"Participant dynamic range is {part.energyStats.dynamicRangeDb:.1f} dB (ref: {ref.energyStats.dynamicRangeDb:.1f} dB). "
            f"Mean RMS energy is {part.energyStats.meanRms:.3f} vs {ref.energyStats.meanRms:.3f}."
        )

        # Pitch stability
        pitch_text = (
            f"Participant semitone range is {part.pitchStats.pitchRangeSemitones:.1f} st with std {part.pitchStats.stdDev:.1f} Hz "
            f"(ref: {ref.pitchStats.pitchRangeSemitones:.1f} st, std {ref.pitchStats.stdDev:.1f} Hz)."
        )

        # Pause rhythm
        pause_text = (
            f"Participant recorded {part.pauseMetrics.pauseCount} pauses ({part.pauseMetrics.pausesPerMinute:.1f}/min, mean {part.pauseMetrics.meanPauseDuration:.2f}s) "
            f"vs reference {ref.pauseMetrics.pauseCount} pauses ({ref.pauseMetrics.pausesPerMinute:.1f}/min, mean {ref.pauseMetrics.meanPauseDuration:.2f}s)."
        )

        return ComparisonSummary(
            overallSimilarityScore=overall_score,
            speakingRateComparison=sp_rate_text,
            energyDynamicsComparison=energy_text,
            pitchStabilityComparison=pitch_text,
            pauseRhythmComparison=pause_text,
        )

    def compare(self, ref: SpeechAnalysis, part: SpeechAnalysis, alignment: AlignmentInfo) -> ContrastiveComparisonResult:
        deviations = self.detect_deviations(ref, part, alignment)
        summary = self.generate_summary(ref, part, deviations, alignment)

        return ContrastiveComparisonResult(
            referenceAnalysis=ref,
            participantAnalysis=part,
            alignment=alignment,
            deviations=deviations,
            summary=summary,
        )
