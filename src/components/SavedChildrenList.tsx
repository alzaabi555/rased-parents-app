import React from 'react';
import { Trash2, User, Users } from 'lucide-react';
import type { SavedProfile } from '../types/parent';
export interface SavedChildrenListProps { profiles: SavedProfile[]; onSelect: (profile: SavedProfile) => void; onRemove: (id: string, event: React.MouseEvent) => void; }
export const SavedChildrenList: React.FC<SavedChildrenListProps> = ({ profiles, onSelect, onRemove }) => {
  if (!profiles.length) return null;
  return <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl border border-white/70">
    <h2 className="text-sm font-black text-[#002366] mb-4 text-center flex items-center justify-center gap-2"><Users size={16}/> الدخول السريع للأبناء</h2>
    <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
      {profiles.map(profile => <div key={profile.id} onClick={() => onSelect(profile)} className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-95 group shadow-sm">
        <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#002366] border border-indigo-100"><User size={18}/></div><div><p className="font-black text-slate-700 text-sm">{profile.name}</p><p className="text-slate-400 text-[10px] font-mono mt-0.5" dir="ltr">{profile.centralRasedId || profile.currentRasedId || profile.legacyRasedIds?.[0] || profile.id}</p></div></div>
        <button type="button" onClick={event => onRemove(profile.id, event)} aria-label="حذف الابن المحفوظ" className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16}/></button>
      </div>)}
    </div>
  </div>;
};
