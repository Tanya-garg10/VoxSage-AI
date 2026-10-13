# VoxSage AI — Premium Editorial Pro Speech Intelligence

> **Tagline:** Analyze the sound. Find the flaw. Master the delivery.  
> **Design Language:** Premium Editorial Pro (Warm Ivory `#F7F5F0`, Off-White `#FFFEFB`, Deep Charcoal `#242522`, Playfair Display serif headings, `#4E8BBD` reference blue & `#D97757` comparison coral)  
> **Hackathon:** Multimodal AI Hackathon 2026 — Track C: Contrastive Speech Analytics & Temporal Flaw Grounding

---

## 1. Visual Identity & Editorial Design System

- **Warm Ivory Palette:**
  - Main background: `#F7F5F0`
  - Card background: `#FFFEFB`
  - Primary text: `#242522`
  - Secondary text: `#77766F`
  - Subtle hairline borders: `#E6E2D9`
  - Primary accent: `#6558D9`
  - Reference audio waveform: `#4E8BBD` (Editorial Blue)
  - Comparison audio waveform: `#D97757` (Warm Terracotta / Coral)
  - Success states: `#4E826B` (Sage Green)
- **Editorial Typography:**
  - Expressive headlines: **Playfair Display** (52–64px desktop hero, 32–40px page titles)
  - Crisp interface & body: **Inter** and **Plus Jakarta Sans**
  - Timestamps and numeric telemetry: **JetBrains Mono**

---

## 2. Core Layout Architecture

1. **Top Navigation (`TopNav.tsx`)**
   - Sound-wave brand symbol with **VoxSage Pro** typography.
   - Core links: **Workspace**, **Dataset Lab**, **Evaluation**, and **Speaker Profile**.
   - Interactive user avatar button (`GT`) linking directly to profile & calibration.
   - Primary `+ New Analysis` action button.
   - Real-time DSP indicator (`● 16kHz PCM · DTW Active`).

2. **Main Workspace Dashboard (`MainWorkspaceView.tsx`)**
   - Eyebrow: `SPEECH INTELLIGENCE / WORKSPACE`
   - Hero Headline: **“Hear what matters.”**
   - Supporting text: *“Compare delivery, locate vocal patterns, and turn observations into clear, timestamped coaching.”*
   - Four compact, data-backed metric cards:
     1. Recordings Analyzed (live count from corpus)
     2. Delivery Score (DTW acoustic match / 100)
     3. Issues Found (grounded temporal intervals)
     4. Dataset Pairs (curated benchmark pairs)

3. **Recording Comparison Workspace (`RecordingComparisonWorkspace.tsx`)**
   - The visual centerpiece!
   - Side-by-side Reference (`#4E8BBD` blue) and Comparison (`#D97757` coral) audio panels.
   - Real interactive waveform scrubbers, playback/pause, duration, and flaw interval highlights.

4. **Delivery Notes Panel (`DeliveryNotesPanel.tsx`)**
   - Beside the comparison workspace.
   - Timestamped flaw cards with severity, measured acoustic discrepancy, empirical evidence, and actionable coaching tips.
   - Instant seek buttons that jump the audio player to the flawed interval.

5. **Interactive Temporal Issue Timeline (`TemporalIssueTimeline.tsx`)**
   - Full-width timeline directly beneath the comparison workspace.
   - Timestamp ticks, colored flaw intervals, and animated playhead.
   - Clicking any interval immediately seeks audio playback to that exact second.

6. **Speaker Profile & Vocal Calibration (`ProfileView.tsx`)**
   - Speaker credentials (Tanya Garg · `gargtanya290@gmail.com` · Verified Speaker).
   - Session delivery trajectory chart tracking score improvement across sessions (+16.0% progress).
   - Automated vocal tendencies panel (clause-terminal hesitation, pitch inflection patterns, projection strength).
   - Tunable vocal baselines: $F_0$ pitch center (Hz), target speaking cadence (WPM), pause hesitation floor (seconds), and minimum energy targets.

7. **Analyze Speech Workflow (`AnalyzeView.tsx`)**
   - Drag-and-drop file upload (WAV 16/24-bit PCM, FLAC, MP3, OGG up to 25MB).
   - Live microphone recording with second counter.
   - Extracted acoustics: Speaking rate (WPM / syl/s), F0 semitone range, silence/pause distribution, and dynamic RMS range.

8. **Dataset Lab (`DatasetLabView.tsx`)**
   - Corpus browser with search, split filters, and human vs. synthetic tags.
   - Documented JSON schema drawer and functional JSON export.

9. **Model Evaluation (`EvaluationView.tsx`)**
   - Reproducible empirical validation: Precision, Recall, F1 score, Mean IoU.
   - Category breakdowns and documented failure cases with engineering remediations.

---

## 3. Signature Feature: Replay & Improve Studio (`ReplayImproveStudio.tsx`)

The centerpiece coaching engine that turns speech analytics into tangible vocal improvement:

1. **Precision Flaw Replay & A/B Switching:**
   - Click any timestamped flaw card to seek immediately to that millisecond.
   - Highlights the exact interval on the acoustic timeline (`[flaw.startTime, flaw.endTime]`).
   - Listen to **Track A (Master Reference)** vs. **Track B (Flawed Delivery)** with seamless A/B quick-switching.
   - Interval Looping toggle (`🔁 Loop Segment`) for repetitive auditory ear-training.

2. **Explainable Flaw Detector & Deep Evidence:**
   - Detailed acoustic telemetry: $F_0$ pitch inflection (Hz), RMS energy projection, pause duration, and MFCC divergence.
   - Honest acoustic explanation: Distinguishes physical acoustic measurements (e.g., duration, pitch range) from subjective aesthetic judgments.
   - Tailored vocal drill formulation: Cadence reset drills, metronome syllable pacing, diaphragmatic projection drills, and resonance glides.

3. **In-Browser Microphone Practice:**
   - Real-time `MediaRecorder` with 3-second visual countdown.
   - Live Web Audio `AnalyserNode` input level meter.
   - Automatic browser-side conversion from raw audio blobs into standardized 16-bit PCM WAV (`audioEncoder.ts`) for 100% backend DSP fidelity.

4. **Before vs. After Measured Progress:**
   - Real comparison of the user's new attempt against the flawed recording and master reference.
   - Measured acoustic shift (% convergence toward master cadence/pitch tolerance).
   - Instant coaching assessment.

5. **Progress Passport (Local Persistence):**
   - Saves session attempts to `localStorage` (`voxsage_practice_passport_v1`).
   - Full history log with date, flaw category, status (`improved`, `steady`, `needs_review`), and coaching assessment.
   - Export session history as formatted JSON.
   - Clear history functionality with confirmation.

---

## 4. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Recharts, Lucide React, HTML5 Audio API, Web Audio AnalyserNode.
- **Backend:** Python 3.11, FastAPI, Librosa, NumPy, SciPy, SoundFile, Pydantic v2.
- **Unified Server:** Node.js / Express on port 3000 mounting Vite in development and routing API requests to Python DSP CLI runner.
- **Audio Standards:** 16,000 Hz Mono PCM WAV with downsampled 50ms temporal frames.

---

## 5. Setup & Running Instructions

```bash
# 1. Install dependencies
npm install
pip install -r requirements.txt

# 2. Generate benchmark WAV sample files
python3 scripts/generate_sample_audio.py

# 3. Start unified server on port 3000
npm run dev
```

Visit `http://localhost:3000` to launch VoxSage AI.

---

## 6. Known Limitations & Architecture Notes

- **Microphone Permissions:** Requires standard browser microphone permissions via `navigator.mediaDevices.getUserMedia`. If denied or run in non-secure HTTP contexts, the studio clearly displays actionable permission instructions.
- **Local Persistence Scope:** The Progress Passport currently stores history in browser `localStorage`. Data persists across page reloads on the same machine, but requires a cloud database for cross-device synchronization.
- **Acoustic Objectivity:** Measurements quantify physical acoustic properties (timing, fundamental frequency, amplitude envelopes). They provide formative practice feedback, not subjective judgments of personal voice quality.

