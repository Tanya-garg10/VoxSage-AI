import React from 'react';
import {
  LayoutDashboard,
  Mic,
  GitCompare,
  Database,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  AudioWaveform,
  BookOpen,
  Info,
  X,
} from 'lucide-react';

export type TabType = 'overview' | 'analyze' | 'compare' | 'dataset' | 'evaluation' | 'settings';

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze' as TabType, label: 'Analyze Speech', icon: Mic },
    { id: 'compare' as TabType, label: 'Compare Recordings', icon: GitCompare },
    { id: 'dataset' as TabType, label: 'Dataset Lab', icon: Database },
    { id: 'evaluation' as TabType, label: 'Evaluation', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: TabType) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            {/* Sound-wave brand mark */}
            <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-xs shrink-0">
              <AudioWaveform className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight font-display">
                  VoxSage<span className="text-[#635BFF]">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Speech Analytics
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer select-none group relative ${
                  isActive
                    ? 'bg-[#635BFF]/10 text-[#635BFF] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#635BFF] rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#635BFF]' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Documentation & Version info */}
      <div className="p-3 border-t border-slate-200/80">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
              <BookOpen className="w-3.5 h-3.5 text-[#635BFF]" />
              <span>Speech Intelligence Docs</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Temporal flaw grounding via DTW alignment & F0 intonation analysis.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>v1.2.0-prod</span>
              <span className="text-emerald-600 font-semibold">● Ready</span>
            </div>
          </div>
        )}

        {/* Collapse button on desktop */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex bg-white border-r border-slate-200/80 flex-col transition-all duration-200 z-20 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 lg:hidden shadow-xl transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
