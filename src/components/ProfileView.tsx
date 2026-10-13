import React, { useState } from 'react';
import {
  User,
  Mail,
  Award,
  Sparkles,
  Sliders,
  Activity,
  Mic,
  Clock,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Save,
  RotateCcw,
  AudioWaveform,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Props {
  onBackToWorkspace: () => void;
  onOpenAnalysis: () => void;
  onOpenStudio?: () => void;
}

export const ProfileView: React.FC<Props> = ({
  onBackToWorkspace,
  onOpenAnalysis,
  onOpenStudio,
}) => {
  // Profile settings state
  const [speakerName, setSpeakerName] = useState('Tanya Garg');
  const [speakerEmail, setSpeakerEmail] = useState('gargtanya290@gmail.com');
  const [pitchBaseline, setPitchBaseline] = useState(185); // Hz
  const [targetCadence, setTargetCadence] = useState(140); // WPM
  const [maxPauseThreshold, setMaxPauseThreshold] = useState(0.8); // Seconds
  const [minEnergyTarget, setMinEnergyTarget] = useState(0.18);
  const [savedToast, setSavedToast] = useState(false);

  // Delivery progress sessions data for Recharts
  const sessionHistory = [
    { session: 'Session 1', score: 68.5, date: 'Oct 02' },
    { session: 'Session 2', score: 72.0, date: 'Oct 05' },
    { session: 'Session 3', score: 76.5, date: 'Oct 08' },
    { session: 'Session 4', score: 79.0, date: 'Oct 11' },
    { session: 'Session 5 (Latest)', score: 84.5, date: 'Oct 13' },
  ];

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-22 right-8 z-50 bg-[#242522] text-[#FFFEFB] px-4 py-2.5 rounded-xl shadow-lg border border-[#E6E2D9]/30 text-xs flex items-center gap-2 animate-bounce font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#4E826B]" />
          <span>Vocal baseline calibration updated successfully.</span>
        </div>
      )}

      {/* Editorial Header */}
      <div className="border-b border-[#E6E2D9] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#6558D9]">
            SPEECH INTELLIGENCE / SPEAKER PROFILE
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#242522] mt-1">
            Speaker Profile & Vocal Calibration
          </h2>
          <p className="text-xs sm:text-sm text-[#77766F] mt-1">
            Personal acoustic baselines, pitch register calibration, and longitudinal coaching trajectory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenStudio && (
            <button
              type="button"
              onClick={onOpenStudio}
              className="px-4 py-2 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-xs font-semibold text-white transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Replay & Improve Studio</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToWorkspace}
            className="px-4 py-2 rounded-lg border border-[#E6E2D9] bg-[#FFFEFB] hover:bg-[#F7F5F0] text-xs font-semibold text-[#242522] transition shrink-0 cursor-pointer"
          >
            ← Return to Workspace
          </button>
        </div>
      </div>

      {/* Identity Card & Speaker Credentials */}
      <div className="editorial-card-elevated rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E6E2D9]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6558D9] to-[#4E8BBD] text-white flex items-center justify-center text-xl font-bold font-mono shadow-sm select-none">
              GT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-editorial text-2xl font-bold text-[#242522]">
                  {speakerName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[#4E826B]/10 text-[#4E826B] border border-[#4E826B]/20">
                  Verified Speaker
                </span>
              </div>
              <p className="text-xs text-[#77766F] flex items-center gap-1.5 mt-0.5 font-mono">
                <Mail className="w-3.5 h-3.5" />
                <span>{speakerEmail}</span>
              </p>
              <p className="text-xs text-[#6558D9] font-medium mt-1">
                VoxSage Pro Speaker · Certified Orator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Calibration</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F7F5F0]/70 border border-[#E6E2D9]">
            <span className="text-[#77766F] block font-medium text-[11px] uppercase tracking-wider">
              Sessions Completed
            </span>
            <span className="text-2xl font-bold text-[#242522] font-mono mt-0.5 block">14</span>
            <span className="text-[11px] text-[#4E826B] mt-0.5 block">● Across 6 Domains</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5F0]/70 border border-[#E6E2D9]">
            <span className="text-[#77766F] block font-medium text-[11px] uppercase tracking-wider">
              Avg. Delivery Score
            </span>
            <span className="text-2xl font-bold text-[#6558D9] font-mono mt-0.5 block">81.2</span>
            <span className="text-[11px] text-[#77766F] mt-0.5 block">+12.7 pts over 5 runs</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5F0]/70 border border-[#E6E2D9]">
            <span className="text-[#77766F] block font-medium text-[11px] uppercase tracking-wider">
              Cadence Stability
            </span>
            <span className="text-2xl font-bold text-[#4E8BBD] font-mono mt-0.5 block">92%</span>
            <span className="text-[11px] text-[#77766F] mt-0.5 block">138–144 WPM Range</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5F0]/70 border border-[#E6E2D9]">
            <span className="text-[#77766F] block font-medium text-[11px] uppercase tracking-wider">
              Pause Discipline
            </span>
            <span className="text-2xl font-bold text-[#D97757] font-mono mt-0.5 block">0.48s</span>
            <span className="text-[11px] text-[#4E826B] mt-0.5 block">Optimized timing</span>
          </div>
        </div>
      </div>

      {/* Trajectory & Longitudinal Score Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Progress Chart (7 cols) */}
        <div className="lg:col-span-7 editorial-card rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E2D9] pb-3">
            <div>
              <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
                Delivery Improvement Trajectory
              </h3>
              <p className="text-xs text-[#77766F]">
                Longitudinal scoring progress across rehearsed keynote & pitch presentations
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#4E826B]/10 text-[#4E826B]">
              +16.0% Progress
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D9" opacity={0.6} />
                <XAxis dataKey="session" tick={{ fontSize: 10, fill: '#77766F' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#77766F' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#242522] text-[#FFFEFB] text-xs p-2.5 rounded-lg shadow-lg font-mono">
                          <p className="font-bold text-[#6558D9]">{d.session}</p>
                          <p>Score: {d.score} / 100</p>
                          <p className="text-[#77766F] text-[10px]">{d.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6558D9"
                  strokeWidth={2.5}
                  dot={{ fill: '#6558D9', r: 4 }}
                  activeDot={{ r: 6, fill: '#242522' }}
                  name="Delivery Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Personal Delivery Tendencies & Diagnostics (5 cols) */}
        <div className="lg:col-span-5 editorial-card rounded-2xl p-6 sm:p-7 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#E6E2D9] pb-3">
              <h3 className="font-serif-editorial text-lg font-bold text-[#242522]">
                Observed Vocal Tendencies
              </h3>
              <p className="text-xs text-[#77766F]">
                Automated patterns grounded across participant recordings
              </p>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F5F0] border border-[#E6E2D9] space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#242522]">
                  <span>Clause-Terminal Hesitation</span>
                  <span className="text-[10px] font-mono text-[#D97757]">Flagged 3x</span>
                </div>
                <p className="text-[#77766F] leading-normal text-[11px]">
                  Brief silences (&gt;0.8s) before concluding complex clauses. Practice diaphragmatic breath support.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F5F0] border border-[#E6E2D9] space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#242522]">
                  <span>Pitch Flattening on Slide Transitions</span>
                  <span className="text-[10px] font-mono text-[#EAB308]">Flagged 2x</span>
                </div>
                <p className="text-[#77766F] leading-normal text-[11px]">
                  F0 semitone excursion drops below 2.0 st when navigating transitions. Keep melodic variation active.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#4E826B]/10 border border-[#4E826B]/30 space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#4E826B]">
                  <span>Volume Projection Strength</span>
                  <span className="text-[10px] font-mono">Consistently High</span>
                </div>
                <p className="text-[#242522] leading-normal text-[11px]">
                  Mean RMS volume remains above 0.22 with low noise floor. Excellent vocal presence.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAnalysis}
            className="w-full py-2.5 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Record New Calibration Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Vocal Baseline Calibration Controls */}
      <div className="editorial-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#E6E2D9] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#6558D9]" />
            <h3 className="font-serif-editorial text-xl font-bold text-[#242522]">
              Acoustic Baselines & Signal Thresholds
            </h3>
          </div>
          <p className="text-xs text-[#77766F] mt-0.5">
            Personalized calibration bounds used to distinguish natural stylistic choices from actual delivery issues
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div>
            <label className="font-bold text-[#242522] block mb-1">
              F0 Pitch Center: {pitchBaseline} Hz
            </label>
            <input
              type="range"
              min="100"
              max="280"
              value={pitchBaseline}
              onChange={(e) => setPitchBaseline(Number(e.target.value))}
              className="w-full accent-[#6558D9]"
            />
            <p className="text-[11px] text-[#77766F] mt-1">
              Personal vocal register center point (Alto / Mezzo baseline).
            </p>
          </div>

          <div>
            <label className="font-bold text-[#242522] block mb-1">
              Target Speaking Cadence: {targetCadence} WPM
            </label>
            <input
              type="range"
              min="110"
              max="180"
              value={targetCadence}
              onChange={(e) => setTargetCadence(Number(e.target.value))}
              className="w-full accent-[#4E8BBD]"
            />
            <p className="text-[11px] text-[#77766F] mt-1">
              Optimal delivery pace for keynote and persuasive presentations.
            </p>
          </div>

          <div>
            <label className="font-bold text-[#242522] block mb-1">
              Pause Hesitation Floor: {maxPauseThreshold}s
            </label>
            <input
              type="range"
              min="0.4"
              max="1.5"
              step="0.1"
              value={maxPauseThreshold}
              onChange={(e) => setMaxPauseThreshold(Number(e.target.value))}
              className="w-full accent-[#D97757]"
            />
            <p className="text-[11px] text-[#77766F] mt-1">
              Silences exceeding this duration trigger hesitation flaw flags.
            </p>
          </div>

          <div>
            <label className="font-bold text-[#242522] block mb-1">
              Min Energy Level: {minEnergyTarget} RMS
            </label>
            <input
              type="range"
              min="0.08"
              max="0.30"
              step="0.02"
              value={minEnergyTarget}
              onChange={(e) => setMinEnergyTarget(Number(e.target.value))}
              className="w-full accent-[#4E826B]"
            />
            <p className="text-[11px] text-[#77766F] mt-1">
              Target diaphragmatic projection to prevent vocal fade at clause terminals.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#E6E2D9]/60 text-xs">
          <span className="text-[#77766F]">
            Standards adherence: 16,000 Hz Mono PCM · Normalized CMVN envelope
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold transition cursor-pointer"
          >
            Apply Baseline Calibration
          </button>
        </div>
      </div>
    </div>
  );
};
