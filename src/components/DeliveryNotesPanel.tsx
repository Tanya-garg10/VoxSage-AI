import React from 'react';
import {
  PlayCircle,
  Lightbulb,
  ShieldCheck,
  Clock,
  Volume2,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Mic,
  ArrowRight,
} from 'lucide-react';
import { FlawGrounding } from '../types';

interface Props {
  deviations: FlawGrounding[];
  activeFlawId: string | null;
  onSeekFlaw: (start: number, end: number, flawId: string) => void;
  onOpenStudio?: (start: number, end: number, flawId: string) => void;
}

export const DeliveryNotesPanel: React.FC<Props> = ({
  deviations,
  activeFlawId,
  onSeekFlaw,
  onOpenStudio,
}) => {
  return (
    <div className="editorial-card rounded-2xl p-6 sm:p-7 space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#E6E2D9] pb-3 flex items-baseline justify-between">
        <div>
          <h3 className="font-serif-editorial text-xl font-bold text-[#242522]">
            Delivery notes
          </h3>
          <p className="text-xs text-[#77766F] mt-0.5">
            Timestamped acoustic deviations & coaching
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F7F5F0] border border-[#E6E2D9] text-[#77766F]">
          {deviations.length} {deviations.length === 1 ? 'observation' : 'observations'}
        </span>
      </div>

      {/* Empty State when no flaws detected or not analyzed */}
      {deviations.length === 0 ? (
        <div className="p-8 text-center bg-[#F7F5F0]/50 rounded-xl border border-dashed border-[#E6E2D9] flex-1 flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#4E826B] mb-2" />
          <h4 className="text-sm font-semibold text-[#242522]">No delivery flaws grounded</h4>
          <p className="text-xs text-[#77766F] max-w-xs mt-1 leading-relaxed">
            The candidate delivery aligns with reference cadence tolerances without significant hesitation or pitch compression.
          </p>
        </div>
      ) : (
        /* Issue Cards List */
        <div className="space-y-3.5 overflow-y-auto max-h-[580px] pr-1">
          {deviations.map((flaw) => {
            const isActive = activeFlawId === flaw.id;

            const categoryBadge = {
              high: 'bg-[#D97757]/10 text-[#D97757] border-[#D97757]/30',
              medium: 'bg-[#EAB308]/15 text-[#92400E] border-[#EAB308]/30',
              low: 'bg-[#4E8BBD]/10 text-[#4E8BBD] border-[#4E8BBD]/30',
            }[flaw.severity];

            return (
              <div
                key={flaw.id}
                onClick={() => onSeekFlaw(flaw.startTime, flaw.endTime, flaw.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-[#FFFEFB] ${
                  isActive
                    ? 'border-[#6558D9] ring-2 ring-[#6558D9]/15 shadow-sm'
                    : 'border-[#E6E2D9] hover:border-[#D9D5CC]'
                }`}
              >
                {/* Header with Title and Timestamp Seek CTA */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${categoryBadge}`}>
                      {flaw.severity} impact · {flaw.feature.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-[#242522] leading-snug">
                      {flaw.title.replace('Candidate Delivery Issue: ', '')}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeekFlaw(flaw.startTime, flaw.endTime, flaw.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F7F5F0] hover:bg-[#6558D9] hover:text-white text-[#242522] text-xs font-mono font-semibold transition cursor-pointer shrink-0"
                    title="Click to jump and play this timestamp"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{flaw.startTime.toFixed(2)}s – {flaw.endTime.toFixed(2)}s</span>
                  </button>
                </div>

                {/* Evidence & Metric summary */}
                <div className="text-xs text-[#77766F] space-y-1.5 my-2.5">
                  <p className="leading-relaxed">
                    <strong className="text-[#242522]">Measured discrepancy:</strong> {flaw.measuredDeviation}
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-[#242522]">Acoustic evidence:</strong> {flaw.evidence}
                  </p>
                </div>

                {/* Actionable Improvement Suggestion */}
                <div className="p-2.5 rounded-lg bg-[#F7F5F0] border border-[#E6E2D9] flex items-start gap-2 text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-[#6558D9] shrink-0 mt-0.5" />
                  <p className="text-[#242522] leading-relaxed">
                    <strong>Coaching tip:</strong> {flaw.suggestion}
                  </p>
                </div>

                {/* Action CTA: Open in Replay & Improve Studio */}
                {onOpenStudio && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenStudio(flaw.startTime, flaw.endTime, flaw.id);
                    }}
                    className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Mic className="w-3 h-3 text-[#FFFEFB]" />
                    <span>Practice in Studio</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-70" />
                  </button>
                )}

                {/* Footer confidence */}
                <div className="flex items-center justify-between text-[11px] text-[#77766F] mt-2 pt-2 border-t border-[#E6E2D9]/60">
                  <span className="font-mono">Reference: {flaw.referenceValue}</span>
                  <div className="flex items-center gap-1 font-mono text-[#4E826B] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{Math.round(flaw.confidence * 100)}% reliability</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
