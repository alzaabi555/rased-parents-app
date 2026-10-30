import React from 'react';
import { Key, Loader2, School } from 'lucide-react';
import type { SavedProfile } from '../types/parent';
import { SavedChildrenList } from './SavedChildrenList';
export interface ParentLoginProps { secretCode: string; error: string; isLoading: boolean; savedProfiles: SavedProfile[]; onCodeChange: (value: string) => void; onSubmit: (event: React.FormEvent) => void; onSelectChild: (profile: SavedProfile) => void; onRemoveChild: (id: string, event: React.MouseEvent) => void; }
export const ParentLogin: React.FC<ParentLoginProps> = props => (
  <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center font-sans overflow-hidden relative px-6 bg-[#f0f4f8]" dir="rtl">
    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none" />
    <main className="w-full max-w-md relative z-10 flex flex-col items-center max-h-screen overflow-y-auto custom-scrollbar py-10">
      <div className="text-center mb-8"><div className="inline-flex p-5 rounded-[2rem] bg-white/80 mb-6 shadow-xl text-[#002366]"><School className="w-12 h-12"/></div><h1 className="text-5xl font-black text-[#002366] mb-2">راصد</h1><p className="text-slate-500 font-black text-sm">بوابة ولي الأمر</p><p className="text-[10px] font-bold text-slate-400 mt-2">هوية موحدة لعائلة راصد</p></div>
      <div className="w-full flex flex-col gap-6">
        <SavedChildrenList profiles={props.savedProfiles} onSelect={props.onSelectChild} onRemove={props.onRemoveChild}/>
        <form onSubmit={props.onSubmit} className="w-full bg-white/85 rounded-[2.5rem] p-7 shadow-xl border border-white/70">
          <label className="block text-sm font-black text-[#002366] mb-3">كود الطالب</label>
          <div className="relative"><Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><input value={props.secretCode} onChange={e=>props.onCodeChange(e.target.value.toUpperCase())} dir="ltr" autoComplete="off" className="w-full rounded-2xl border border-indigo-100 bg-indigo-50/40 py-4 pr-12 pl-4 font-mono font-black tracking-wider outline-none focus:ring-2 focus:ring-indigo-200" placeholder="RSD-XXXX-XXXX"/></div>
          {props.error && <p role="alert" className="mt-3 text-xs font-bold text-rose-600">{props.error}</p>}
          <button type="submit" disabled={!props.secretCode || props.isLoading} className="mt-5 w-full bg-[#002366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50">{props.isLoading ? <Loader2 className="animate-spin" size={20}/> : 'دخول'}</button>
        </form>
      </div>
    </main>
  </div>
);
