import React from 'react';
import { Trophy, Star, ThumbsUp, AlertTriangle, ClipboardList, MessageSquare } from 'lucide-react';
import { GlassLayout } from './GlassLayout';

interface SubjectDetailsProps {
  subjectData: any;
  onBack: () => void;
  onOpenMessage: () => void;
  formatDate: (dateString: string) => string;
}

export const SubjectDetails: React.FC<SubjectDetailsProps> = ({ subjectData, onBack, onOpenMessage, formatDate }) => {
  const s = subjectData;
  const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
  const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
  const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
  const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];

  return (
    <div className="animate-in slide-in-from-left-4 duration-300 h-full">
      <GlassLayout
        title={s.subject}
        showBack={true}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5 bg-[#fff8e1] border border-[#ffecb3] px-3 py-1.5 rounded-xl shadow-sm">
            <Trophy size={14} className="text-[#f59e0b]" />
            <span className="text-sm font-black text-[#d97706]" dir="ltr">{s.totalPoints}</span>
            <span className="text-[9px] font-bold text-[#d97706]/80">نقطة</span>
          </div>
        }
      >
        <div className="space-y-6">
          {/* الإحصائيات */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0"><Trophy size={18}/></div>
              <div className="flex flex-col">
                <p className="text-slate-500 text-[10px] font-bold">إجمالي النقاط</p>
                <h3 className="text-lg font-black text-slate-800 leading-none">{s.totalPoints}</h3>
              </div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><Star size={18}/></div>
              <div className="flex flex-col">
                <p className="text-slate-500 text-[10px] font-bold">أيام الانضباط</p>
                <h3 className="text-lg font-black text-slate-800 leading-none">{disciplineCount}</h3>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* الإنجازات (مربع بتمرير داخلي) */}
            <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#000666] mb-3 flex items-center gap-2 px-1 shrink-0">
                  <ThumbsUp size={16} className="text-green-600"/> إنجازات إيجابية
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-green-50/50 border border-green-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <p className="text-center text-xs text-slate-400 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">- لا يوجد حالياً -</p>}
              </div>
            </section>

            {/* التنبيهات (مربع بتمرير داخلي) */}
            <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#000666] mb-3 flex items-center gap-2 px-1 shrink-0">
                  <AlertTriangle size={16} className="text-red-500"/> تنبيهات وملاحظات
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {neg.length > 0 ? neg.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <p className="text-center text-xs text-slate-400 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">- لا توجد تنبيهات -</p>}
              </div>
            </section>
          </div>

          {/* سجل الدرجات (مربع بتمرير داخلي) */}
          <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-black text-[#000666] mb-3 flex items-center gap-2 px-1 shrink-0">
                <ClipboardList size={16} className="text-[#000666]"/> سجل الدرجات
            </h3>
            <div className="rounded-2xl border border-slate-200 overflow-hidden overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                    <th className="py-3 px-4 text-right">الاختبار / الواجب</th>
                    <th className="py-3 px-4 text-center w-24">الدرجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {s.grades?.map((g: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-700 text-xs">{g.category}</td>
                      <td className="py-3 px-4 text-center"><span className="text-sm font-black text-[#000666]">{g.score}</span></td>
                    </tr>
                  ))}
                  {(!s.grades || s.grades.length === 0) && (
                    <tr><td colSpan={2} className="py-6 text-center text-xs text-slate-400 font-bold">لم يتم رصد درجات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <button onClick={onOpenMessage} className="w-full mt-4 bg-indigo-50 hover:bg-indigo-100 text-[#000666] border border-indigo-100 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm">
            <MessageSquare size={18} /> تواصل مع معلم المادة
          </button>
        </div>
      </GlassLayout>
    </div>
  );
};
