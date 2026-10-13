import React from 'react';
import { Clock, Info, Layers, PlayCircle } from 'lucide-react';
import { FlawGrounding } from '../types';

interface Props {
  deviations: FlawGrounding[];
  duration: number;
  currentPlaybackTime: number;
  activeFlawId: string | null;
  onSelectInterval: (start: number, end: number, id: string) => void;
}

export const TemporalIssueTimeline: React.FC<Props> = ({
  deviations,
  duration,
  currentPlaybackTime,
  activeFlawId,
  onSelectInterval,
}) => {
  const safeDuration = duration > 0 ? duration : 6.5;

  // Generate ticks along the time axis (every 1 second or 0.5s)
  const tickCount = Math.min(12, Math.max(4, Math.ceil(safeDuration)));
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => (i * safeDuration) / tickCount);

  // Issue colors
  const getIssueColor = (severity: string, isActive: boolean) => {
    if (isActive) return 'bg-[#6558D9] border-[#242522] text-white';
    if (severity === 'high') return 'bg-[#D97757] border-[#C06548] text-white';
    if (severity === 'medium') return 'bg-[#EAB308] border-[#CA8A04] text-[#242522]';
    return 'bg-[#4E8BBD] border-[#3D74A1] text-white';
  };

  return (
    <div className="editorial-card rounded-2xl p-6 sm:p-7 space-y-4">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E6E2D9] pb-3">
        <div>
          <h3 className="font-serif-editorial text-xl font-bold text-[#242522]">
            Temporal issue timeline
          </h3>
          <p className="text-xs text-[#77766F] mt-0.5">
            Select an interval to inspect the corresponding audio segment
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#77766F]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D97757]" />
            <span>High Deviation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#EAB308]" />
            <span>Moderate Pacing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4E8BBD]" />
            <span>Subtle Variance</span>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Timeline Track */}
      <div className="space-y-2 pt-2">
        <div className="relative h-20 bg-[#F7F5F0] rounded-xl border border-[#E6E2D9] p-2 overflow-hidden select-none">
          {/* Background grid vertical lines */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
            {ticks.map((t, idx) => (
              <div key={idx} className="h-full w-[1px] bg-[#E6E2D9]" />
            ))}
          </div>

          {/* Grounded issue intervals */}
          <div className="relative h-full w-full">
            {deviations.map((flaw) => {
              const startPct = Math.max(0, Math.min(100, (flaw.startTime / safeDuration) * 100));
              const endPct = Math.max(0, Math.min(100, (flaw.endTime / safeDuration) * 100));
              const widthPct = Math.max(4, endPct - startPct);
              const isActive = activeFlawId === flaw.id;

              return (
                <div
                  key={flaw.id}
                  onClick={() => onSelectInterval(flaw.startTime, flaw.endTime, flaw.id)}
                  title={`${flaw.title}: ${flaw.startTime.toFixed(2)}s – ${flaw.endTime.toFixed(2)}s (${flaw.measuredDeviation})`}
                  className={`absolute top-2 bottom-2 rounded-lg border flex flex-col justify-center px-2 cursor-pointer transition-all hover:scale-[1.02] hover:z-20 shadow-xs ${getIssueColor(
                    flaw.severity,
                    isActive
                  )}`}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                >
                  <span className="text-[10px] font-bold truncate block">
                    {flaw.category.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] font-mono opacity-90 truncate block">
                    {flaw.startTime.toFixed(1)}s–{flaw.endTime.toFixed(1)}s
                  </span>
                </div>
              );
            })}

            {/* Current Playhead Indicator */}
            {safeDuration > 0 && currentPlaybackTime > 0 && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#242522] z-30 pointer-events-none shadow-xs transition-all duration-75"
                style={{
                  left: `${Math.min(100, (currentPlaybackTime / safeDuration) * 100)}%`,
                }}
              >
                <div className="w-2 h-2 -ml-[3px] bg-[#242522] rounded-full -mt-0.5" />
              </div>
            )}
          </div>
        </div>

        {/* Timestamp axis labels */}
        <div className="flex justify-between px-2 text-[10px] font-mono text-[#77766F]">
          {ticks.map((t, idx) => (
            <span key={idx}>{t.toFixed(1)}s</span>
          ))}
        </div>
      </div>
    </div>
  );
};
