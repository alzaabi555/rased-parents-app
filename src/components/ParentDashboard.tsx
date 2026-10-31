import React from 'react';
import { AlertTriangle, Award, BookOpen, ChevronLeft, ClipboardList, Clock3, Gamepad2, History, Lightbulb, MailCheck, RefreshCw, ShieldCheck, Sparkles, Trophy, User } from 'lucide-react';
import type { SummaryInsight } from '../types/learning';
import { GlassLayout } from './GlassLayout';
import { InsightCard } from './InsightCard';
import { formatDate, getGameScorePercent, getSubjectGameResults, safeList } from '../utils/parentViewUtils';

interface ParentDashboardProps { allSubjects:any[]; parentSummary:any; secretCode:string; isRefreshing:boolean; onRefresh:()=>void; onSelectSubject:(subject:any)=>void; }
export const ParentDashboard:React.FC<ParentDashboardProps>=({allSubjects,parentSummary,secretCode,isRefreshing,onRefresh,onSelectSubject})=>{
const insights: SummaryInsight[] = [
      { label: 'حالة اليوم', value: parentSummary.status, hint: 'قراءة عامة للمتابعة', icon: <ShieldCheck size={18} />, tone: parentSummary.negativeCount > 2 ? 'rose' : parentSummary.negativeCount > 0 ? 'amber' : 'green' },
      { label: 'إجمالي النقاط', value: parentSummary.totalPoints, hint: 'من جميع المواد', icon: <Trophy size={18} />, tone: 'blue' },
      {
        label: 'متوسط الألعاب',
        value: `${parentSummary.learningSummary.averageScore || 0}%`,
        hint: `${parentSummary.learningSummary.totalActivities || 0} نشاط تعليمي`,
        icon: <Gamepad2 size={18} />,
        tone: parentSummary.learningSummary.averageScore >= 75 ? 'green' : parentSummary.learningSummary.averageScore >= 50 ? 'amber' : 'rose'
      },
      {
        label: 'تحتاج مراجعة',
        value: parentSummary.learningSummary.needsReview?.length || 0,
        hint: 'دروس مقترحة للمتابعة',
        icon: <BookOpen size={18} />,
        tone: parentSummary.learningSummary.needsReview?.length ? 'amber' : 'green'
      },
      { label: 'الإنجازات', value: parentSummary.positiveCount, hint: 'ملاحظات إيجابية', icon: <Award size={18} />, tone: 'green' },
      { label: 'التنبيهات', value: parentSummary.negativeCount, hint: 'تحتاج قراءة', icon: <AlertTriangle size={18} />, tone: parentSummary.negativeCount > 0 ? 'rose' : 'slate' }
    ];

    return (
      <>
        <GlassLayout
          title={allSubjects[0]?.name || 'الطالب'}
          subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
          icon={<User size={24} />}
          rightAction={
            <button onClick={() => onRefresh()} disabled={isRefreshing} className="p-2.5 rounded-xl bg-white/70 border border-indigo-100 text-[#002366] active:scale-95 shadow-sm hover:bg-white transition-colors">
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          }
        >
          <div className="space-y-5">
            <section className="bg-gradient-to-br from-white to-indigo-50/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/80">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#002366] flex items-center justify-center border border-indigo-100 shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 mb-1">ملخص راصد لولي الأمر</p>
                  <h2 className="text-lg font-black text-[#002366] mb-1">حالة الطالب: {parentSummary.status}</h2>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{parentSummary.recommendation}</p>
                  {parentSummary.latestUpdate && (
                    <p className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1"><Clock3 size={12} /> آخر تحديث: {formatDate(parentSummary.latestUpdate)}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/70">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                  <Lightbulb size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-400 mb-1">كيف أساعد ابني؟</p>
                  <h2 className="text-base font-black text-slate-800 mb-1">
                    {parentSummary.learningSummary.needsReview?.[0]
                      ? `راجع ${parentSummary.learningSummary.needsReview[0].lesson || 'الدرس المحدد'}`
                      : 'متابعة تعليمية مطمئنة'}
                  </h2>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {parentSummary.learningSummary.recommendation}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {insights.map(item => <InsightCard key={item.label} {...item} />)}
            </section>

            {(parentSummary.repliesCount > 0 || parentSummary.gradesCount > 0 || parentSummary.gamesCount > 0 || parentSummary.parentMessagesCount > 0) && (
              <section className="grid grid-cols-3 gap-3">
                <InsightCard label="الدرجات" value={parentSummary.gradesCount} hint="تحديثات مرصودة" icon={<ClipboardList size={18} />} tone="blue" />
                <InsightCard label="الرسائل" value={parentSummary.parentMessagesCount || parentSummary.repliesCount} hint="استفسارات وردود" icon={<MailCheck size={18} />} tone="green" />
                <InsightCard label="الألعاب" value={parentSummary.gamesCount || parentSummary.learningSummary.totalActivities} hint="أنشطة تعليمية" icon={<Gamepad2 size={18} />} tone="amber" />
              </section>
            )}

            <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/70">
              <h2 className="text-sm font-black text-[#002366] flex items-center gap-2 mb-4 px-1">
                <BookOpen size={18} className="text-[#002366]" /> المواد الدراسية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allSubjects.map((sub, idx) => {
                  const positive = safeList<any>(sub.behaviors).filter((b: any) => b.type === 'positive').length;
                  const negative = safeList<any>(sub.behaviors).filter((b: any) => b.type === 'negative').length;
                  const gameCount = getSubjectGameResults(sub).length;
                  const messageCount = safeList<any>(sub.parentMessages).length;
                  const subjectGames = getSubjectGameResults(sub);
                  const latestGameScore = subjectGames.length ? getGameScorePercent(subjectGames[0]) : 0;
                  const progress = latestGameScore || Math.min(100, Math.max(8, (Number(sub.totalPoints || 0) + 40)));
                  return (
                    <div key={idx} onClick={() => onSelectSubject(sub)} className="bg-white/85 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/70 hover:border-indigo-200 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-[#002366] border border-indigo-100/50"><BookOpen size={20} /></div>
                          <div>
                            <h3 className="text-base font-black text-slate-800">{sub.subject}</h3>
                            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 mt-0.5"><History size={10} /> {formatDate(sub.lastUpdate)}</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-indigo-200" />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">+{positive} إيجابي</span>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${negative > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{negative} تنبيه</span>
                        {messageCount > 0 && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-indigo-50 text-[#002366] border border-indigo-100">{messageCount} رسالة</span>}
                        {gameCount > 0 && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">{gameCount} لعبة</span>}
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-indigo-50 rounded-full overflow-hidden border border-indigo-100/30">
                          <div className="h-full bg-[#002366] rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-[#002366]">{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </GlassLayout>
      </>
    );
};
