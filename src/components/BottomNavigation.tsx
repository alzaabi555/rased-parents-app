import React from 'react';
import { Bell, LayoutGrid, User } from 'lucide-react';
import type { TabId } from '../types/parent';
export const BottomNavigation: React.FC<{ currentTab: TabId; negativeCount: number; onChange: (tab: TabId) => void }> = ({ currentTab, negativeCount, onChange }) => (
  <nav className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] flex items-center px-3 py-2" aria-label="التنقل الرئيسي">
    <button type="button" onClick={()=>onChange('home')} className={`flex flex-col items-center px-4 py-2 ${currentTab==='home'?'text-[#002366] scale-110':'text-slate-400'}`}><LayoutGrid size={22}/><span className="text-[9px] font-black mt-1">الرئيسية</span></button>
    <button type="button" onClick={()=>onChange('alerts')} className={`relative flex flex-col items-center px-4 py-2 ${currentTab==='alerts'?'text-[#002366] scale-110':'text-slate-400'}`}><Bell size={22}/>{negativeCount>0&&<span className="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white"/>}<span className="text-[9px] font-black mt-1">إشعارات</span></button>
    <button type="button" onClick={()=>onChange('profile')} className={`flex flex-col items-center px-4 py-2 ${currentTab==='profile'?'text-[#002366] scale-110':'text-slate-400'}`}><User size={22}/><span className="text-[9px] font-black mt-1">حسابي</span></button>
  </nav>
);
