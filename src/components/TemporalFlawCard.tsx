import React from 'react';
import { PlayCircle, ShieldCheck, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';
import { FlawGrounding } from '../types';

interface Props {
  flaw: FlawGrounding;
  isActive?: boolean;
  onSeek: (start: number, end: number) => void;
}

export const TemporalFlawCard: React.FC<Props> = ({ flaw, isActive = false, onSeek }) => {
  const severityStyles = {
    high: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      tag: 'High Impact',
      dot: 'bg-rose-500',
    },
    medium: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      tag: 'Moderate Impact',
      dot: 'bg-amber-500',
    },
    low: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      tag: 'Subtle Variance',
      dot: 'bg-blue-500',
    },
  }[flaw.severity];

  return (
    <div
      onClick={() => onSeek(flaw.startTime, flaw.endTime)}
      className={`rounded-2xl border p-4.5 transition-all cursor-pointer bg-white ${
        isActive
          ? 'border-[#635BFF] ring-2 ring-[#635BFF]/15 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
      }`}
    >
      {/* Header with Title and Timestamp Seek CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${severityStyles.dot}`} />
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{flaw.title}</h4>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSeek(flaw.startTime, flaw.endTime);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-[#635BFF] hover:text-white text-slate-700 transition cursor-pointer shrink-0"
          title="Click to seek audio player to this timestamp"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>{flaw.startTime.toFixed(2)}s – {flaw.endTime.toFixed(2)}s</span>
        </button>
      </div>

      {/* Measured Metrics Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 mb-3 text-xs">
        <div>
          <span className="text-slate-400 text-[11px] block font-medium">Measured Difference</span>
          <span className="font-bold text-slate-900 font-mono mt-0.5 block">{flaw.measuredDeviation}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] block font-medium">Master Reference</span>
          <span className="font-medium text-indigo-700 font-mono mt-0.5 block">{flaw.referenceValue}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] block font-medium">Participant Recording</span>
          <span className="font-medium text-[#3898FF] font-mono mt-0.5 block">{flaw.participantValue}</span>
        </div>
      </div>

      {/* Grounded Evidence & Improvement Advice */}
      <div className="space-y-2 text-xs">
        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Acoustic Evidence:</strong> {flaw.evidence}
        </p>

        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-emerald-900 leading-relaxed">
            <strong className="font-semibold text-emerald-950">Actionable Feedback:</strong> {flaw.suggestion}
          </p>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${severityStyles.badge}`}>
            {severityStyles.tag}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium capitalize">
            {flaw.feature.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-600 font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{Math.round(flaw.confidence * 100)}% reliability</span>
        </div>
      </div>
    </div>
  );
};
