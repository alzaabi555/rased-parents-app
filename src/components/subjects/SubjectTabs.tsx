import React from 'react';
import { BarChart3, Gamepad2, LayoutDashboard, MessageSquare, Sparkles } from 'lucide-react';

export type SubjectTabId = 'overview' | 'grades' | 'behavior' | 'games' | 'messages';

interface SubjectTabsProps {
  activeTab: SubjectTabId;
  counts: Record<Exclude<SubjectTabId, 'overview'>, number>;
  onChange: (tab: SubjectTabId) => void;
}

export const SubjectTabs: React.FC<SubjectTabsProps> = ({ activeTab, counts, onChange }) => {
  const tabs = [
    { id: 'overview' as const, label: 'نظرة عامة', icon: <LayoutDashboard size={16} /> },
    { id: 'grades' as const, label: 'الدرجات', icon: <BarChart3 size={16} />, count: counts.grades },
    { id: 'behavior' as const, label: 'السلوك', icon: <Sparkles size={16} />, count: counts.behavior },
    { id: 'games' as const, label: 'الألعاب', icon: <Gamepad2 size={16} />, count: counts.games },
    { id: 'messages' as const, label: 'المراسلات', icon: <MessageSquare size={16} />, count: counts.messages },
  ];

  return (
    <div className="mb-5 overflow-x-auto pb-1 custom-scrollbar">
      <div className="flex min-w-max gap-2 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-black transition ${
              activeTab === tab.id
                ? 'bg-[#002366] text-white shadow-md'
                : 'text-slate-500 hover:bg-indigo-50 hover:text-[#002366]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {'count' in tab && Number(tab.count) > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
