import React from 'react';
import { Bell, BookOpen, LayoutGrid, User } from 'lucide-react';
import type { TabId } from '../types/parent';

interface BottomNavigationProps {
  currentTab: TabId;
  negativeCount: number;
  onChange: (tab: TabId) => void;
}

const items: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'home', label: 'الرئيسية', icon: <LayoutGrid size={21} /> },
  { id: 'subjects', label: 'المواد', icon: <BookOpen size={21} /> },
  { id: 'alerts', label: 'الإشعارات', icon: <Bell size={21} /> },
  { id: 'profile', label: 'حسابي', icon: <User size={21} /> },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, negativeCount, onChange }) => (
  <nav
    className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center rounded-[2rem] border border-white bg-white/90 px-2 py-2 shadow-2xl backdrop-blur-xl"
    aria-label="التنقل الرئيسي"
  >
    {items.map(item => (
      <button
        key={item.id}
        type="button"
        onClick={() => onChange(item.id)}
        className={`relative flex min-w-[64px] flex-col items-center justify-center rounded-2xl px-2 py-2 transition-all duration-300 ${
          currentTab === item.id
            ? 'bg-indigo-50 text-[#002366] -translate-y-1 shadow-sm'
            : 'text-slate-400 hover:text-indigo-500'
        }`}
      >
        {item.icon}
        {item.id === 'alerts' && negativeCount > 0 && (
          <span className="absolute right-3 top-1 h-2 w-2 rounded-full border border-white bg-rose-500" />
        )}
        <span className="mt-1 text-[9px] font-black">{item.label}</span>
      </button>
    ))}
  </nav>
);
