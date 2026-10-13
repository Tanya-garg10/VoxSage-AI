import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  colorScheme?: 'neutral' | 'accent' | 'reference' | 'comparison' | 'success';
}

export const EditorialMetricCard: React.FC<Props> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  badge,
  colorScheme = 'neutral',
}) => {
  const iconColor = {
    neutral: 'text-[#242522] bg-[#F7F5F0]',
    accent: 'text-[#6558D9] bg-[#6558D9]/10',
    reference: 'text-[#4E8BBD] bg-[#4E8BBD]/10',
    comparison: 'text-[#D97757] bg-[#D97757]/10',
    success: 'text-[#4E826B] bg-[#4E826B]/10',
  }[colorScheme];

  return (
    <div className="editorial-card rounded-xl p-5 transition-all hover:border-[#D9D5CC] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77766F]">
            {label}
          </span>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${iconColor}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-[#242522] font-mono">
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-[#77766F]">{unit}</span>}
        </div>

        {subtext && <p className="text-xs text-[#77766F] mt-1 leading-normal">{subtext}</p>}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-[#E6E2D9]/70 flex items-center justify-between text-[11px]">
          <span className="text-[#77766F]">Status</span>
          <span className="font-semibold text-[#242522]">{badge}</span>
        </div>
      )}
    </div>
  );
};
