import React from 'react';
import { Menu, Activity, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface Props {
  activeTabTitle: string;
  onOpenMobileMenu: () => void;
  analysisCount?: number;
}

export const Header: React.FC<Props> = ({ activeTabTitle, onOpenMobileMenu, analysisCount = 6 }) => {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#635BFF] hidden sm:block" />
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Right: Engine status, speech intelligence badge, profile */}
      <div className="flex items-center gap-3">
        {/* Real-time DSP engine status badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-medium">DSP Engine:</span>
          <span className="font-semibold text-slate-800 font-mono">16kHz PCM · DTW Active</span>
        </div>

        {/* Contrastive Speech Intelligence Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#635BFF]/8 text-[#635BFF] border border-[#635BFF]/20 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Contrastive Speech Intelligence</span>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#635BFF] to-[#3898FF] text-white flex items-center justify-center text-xs font-bold shadow-xs select-none"
            title="Speaker Profile"
          >
            GT
          </div>
        </div>
      </div>
    </header>
  );
};
