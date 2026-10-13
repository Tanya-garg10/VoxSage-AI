import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  accentColor?: 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
}

export const AcousticMetricsCard: React.FC<Props> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'indigo',
}) => {
  const accentStyles = {
    indigo: {
      iconBg: 'bg-[#635BFF]/10 text-[#635BFF]',
      badge: 'bg-[#635BFF]/10 text-[#635BFF]',
    },
    blue: {
      iconBg: 'bg-[#3898FF]/10 text-[#3898FF]',
      badge: 'bg-[#3898FF]/10 text-[#3898FF]',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-50 text-amber-700',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-50 text-rose-700',
    },
    violet: {
      iconBg: 'bg-purple-50 text-purple-600',
      badge: 'bg-purple-50 text-purple-700',
    },
  }[accentColor];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accentStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-slate-500 leading-relaxed mt-1">{subtitle}</p>}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Diagnosis</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full ${accentStyles.badge}`}>{badge}</span>
        </div>
      )}
    </div>
  );
};
