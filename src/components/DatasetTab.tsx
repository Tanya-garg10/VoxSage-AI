import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  FileCode,
  GitCompare,
  Sparkles,
  Volume2,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { DatasetItem } from '../types';

interface Props {
  datasetItems: DatasetItem[];
  onLoadPair: (pair: DatasetItem) => void;
  onNavigateToCompare: () => void;
}

export const DatasetTab: React.FC<Props> = ({
  datasetItems,
  onLoadPair,
  onNavigateToCompare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSplit, setSelectedSplit] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all'); // all | human | synthetic
  const [showSchemaDoc, setShowSchemaDoc] = useState<boolean>(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const categories = [
    'all',
    'excessive_pauses',
    'rushed_delivery',
    'monotone_pitch',
    'vocal_fade',
    'articulation_mismatch',
  ];

  const filteredItems = datasetItems.filter((item) => {
    if (selectedSplit !== 'all' && item.split !== selectedSplit) return false;
    if (selectedCategory !== 'all' && item.flawCategory !== selectedCategory) return false;
    if (selectedOrigin === 'synthetic' && !item.isSynthetic) return false;
    if (selectedOrigin === 'human' && item.isSynthetic) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.transcript.toLowerCase().includes(q) ||
        item.speechDomain.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const humanCount = datasetItems.filter((d) => !d.isSynthetic).length;
  const syntheticCount = datasetItems.filter((d) => d.isSynthetic).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-semibold">
              Track C Corpus
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Contrastive Speech Dataset Lab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-1">
            Dataset Lab
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse and inspect ground-truth annotated ideal and flawed speech pairs across oratory domains.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSchemaDoc(!showSchemaDoc)}
          className="px-4 py-2 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <FileCode className="w-4 h-4 text-[#635BFF]" />
          <span>{showSchemaDoc ? 'Hide JSON Schema' : 'Inspect Dataset Schema'}</span>
        </button>
      </div>

      {/* Dataset Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Pairs</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-display">{datasetItems.length}</span>
            <span className="text-xs text-slate-500 font-medium">({datasetItems.length * 2} audio tracks)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Master reference & flawed speech recordings</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Human Annotated</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-emerald-700 font-display">{humanCount}</span>
            <span className="text-xs text-slate-500 font-medium">Authentic Orations</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Rehearsed speaker deliveries with natural pauses</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Synthetic Controls</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-indigo-700 font-display">{syntheticCount}</span>
            <span className="text-xs text-slate-500 font-medium">Controlled Transforms</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Resampling, algorithmic pauses, energy fades</p>
        </div>
      </div>

      {/* JSON Schema Drawer */}
      {showSchemaDoc && (
        <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-[#635BFF]">dataset/annotations/benchmark_pairs.json</span>
            <span className="text-[11px] text-slate-400">Documented Schema</span>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
{`{
  "id": "PAIR-001-KEYNOTE",
  "title": "Product Keynote Opening Hook",
  "speechDomain": "Tech Keynote / Presentation",
  "speaker": "Speaker A (Pitch Pitch / Pitch Flaw)",
  "transcript": "Welcome everyone. Today we are fundamentally redefining...",
  "hasAudio": true,
  "referenceAudioFile": "sample_reference_keynote.wav",
  "participantAudioFile": "sample_flawed_keynote.wav",
  "flawCategory": "excessive_pauses | rushed_delivery | monotone_pitch | vocal_fade",
  "flawSeverity": "mild | moderate | severe",
  "groundTruthIntervals": [
    { "start": 2.1, "end": 3.4, "label": "Abrupt hesitation between clauses" }
  ],
  "isSynthetic": false,
  "split": "train | validation | test",
  "notes": "Authentic studio speech recording of rehearsed speaker."
}`}
          </pre>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript, topic, or pair ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200/90 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF]"
            />
          </div>

          {/* Origin filter: All / Human / Synthetic */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-medium">Origin:</span>
            {['all', 'human', 'synthetic'].map((orig) => (
              <button
                key={orig}
                type="button"
                onClick={() => setSelectedOrigin(orig)}
                className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer text-xs ${
                  selectedOrigin === orig
                    ? 'bg-[#635BFF] text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {orig}
              </button>
            ))}
          </div>
        </div>

        {/* Splits & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Split:</span>
            {['all', 'test', 'validation', 'train'].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSelectedSplit(sp)}
                className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer text-xs ${
                  selectedSplit === sp
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-[#635BFF]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isExpanded = expandedItemId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300 transition overflow-hidden"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#635BFF] bg-[#635BFF]/10 px-2.5 py-0.5 rounded-full">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Split: {item.split}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.isSynthetic
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.isSynthetic ? 'Synthetic Transformation' : 'Human Annotated'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 font-display">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-1 italic font-serif">
                    "{item.transcript}"
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadPair(item);
                      onNavigateToCompare();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#5249E6] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Compare Pair</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                    title={isExpanded ? 'Collapse' : 'Expand details'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Ground Truth Breakdown */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3 bg-slate-50/50 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                    <div>
                      <span className="text-slate-400 block font-medium">Domain</span>
                      <span className="font-semibold text-slate-800">{item.speechDomain}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Flaw Classification</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {item.flawCategory.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Severity</span>
                      <span className="font-semibold text-slate-800 capitalize">{item.flawSeverity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Files</span>
                      <span className="font-mono text-[11px] text-slate-700 truncate block">
                        {item.participantAudioFile}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5">
                      Ground-Truth Labeled Flaw Intervals:
                    </span>
                    <div className="space-y-1.5">
                      {item.groundTruthIntervals.map((gt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#635BFF]" />
                            <span className="font-mono font-bold text-slate-900">
                              {gt.start.toFixed(2)}s – {gt.end.toFixed(2)}s
                            </span>
                            <span className="text-slate-600">· {gt.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Δ {(gt.end - gt.start).toFixed(2)}s interval
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">Annotation notes: {item.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
