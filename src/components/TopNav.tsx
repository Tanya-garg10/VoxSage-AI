import React from 'react';
import { Plus, Disc, Activity, Sparkles, Layers, BookOpen, Award, Menu, X, User } from 'lucide-react';

export type ViewType = 'workspace' | 'studio' | 'analyze' | 'dataset' | 'evaluation' | 'profile';

interface Props {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenNewAnalysis: () => void;
  isAnalyzing?: boolean;
}

export const TopNav: React.FC<Props> = ({
  activeView,
  onSelectView,
  onOpenNewAnalysis,
  isAnalyzing = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks: { id: ViewType; label: string; badge?: string }[] = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'studio', label: 'Replay & Improve', badge: 'Interactive' },
    { id: 'dataset', label: 'Dataset Lab' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'profile', label: 'Speaker Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFEFB]/90 backdrop-blur-md border-b border-[#E6E2D9] px-4 sm:px-8 h-18 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={() => onSelectView('workspace')}
          className="flex items-center gap-3 group text-left cursor-pointer select-none"
        >
          {/* Minimal audio-wave symbol */}
          <div className="w-8 h-8 rounded-lg bg-[#242522] flex items-center justify-center text-[#F7F5F0] transition group-hover:bg-[#6558D9]">
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-0.5 h-2 bg-current rounded-full" />
              <span className="w-0.5 h-4 bg-current rounded-full" />
              <span className="w-0.5 h-3 bg-current rounded-full" />
              <span className="w-0.5 h-1.5 bg-current rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-editorial text-xl font-bold tracking-tight text-[#242522]">
                VoxSage
              </span>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6558D9] px-1.5 py-0.5 rounded bg-[#6558D9]/10">
                PRO
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onSelectView(link.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer relative ${
                  isActive
                    ? 'text-[#242522] font-semibold bg-[#F7F5F0]'
                    : 'text-[#77766F] hover:text-[#242522] hover:bg-[#F7F5F0]/60'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-[#6558D9]/10 text-[#6558D9] border border-[#6558D9]/20">
                      {link.badge}
                    </span>
                  )}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#6558D9] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right controls: Demo indicator, + New Analysis CTA, user avatar */}
      <div className="flex items-center gap-3">
        {/* Real-time DSP indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F5F0] border border-[#E6E2D9] text-[11px] font-medium text-[#77766F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4E826B] animate-pulse" />
          <span>16kHz PCM · DTW Active</span>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onOpenNewAnalysis}
          className="px-4 py-2 rounded-lg bg-[#242522] hover:bg-[#6558D9] text-[#FFFEFB] text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>

        {/* User avatar button linked to Profile view */}
        <button
          type="button"
          onClick={() => onSelectView('profile')}
          className={`w-8 h-8 rounded-full border text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center select-none shadow-xs ${
            activeView === 'profile'
              ? 'bg-[#6558D9] text-[#FFFEFB] border-[#6558D9]'
              : 'bg-[#F7F5F0] border-[#E6E2D9] text-[#242522] hover:border-[#6558D9]'
          }`}
          title="Tanya Garg (Speaker Profile & Baselines)"
        >
          GT
        </button>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-[#77766F] hover:text-[#242522] hover:bg-[#F7F5F0]"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-18 left-0 right-0 bg-[#FFFEFB] border-b border-[#E6E2D9] p-4 space-y-2 md:hidden shadow-lg z-50">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                onSelectView(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeView === link.id
                  ? 'bg-[#F7F5F0] text-[#242522] font-semibold'
                  : 'text-[#77766F] hover:bg-[#F7F5F0]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
