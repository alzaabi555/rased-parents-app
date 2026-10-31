import React from 'react';
import { CalendarCheck2, Code, LogOut, User, Users } from 'lucide-react';
import { GlassLayout } from './GlassLayout';
import { InsightCard } from './InsightCard';
import { formatDate } from '../utils/parentViewUtils';

interface ParentProfileProps { allSubjects:any[]; savedProfilesCount:number; secretCode:string; parentSummary:any; onLogout:()=>void; }
export const ParentProfile:React.FC<ParentProfileProps>=({allSubjects,savedProfilesCount,secretCode,parentSummary,onLogout})=>(
<>
      <GlassLayout title="حسابي" icon={<User size={24} />}>
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/60 text-center mb-6">
          <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[2rem] mx-auto flex items-center justify-center text-[#002366] mb-4 shadow-inner"><User size={40} /></div>
          <h3 className="text-xl font-black text-slate-800 mb-1">ولي أمر الطالب</h3>
          <p className="text-[#002366] text-sm font-bold bg-indigo-50/50 py-2 px-6 rounded-xl border border-indigo-100/50 inline-block mt-2">{allSubjects[0]?.name}</p>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400">الكود السري المربوط: </span>
            <span className="text-xs font-mono font-black text-[#002366] bg-slate-100 px-2 py-1 rounded-md" dir="ltr">{String(allSubjects?.[0]?.centralRasedId || allSubjects?.[0]?.rasedId || secretCode)}</span>
          </div>
        </div>
        <section className="grid grid-cols-2 gap-3 mb-6">
          <InsightCard label="الأبناء المحفوظون" value={savedProfilesCount} hint="دخول سريع" icon={<Users size={18} />} tone="blue" />
          <InsightCard label="آخر تحديث" value={parentSummary.latestUpdate ? formatDate(parentSummary.latestUpdate) : 'غير محدد'} hint="بيانات الطالب" icon={<CalendarCheck2 size={18} />} tone="green" />
        </section>
        <button onClick={onLogout} className="w-full bg-rose-50/80 hover:bg-rose-100 border border-rose-100 text-rose-600 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"><LogOut size={20} /> تسجيل الخروج</button>
        <div className="mt-12 text-center opacity-50">
          <p className="text-slate-500 text-[10px] font-bold mb-1">برمجة وتطوير</p>
          <div className="flex items-center justify-center gap-1.5"><Code size={12} className="text-[#002366]" /><span className="text-[#002366] text-[11px] font-black tracking-widest uppercase">ALZAABI MOHAMMAD</span></div>
        </div>
      </GlassLayout>
    </>
);
