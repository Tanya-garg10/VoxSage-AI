# VoxSage AI — Contrastive Speech Intelligence & Temporal Flaw Grounding

> **Analyze the sound. Find the flaw. Master the delivery.**

VoxSage AI is a contrastive speech analytics and temporal flaw grounding platform. It empowers speakers, coaches, and researchers to compare oral deliveries against reference orations, pinpoint micro-acoustic imperfections with millisecond precision, and practice actionable delivery improvements directly in the browser.

---

## Key Highlights

- **Dual Waveform Contrastive Analysis**: Side-by-side reference and participant audio alignment using Dynamic Time Warping (DTW) across energy, pitch ($F_0$), and spectral features.
- **Millisecond-Grounded Flaw Detection**: Automatically localizes and categorizes speech flaws—such as unnatural pauses, vocal fades, rushed pacing, monotone pitch, and cadence irregularities.
- **Replay & Improve Studio**:
  - Interactive interval playback with instant A/B track switching (Reference vs. Flawed).
  - Loop segments for focused auditory ear-training.
  - In-browser microphone rehearsal with real-time Web Audio input monitoring and standardized 16-bit PCM WAV encoding.
  - Objective before-and-after progress telemetry and session persistence.
- **Explainable Acoustic Metrics**: Quantifies physical acoustic telemetry (duration, pitch range in semitones, RMS projection, and pause duration) with clear coaching feedback.
- **Curated Benchmark Dataset**: Includes contrastive speech pairs with ground-truth temporal intervals spanning multiple domains (Tech Keynotes, Pitches, Debates, Podcasts).
- **Rigorous Evaluation Suite**: Measures temporal IoU, precision, recall, and F1 scores against benchmark ground-truth flaw intervals.

---

## System Architecture

The application is structured into two complementary layers:

1. **Frontend (React 19 + TypeScript + Vite + Tailwind CSS)**:
   - Synchronized dual-audio waveform visualization and scrubbing.
   - Interactive temporal issue timeline with seek-to-interval triggers.
   - Live microphone recording with real-time DSP level visualization.
   - Clean, editorial-grade user interface.

2. **Backend (Python 3.11 + FastAPI + Librosa + NumPy + SciPy)**:
   - High-fidelity 16kHz mono audio preprocessing.
   - Dynamic Time Warping (DTW) for non-linear temporal sequence alignment.
   - Acoustic parameter extraction: fundamental frequency ($F_0$ via pyin), RMS energy envelopes, and spectral roll-off/tilt.
   - Rule-based and threshold-driven flaw grounding engine.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tanya-garg10/VoxSage-AI.git
   cd VoxSage-AI
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install Python backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Generate sample audio benchmarks** (if not already present):
   ```bash
   python scripts/generate_sample_audio.py
   ```

### Running the Application

Start the unified development server:

```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## Benchmark Dataset

VoxSage AI includes a curated contrastive dataset located in `dataset/`:
- `dataset/annotations/benchmark_pairs.json`: Ground-truth annotations detailing reference files, participant deliveries, flaw categories, and millisecond start/end intervals.
- `dataset/examples/`: Sample 16kHz PCM audio pairs across diverse speaking domains (Keynotes, Debates, Training sessions).

### Flaw Categories Grounded

| Category | Description | Primary Metric |
| :--- | :--- | :--- |
| `excessive_pauses` | Unnatural silence disrupting flow | Pause duration > 0.8s vs. continuous reference |
| `rushed_delivery` | Speaking rate significantly above baseline | Syllables/sec increase > 25% |
| `monotone_pitch` | Flat pitch contour across expressive segments | $F_0$ dynamic range < 2.0 semitones |
| `vocal_fade` | Loss of breath support / energy at phrase ends | RMS energy drop > 40% at phrase terminals |
| `articulation_mismatch` | Consonant muffling or spectral tilt shift | High-frequency spectral centroid divergence |

---

## Project Structure

```text
voxsage-ai/
├── backend/
│   ├── analysis/         # Audio loading, feature extraction (F0, RMS, pauses)
│   ├── comparison/       # DTW alignment & deviation detection algorithms
│   ├── evaluation/       # Benchmark evaluator & synthetic test generator
│   ├── schemas/          # Pydantic data schemas
│   ├── cli_runner.py     # Python CLI bridge for DSP execution
│   └── main.py           # FastAPI application endpoints
├── dataset/
│   ├── annotations/      # benchmark_pairs.json with ground-truth intervals
│   └── examples/         # Benchmark WAV files
├── public/samples/       # Static audio samples for frontend playback
├── scripts/              # Dataset generation and helper scripts
├── src/
│   ├── components/       # UI components (Workspace, Timeline, Studio, Lab)
│   ├── services/         # API integration client
│   ├── types/            # TypeScript interfaces and data models
│   └── utils/            # Audio encoder (PCM WAV) and helpers
├── server.ts             # Unified Express dev server mounting Vite & API proxy
└── package.json
```

---

## Deployment

### Deploy to Render

VoxSage AI can be deployed to Render with the following steps:

1. **Push your code to GitHub** (if not already done)
2. **Create a new Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
3. **Configure build settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Runtime: Node (18+)
4. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `PYTHON_CMD`: `python3`
   - `FEATHERLESS_API_KEY`: (optional, if using AI features)
5. **Deploy**: Click "Create Web Service"

The `render.yaml` file in the repository provides default configuration.

### Alternative Deployment Options

- **Docker**: Containerize the application for deployment to any cloud provider
- **Railway**: Similar to Render, supports multi-language runtimes
- **VPS**: Self-host on DigitalOcean, AWS EC2, or similar

---

## License

This project is open-source and available under the [MIT License](LICENSE).

