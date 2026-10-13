import React, { useState } from 'react';
import {
  Database,
  Search,
  FileCode,
  GitCompare,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { DatasetItem } from '../types';

interface Props {
  datasetItems: DatasetItem[];
  onLoadPairInWorkspace: (pair: DatasetItem) => void;
}

export const DatasetLabView: React.FC<Props> = ({ datasetItems, onLoadPairInWorkspace }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSplit, setSelectedSplit] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [showSchemaDoc, setShowSchemaDoc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Real functional export of the active annotations JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datasetItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'voxsage_contrastive_dataset.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-[#E6E2D9] pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#6558D9]">
            MULTIMODAL AI HACKATHON 2026 / TRACK C
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#242522] mt-1">
            Dataset Lab
          </h2>
          <p className="text-xs sm:text-sm text-[#77766F] mt-1">
            Contrastive speech corpus pairing ideal reference master tracks with flawed oral deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-lg border border-[#E6E2D9] bg-[#FFFEFB] hover:bg-[#F7F5F0] text-xs font-semibold text-[#242522] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Annotations JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSchemaDoc(!showSchemaDoc)}
            className="px-3.5 py-2 rounded-lg border border-[#E6E2D9] bg-[#FFFEFB] hover:bg-[#F7F5F0] text-xs font-semibold text-[#242522] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-[#6558D9]" />
            <span>{showSchemaDoc ? 'Hide Schema' : 'Inspect Schema'}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="editorial-card rounded-xl p-5">
          <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
            Corpus Pairs
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#242522] font-mono">{datasetItems.length}</span>
            <span className="text-xs text-[#77766F]">({datasetItems.length * 2} audio recordings)</span>
          </div>
          <p className="text-xs text-[#77766F] mt-1 leading-normal">
            Dual audio recordings standardized to 16kHz mono PCM.
          </p>
        </div>

        <div className="editorial-card rounded-xl p-5">
          <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
            Human Annotated
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#4E826B] font-mono">{humanCount}</span>
            <span className="text-xs text-[#77766F]">Authentic Speech</span>
          </div>
          <p className="text-xs text-[#77766F] mt-1 leading-normal">
            Real speakers demonstrating spontaneous or rehearsal hesitations.
          </p>
        </div>

        <div className="editorial-card rounded-xl p-5">
          <span className="text-[11px] font-semibold text-[#77766F] uppercase tracking-wider block">
            Synthetic Controls
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#D97757] font-mono">{syntheticCount}</span>
            <span className="text-xs text-[#77766F]">Algorithmic</span>
          </div>
          <p className="text-xs text-[#77766F] mt-1 leading-normal">
            Controlled speed perturbation and inserted silence intervals.
          </p>
        </div>
      </div>

      {/* Schema Drawer */}
      {showSchemaDoc && (
        <div className="p-6 rounded-2xl bg-[#242522] text-[#FFFEFB] text-xs font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6E2D9]/20 pb-2">
            <span className="font-bold text-[#6558D9]">dataset/annotations/benchmark_pairs.json</span>
            <span className="text-[11px] text-[#77766F]">Schema Documentation</span>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-[#D9D5CC]">
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
  "split": "train | validation | test"
}`}
          </pre>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="editorial-card rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#77766F] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript, topic, or pair ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E6E2D9] text-xs text-[#242522] bg-[#FFFEFB] focus:outline-none focus:border-[#6558D9]"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#77766F] font-medium text-xs">Origin:</span>
            {['all', 'human', 'synthetic'].map((orig) => (
              <button
                key={orig}
                type="button"
                onClick={() => setSelectedOrigin(orig)}
                className={`px-3 py-1 rounded-md capitalize transition cursor-pointer text-xs ${
                  selectedOrigin === orig
                    ? 'bg-[#242522] text-[#FFFEFB] font-semibold'
                    : 'bg-[#F7F5F0] hover:bg-[#E6E2D9] text-[#77766F]'
                }`}
              >
                {orig}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6E2D9]/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#77766F] font-medium text-xs">Split:</span>
            {['all', 'test', 'validation', 'train'].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSelectedSplit(sp)}
                className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer text-xs ${
                  selectedSplit === sp
                    ? 'bg-[#6558D9] text-white font-semibold'
                    : 'bg-[#F7F5F0] hover:bg-[#E6E2D9] text-[#77766F]'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#77766F] font-medium text-xs">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1 px-2.5 rounded-md border border-[#E6E2D9] bg-[#FFFEFB] text-[#242522] text-xs focus:outline-none focus:border-[#6558D9]"
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

      {/* Dataset Pair Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className="editorial-card rounded-xl transition overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#6558D9] bg-[#6558D9]/10 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F7F5F0] text-[#77766F] border border-[#E6E2D9]">
                      Split: {item.split}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        item.isSynthetic
                          ? 'bg-[#D97757]/10 text-[#D97757] border-[#D97757]/30'
                          : 'bg-[#4E826B]/10 text-[#4E826B] border-[#4E826B]/30'
                      }`}
                    >
                      {item.isSynthetic ? 'Synthetic transformation' : 'Human annotated'}
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-base font-bold text-[#242522]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#77766F] italic line-clamp-1">
                    "{item.transcript}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadPairInWorkspace(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Open in Comparison</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1.5 rounded-lg border border-[#E6E2D9] text-[#77766F] hover:bg-[#F7F5F0]"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Ground Truth Breakdown */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-[#E6E2D9] mt-1 space-y-3 bg-[#F7F5F0]/40 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div>
                      <span className="text-[#77766F] block font-medium">Domain</span>
                      <span className="font-semibold text-[#242522]">{item.speechDomain}</span>
                    </div>
                    <div>
                      <span className="text-[#77766F] block font-medium">Flaw Classification</span>
                      <span className="font-semibold text-[#242522] capitalize">
                        {item.flawCategory.replace('_', ' ')} ({item.flawSeverity})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#77766F] block font-medium">Files</span>
                      <span className="font-mono text-[11px] text-[#242522] truncate block">
                        {item.participantAudioFile}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-[#242522] block mb-1">
                      Annotated Ground-Truth Intervals:
                    </span>
                    <div className="space-y-1.5">
                      {item.groundTruthIntervals.map((gt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-[#FFFEFB] border border-[#E6E2D9] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#6558D9]" />
                            <span className="font-mono font-bold text-[#242522]">
                              {gt.start.toFixed(2)}s – {gt.end.toFixed(2)}s
                            </span>
                            <span className="text-[#77766F]">· {gt.label}</span>
                          </div>
                          <span className="text-[10px] text-[#77766F] font-mono">
                            Duration: {(gt.end - gt.start).toFixed(2)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#77766F] italic">Annotation notes: {item.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
