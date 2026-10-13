# VoxSage Contrastive Speech Dataset

This directory contains the curated contrastive speech dataset for **VoxSage AI: Contrastive Speech Analytics & Temporal Flaw Grounding**.

## 1. Dataset Schema

Every contrastive pair adheres to the schema specified in `dataset/annotations/benchmark_pairs.json`:

```json
{
  "id": "STRING (e.g., PAIR-001-KEYNOTE)",
  "title": "STRING",
  "speechDomain": "STRING (e.g., Tech Keynote, Investor Pitch, Debate)",
  "speaker": "STRING",
  "transcript": "STRING",
  "hasAudio": true,
  "referenceAudioFile": "STRING",
  "participantAudioFile": "STRING",
  "flawCategory": "excessive_pauses | rushed_delivery | monotone_pitch | vocal_fade | erratic_cadence | articulation_mismatch",
  "flawSeverity": "mild | moderate | severe",
  "groundTruthIntervals": [
    {
      "start": 2.1,
      "end": 3.4,
      "label": "Detailed description of acoustic flaw"
    }
  ],
  "isSynthetic": false,
  "split": "train | validation | test",
  "notes": "STRING"
}
```

## 2. Flaw Categories

- **`excessive_pauses`**: Unnatural or halting silence (>0.8s) breaking syntactic flow where the reference maintained continuity.
- **`rushed_delivery`**: Delivery velocity exceeding baseline speaking rate by >25%, leading to collapsed syllable durations.
- **`monotone_pitch`**: Flat pitch inflection profile (<2.0 semitones of dynamic range across emotional/emphasis moments).
- **`vocal_fade`**: Drop in vocal projection / diaphragmatic breath support (>40% drop in RMS energy) at phrase terminals.
- **`articulation_mismatch`**: Significant spectral tilt deviation, muffled consonants, or microphone axis distance instability.

## 3. Human vs Synthetic Recording Protocol

1. **Human Recordings**:
   - Recorded under controlled acoustic conditions (condenser cardioid microphone, 48kHz 24-bit PCM).
   - Reference recordings demonstrate ideal prosody, measured pacing, dynamic pitch range, and deliberate pause placement.
   - Flawed recordings are produced either via spontaneous rehearsal hesitation or deliberate prosodic perturbation by trained orators.
   - Ground truth timestamps are annotated through two-rater acoustic waveform inspection with temporal boundary agreement $\le 0.1s$.

2. **Synthetic Transformations**:
   - Explicitly flagged with `"isSynthetic": true`.
   - Generated using `backend/evaluation/synthetic_generator.py` through controlled digital transformations (speed perturbation, algorithmic silence injection, parametric envelope attenuation).
   - Designed to provide mathematically exact, reproducible ground-truth boundary timestamps for precision and recall benchmarks.

## 4. Annotation Instructions for New Submissions

To submit a new speech pair:
1. Provide the master reference recording and flawed delivery recording of identical transcript.
2. Label silence and hesitation points using an audio editor (Audacity/Praat).
3. Assign severity: `mild` (minor delivery imperfection), `moderate` (noticeable impact on listener comprehension), or `severe` (major disruption).
4. Do NOT attribute rhetorical intent or subjective charisma ratings; strictly annotate measurable acoustic deviations.
