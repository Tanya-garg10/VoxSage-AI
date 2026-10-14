# VoxSage Contrastive Speech Dataset

This directory contains the curated contrastive speech dataset for **VoxSage AI: Contrastive Speech Analytics & Temporal Flaw Grounding**.

---

## 1. Hybrid Dataset Architecture

The VoxSage dataset implements a **1:Many Hybrid Contrastive Design**:
- **Reference Speech Source**: Ideal oration master tracks derived from public domain speech corpora (e.g., LibriSpeech CC BY 4.0, Mozilla Common Voice, and high-fidelity orator recordings) with verified verbatim transcripts.
- **Controlled Flawed Variants**: Each reference speech is paired against multiple controlled variants displaying isolated acoustic imperfections (`excessive_speed`, `excessive_pauses`, `vocal_fade`, and `monotone_pitch`).
- **Human Rehearsal Validation**: Real speaker delivery rehearsals are included to validate algorithm performance on natural human prosodic variation alongside synthetic transformations.

---

## 2. Dataset Schema

Every contrastive pair in `dataset/annotations/benchmark_pairs.json` provides both standard benchmark fields and UI visualization attributes:

```json
{
  "pair_id": "PAIR_001_PAUSE",
  "reference_file": "speech_keynote_ref.wav",
  "comparison_file": "speech_keynote_pause.wav",
  "transcript": "Welcome everyone. Today we are fundamentally redefining how humans interact with intelligent multimodal interfaces.",
  "flaw_type": "excessive_pauses",
  "start_time": 2.1,
  "end_time": 3.4,
  "annotation_type": "synthetic_transformation",

  "id": "PAIR-001-KEYNOTE",
  "title": "Product Keynote — Hesitation Pause",
  "speechDomain": "Tech Keynote / Presentation",
  "speaker": "Speaker A (Keynote Master Baseline)",
  "hasAudio": true,
  "referenceAudioFile": "sample_reference_keynote.wav",
  "participantAudioFile": "sample_flawed_keynote.wav",
  "flawCategory": "excessive_pauses",
  "flawSeverity": "moderate",
  "groundTruthIntervals": [
    {
      "start": 2.1,
      "end": 3.4,
      "label": "Abrupt hesitation between 'Today we are' and 'fundamentally redefining'"
    }
  ],
  "isSynthetic": true,
  "split": "test",
  "notes": "Exact 1.30s silence window algorithmically injected into continuous master reference."
}
```

### Key Field Reference

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `pair_id` | `string` | Unique benchmark pair identifier | `PAIR_001_PAUSE` |
| `reference_file` | `string` | Ideal reference master audio filename | `speech_keynote_ref.wav` |
| `comparison_file` | `string` | Candidate / flawed delivery filename | `speech_keynote_pause.wav` |
| `transcript` | `string` | Verbatim text transcript (identical for both) | *"Welcome everyone..."* |
| `flaw_type` | `string` | Specific acoustic flaw category | `excessive_pauses` |
| `start_time` | `float` | Exact timestamp of flaw onset (seconds) | `2.1` |
| `end_time` | `float` | Exact timestamp of flaw termination (seconds) | `3.4` |
| `annotation_type` | `string` | Origin of flaw annotation | `synthetic_transformation` \| `human_rehearsal` |

---

## 3. Flaw Categories & Acoustic Definitions

- **`excessive_pauses`**: Unnatural or halting silence (>0.8s) breaking syntactic flow where the reference maintained prosodic continuity.
- **`excessive_speed` / `rushed_delivery`**: Delivery velocity exceeding baseline speaking rate by >25%, leading to collapsed syllable durations and rushed cadence.
- **`monotone_pitch`**: Flat pitch inflection profile (<1.8 semitones of dynamic range across emotional/emphasis moments).
- **`vocal_fade`**: Drop in vocal projection / breath support (>40% drop in RMS energy) at phrase terminals.
- **`articulation_mismatch`**: Significant spectral tilt deviation, muffled consonants, or microphone axis distance instability.

---

## 4. Human vs. Synthetic Recording Protocol

1. **Synthetic Transformations (`annotation_type: synthetic_transformation`)**:
   - Generated using `scripts/build_contrastive_dataset.py` and `backend/evaluation/synthetic_generator.py`.
   - Transformations (e.g. speed perturbation, algorithmic silence injection, parametric envelope attenuation) derive mathematical ground-truth boundary timestamps for precision, recall, and IoU evaluation.

2. **Human Rehearsals (`annotation_type: human_rehearsal`)**:
   - Recorded under controlled acoustic conditions (condenser cardioid microphone, 16kHz 16-bit PCM WAV).
   - Captures authentic speaker hesitation, natural dead-air silence, and physical off-axis microphone head turn.
   - Ground truth timestamps annotated via multi-rater acoustic waveform inspection.

