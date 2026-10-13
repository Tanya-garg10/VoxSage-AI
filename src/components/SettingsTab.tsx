import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  FileCheck,
  Scale,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [minF0, setMinF0] = useState(65);
  const [maxF0, setMaxF0] = useState(450);
  const [pauseThreshold, setPauseThreshold] = useState(0.25);
  const [iouMatchThreshold, setIouMatchThreshold] = useState(0.35);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-semibold">
            System Preferences
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Acoustic Calibration & Ethics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
          Settings & Scientific Ethics
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure digital signal processing thresholds and review the scientific boundaries governing multimodal speech analysis.
        </p>
      </div>

      {/* Ethical Boundaries & Scientific Limitations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Scientific Boundaries & Ethical Discipline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Principles guiding explainable speech analytics without rhetorical bias
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#635BFF]" />
              <span>Acoustic Variance $\neq$ Rhetorical Defect</span>
            </h4>
            <p>
              An acoustic deviation (such as a slower cadence, prolonged silence, or localized energy drop) is an objective physical measurement, not an inherent failure of charisma. Silence can function as dramatic emphasis. VoxSage labels occurrences as <strong>"candidate delivery issues"</strong> relative to the chosen reference.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3898FF]" />
              <span>Cultural & Dialectical Diversity</span>
            </h4>
            <p>
              Prosodic norms, vowel duration, and pitch inflection vary significantly across linguistic communities, dialects, and genders. Pitch baselines must be evaluated against speaker-matched or contextually aligned reference models to prevent dialectical bias.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Microphone Channel Normalization</span>
            </h4>
            <p>
              Differences in microphone hardware, room reverberation, and pop filters alter high-frequency spectral components and energy envelopes. VoxSage normalizes RMS envelopes prior to Dynamic Time Warping to mitigate hardware discrepancies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Generative Hallucination</span>
            </h4>
            <p>
              VoxSage does not employ unconstrained generative language models to invent speech quality scores. All feedback suggestions link deterministically to concrete acoustic measurements: pitch semitone ranges, pause durations, or RMS dynamics.
            </p>
          </div>
        </div>
      </div>

      {/* Signal Processing Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Signal Processing Tuning
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust thresholds for fundamental frequency search and silence boundary detection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Minimum F0 Frequency: {minF0} Hz
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={minF0}
              onChange={(e) => setMinF0(Number(e.target.value))}
              className="w-full accent-[#635BFF]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Floor for fundamental frequency pitch autocorrelation search.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Maximum F0 Frequency: {maxF0} Hz
            </label>
            <input
              type="range"
              min="300"
              max="600"
              value={maxF0}
              onChange={(e) => setMaxF0(Number(e.target.value))}
              className="w-full accent-[#635BFF]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ceiling for pitch tracking to avoid capturing overtone harmonics.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Pause Duration Floor: {pauseThreshold}s
            </label>
            <input
              type="range"
              min="0.15"
              max="0.60"
              step="0.05"
              value={pauseThreshold}
              onChange={(e) => setPauseThreshold(Number(e.target.value))}
              className="w-full accent-[#635BFF]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum silence duration required to trigger a pause interval (filters phonetic stops).
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Evaluation IoU Threshold: {iouMatchThreshold}
            </label>
            <input
              type="range"
              min="0.2"
              max="0.6"
              step="0.05"
              value={iouMatchThreshold}
              onChange={(e) => setIouMatchThreshold(Number(e.target.value))}
              className="w-full accent-[#635BFF]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum Intersection-over-Union required to score a True Positive match in benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Runtime Diagnostics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Runtime Diagnostics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active execution environment for Multimodal Hackathon Track C
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            ● 100% Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 block font-medium">Signal Processing Backend</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">Python 3.11 / FastAPI</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 block font-medium">Acoustic Libraries</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">NumPy · SciPy · Librosa</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-400 block font-medium">PCM Standards</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">16,000 Hz Mono Downsampled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
