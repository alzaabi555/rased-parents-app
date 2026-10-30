import React from 'react';
import { Trophy, Star, ThumbsUp, AlertTriangle, ClipboardList, MessagesSquare, ChevronLeft, Lightbulb, Gamepad2, ShieldCheck } from 'lucide-react';
import { GlassLayout } from './GlassLayout';
import { InsightCard } from './InsightCard';
import { EmptyState } from './EmptyState';
import type { LearningGameResult } from '../types/learning';
import { toneClasses } from '../constants/toneClasses';
import { formatDate, safeList, getSubjectGameResults, getGameScorePercent, getGameTitle, getMasteryArabic, getMasteryTone } from '../utils/parentViewUtils';

export const SubjectDetails: React.FC<{
  subjectData: any;
  onBack: () => void;
  onOpenMessage: () => void;
}> = ({ subjectData, onBack, onOpenMessage }) => {
  const s = subjectData;
  const allPos = safeList<any>(s.behaviors).filter((b: any) => b.type === 'positive');
  const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
  const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
  const neg = safeList<any>(s.behaviors).filter((b: any) => b.type === 'negative');
  const games = getSubjectGameResults(s);

  const subjectRecommendation = neg.length > 0
    ? 'توجد ملاحظة تحتاج متابعة. يُفضّل قراءة التنبيه ثم التواصل مع المعلم عند الحاجة.'
    : games.some(g => g.masteryLevel === 'needs_review' || g.masteryLevel === 'needs_followup')
      ? 'توجد نتائج ألعاب تشير إلى حاجة لمراجعة قصيرة في هذه المادة.'
      : displayPos.length > 0
        ? 'المادة تسير بشكل مطمئن. كلمة تشجيع للطالب ستزيد دافعيته.'
        : 'لا توجد ملاحظات كثيرة بعد. تابع نتائج الدرجات والإنجازات القادمة.';

  return (
    <div className="animate-in slide-in-from-left-8 fade-in duration-500 h-full">
      <GlassLayout
        title={s.subject}
        showBack={true}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm">
            <Trophy size={16} className="text-amber-600" />
            <span className="text-base font-black text-amber-600" dir="ltr">{s.totalPoints || 0}</span>
            <span className="text-[9px] font-bold text-amber-600/80 uppercase">نقطة</span>
          </div>
        }
      >
        <div className="space-y-5">
          <section className="bg-gradient-to-br from-white to-indigo-50/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/80 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-[#002366] shrink-0">
                <Lightbulb size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#002366] mb-1">توصية راصد لهذه المادة</h3>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">{subjectRecommendation}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <InsightCard label="إجمالي النقاط" value={s.totalPoints || 0} hint="نقاط رصدها المعلم" icon={<Trophy size={18} />} tone="blue" />
            <InsightCard label="أيام الانضباط" value={disciplineCount} hint="هدوء وانضباط" icon={<Star size={18} />} tone="amber" />
          </section>

          {games.length > 0 && (
            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1">
                <Gamepad2 size={18} className="text-[#002366]" /> إنجازات الألعاب التعليمية
              </h3>
              <div className="space-y-2">
                {games.slice(0, 5).map((game: LearningGameResult, i: number) => {
                  const masteryTone = getMasteryTone(game.masteryLevel);
                  return (
                    <div key={i} className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/70">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-700 line-clamp-1">{getGameTitle(game)}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                            {game.lesson || game.unit || s.lesson || 'نشاط مرتبط بالمادة'}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-[#002366] bg-white border border-indigo-100 px-2.5 py-1 rounded-xl shrink-0">
                          {getGameScorePercent(game)}%
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${toneClasses[masteryTone]}`}>
                          {getMasteryArabic(game.masteryLevel)}
                        </span>
                        {game.attemptNumber && (
                          <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                            محاولة {game.attemptNumber}
                          </span>
                        )}
                      </div>
                      {game.reviewRecommendation && (
                        <p className="text-[10px] font-bold text-slate-500 leading-5 mt-2 bg-white/70 border border-white rounded-xl p-2">
                          {game.reviewRecommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                <ThumbsUp size={18} className="text-emerald-500" /> إنجازات إيجابية
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 transition-all hover:bg-emerald-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <EmptyState icon={<ThumbsUp size={18} />} title="لا يوجد حالياً" />}
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                <AlertTriangle size={18} className="text-rose-500" /> تنبيهات وملاحظات
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {neg.length > 0 ? neg.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-rose-50/40 border border-rose-100 transition-all hover:bg-rose-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <EmptyState icon={<ShieldCheck size={18} />} title="لا توجد تنبيهات" subtitle="الوضع مطمئن في هذه المادة" />}
              </div>
            </section>
          </div>

          <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
              <ClipboardList size={18} className="text-[#002366]" /> سجل الدرجات
            </h3>
            <div className="rounded-2xl border border-indigo-50 overflow-hidden overflow-y-auto custom-scrollbar flex-1 bg-white/50">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 shadow-sm">
                  <tr className="text-slate-500 font-black text-[10px] uppercase border-b border-indigo-50">
                    <th className="py-3.5 px-4 text-right">الاختبار / الواجب</th>
                    <th className="py-3.5 px-4 text-center w-28">الدرجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50/50">
                  {safeList<any>(s.grades).map((g: any, i: number) => (
                    <tr key={i} className="hover:bg-white transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-700 text-xs">{g.category}</td>
                      <td className="py-3.5 px-4 text-center"><span className="text-sm font-black text-[#002366] bg-indigo-50/80 px-3 py-1 rounded-lg border border-indigo-100/50">{g.score}</span></td>
                    </tr>
                  ))}
                  {safeList(s.grades).length === 0 && (
                    <tr><td colSpan={2} className="py-8 text-center text-xs text-slate-400 font-bold">لم يتم رصد درجات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <button
            onClick={onOpenMessage}
            className="group relative w-full mt-2 overflow-hidden rounded-[1.7rem] bg-gradient-to-r from-[#002366] via-[#1e40af] to-[#2563eb] p-[1px] shadow-xl shadow-indigo-900/20 active:scale-[0.98] transition-all"
          >
            <div className="relative rounded-[1.65rem] bg-gradient-to-r from-[#002366] via-[#1e40af] to-[#2563eb] px-5 py-4 text-white">
              <div className="absolute inset-0 translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
                    <MessagesSquare size={21} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-black">صندوق رسائل المادة</span>
                    <span className="text-[10px] font-bold text-white/75">مراسلة المعلم ومتابعة الردود</span>
                  </span>
                </div>
                <span className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <ChevronLeft size={20} />
                </span>
              </div>
            </div>
          </button>
        </div>
      </GlassLayout>
    </div>
  );
};


