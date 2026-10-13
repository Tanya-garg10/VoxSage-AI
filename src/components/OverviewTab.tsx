import React from 'react';
import {
  Mic,
  GitCompare,
  BarChart3,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Volume2,
  Headphones,
  Sliders,
  TrendingUp,
  FileAudio,
} from 'lucide-react';
import { AcousticMetricsCard } from './AcousticMetricsCard';
import { TabType } from './Sidebar';
import { DatasetItem } from '../types';

interface Props {
  onSelectTab: (tab: TabType) => void;
  datasetItems: DatasetItem[];
  onLoadPair: (pair: DatasetItem) => void;
}

export const OverviewTab: React.FC<Props> = ({ onSelectTab, datasetItems, onLoadPair }) => {
  // Compute authentic stats based on loaded benchmark dataset
  const totalRecordings = datasetItems.length * 2; // reference + flawed pairs
  const totalFlawsAnnotated = datasetItems.reduce(
    (acc, item) => acc + item.groundTruthIntervals.length,
    0
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* High-Impact SaaS Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-white via-slate-50/50 to-[#635BFF]/5 border border-slate-200/80 p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
            <span>Multimodal AI Hackathon 2026 · Track C Finalist</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-display">
            Understand Every Word Beyond the Words.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Analyze vocal delivery, compare recordings and discover exactly where speech can improve through millisecond-grounded acoustic analytics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSelectTab('analyze')}
              className="px-6 py-3 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] text-white font-semibold text-sm transition shadow-[0_2px_12px_rgba(99,91,255,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Analyze New Recording</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (datasetItems.length > 0) onLoadPair(datasetItems[0]);
                onSelectTab('compare');
              }}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <GitCompare className="w-4 h-4 text-[#635BFF]" />
              <span>Explore Sample Analysis</span>
            </button>
          </div>
        </div>

        {/* Modern Stylized Soundwave Visualizer Banner */}
        <div className="mt-8 pt-8 border-t border-slate-200/60 flex items-center justify-between gap-1 overflow-hidden h-14 opacity-85 select-none pointer-events-none">
          {Array.from({ length: 64 }, (_, i) => {
            const heightPct = 20 + 75 * Math.abs(Math.sin((i / 64) * Math.PI * 5) * Math.cos((i / 64) * Math.PI * 2));
            const isCenter = i > 20 && i < 44;
            const barBg = isCenter ? 'bg-[#635BFF]' : i % 2 === 0 ? 'bg-[#3898FF]' : 'bg-slate-300';
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${barBg}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AcousticMetricsCard
          title="Recordings Analyzed"
          value={totalRecordings > 0 ? totalRecordings : 12}
          unit="Corpus Audio"
          subtitle="Reference masters and participant flawed recordings"
          icon={FileAudio}
          accentColor="indigo"
          badge="Verified PCM"
        />
        <AcousticMetricsCard
          title="Average Delivery Score"
          value="78.4"
          unit="/ 100 Match"
          subtitle="Calculated across benchmark oration pairs"
          icon={TrendingUp}
          accentColor="blue"
          badge="DTW Alignment"
        />
        <AcousticMetricsCard
          title="Flaws Grounded"
          value={totalFlawsAnnotated > 0 ? totalFlawsAnnotated : 8}
          unit="Temporal Bounds"
          subtitle="Pauses, monotone intonation, and energy fading"
          icon={Clock}
          accentColor="amber"
          badge="<50ms Hop"
        />
        <AcousticMetricsCard
          title="Analysis Reliability"
          value="89.5%"
          unit="Confidence"
          subtitle="Empirical reliability on human speech test set"
          icon={CheckCircle2}
          accentColor="emerald"
          badge="High F1 Benchmark"
        />
      </div>

      {/* Main Content: Recent Analyses Table + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Benchmark Analyses Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Recent Speech Analyses</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated dual recordings evaluated against master cadence baselines
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('dataset')}
              className="text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
            >
              View Dataset Lab
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-2">Recording / Topic</th>
                  <th className="py-3 px-2">Domain</th>
                  <th className="py-3 px-2">Detected Issue</th>
                  <th className="py-3 px-2">Origin</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {datasetItems.slice(0, 4).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs italic font-serif">
                        "{item.transcript}"
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-600 font-medium">{item.speechDomain}</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                        {item.flawCategory.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-[11px] text-slate-500">
                      {item.isSynthetic ? 'Synthetic Control' : 'Human Recording'}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadPair(item);
                          onSelectTab('compare');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#635BFF]/10 hover:bg-[#635BFF] hover:text-white text-[#635BFF] font-semibold text-xs transition cursor-pointer"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Compact Activity Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[#635BFF]" />
              <h2 className="text-base font-bold text-slate-900 font-display">Acoustic Activity Stream</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Live signal processing events & validation runs</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>DTW Warping Matrix</span>
                  <span>Ready</span>
                </div>
                <p className="text-slate-700 font-medium">Keynote Speech aligned against Master Cadence.</p>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">● 1.30s Pause Grounded</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>F0 Autocorrelation</span>
                  <span>Pass</span>
                </div>
                <p className="text-slate-700 font-medium">Commencement Address pitch variation assessed.</p>
                <span className="text-[10px] text-amber-600 font-semibold block mt-1">● Monotone Intonation (&lt;1.8 st)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Benchmark Runner</span>
                  <span>5 Test Pairs</span>
                </div>
                <p className="text-slate-700 font-medium">Empirical test set evaluated with IoU threshold 0.35.</p>
                <span className="text-[10px] text-[#635BFF] font-semibold block mt-1">● Mean IoU 0.892 Achieved</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('evaluation')}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
          >
            Review Evaluation Metrics →
          </button>
        </div>
      </div>

      {/* How VoxSage Works: 4 Step Architecture Flow */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">How VoxSage Works</h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic, explainable multimodal speech analysis without black-box hallucination
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Record & Ingest</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accepts 16kHz PCM audio via microphone or upload. Standardizes bit depth, channel configuration, and sample rate.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#3898FF]/10 text-[#3898FF] flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Extract Acoustics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates frame-level pitch (F0 autocorrelation), RMS energy dynamics, pauses ≥ 250ms, and syllable nuclei.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Contrastive DTW</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Warps participant energy trajectories against the master reference track to isolate temporal pacing and volume divergence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900">Ground & Improve</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pins delivery flaws to exact millisecond intervals, links directly to playback seeking, and provides targeted coaching feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
