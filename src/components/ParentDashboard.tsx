import React from 'react';
import { AlertTriangle, Award, BookOpen, Gamepad2, Lightbulb, RefreshCw, ShieldCheck, Trophy, User } from 'lucide-react';
import type { SummaryInsight } from '../types/learning';
import { GlassLayout } from './GlassLayout';
import { InsightCard } from './InsightCard';

interface ParentDashboardProps {
  allSubjects: any[];
  parentSummary: any;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSubjects: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  allSubjects,
  parentSummary,
  isRefreshing,
  onRefresh,
  onOpenSubjects,
}) => {
  const insights: SummaryInsight[] = [
    {
      label: 'حالة اليوم',
      value: parentSummary.status,
      hint: 'قراءة عامة للمتابعة',
      icon: <ShieldCheck size={18} />,
      tone: parentSummary.negativeCount > 2 ? 'rose' : parentSummary.negativeCount > 0 ? 'amber' : 'green',
    },
    {
      label: 'إجمالي النقاط',
      value: parentSummary.totalPoints,
      hint: 'من جميع المواد',
      icon: <Trophy size={18} />,
      tone: 'blue',
    },
    {
      label: 'متوسط الألعاب',
      value: `${parentSummary.learningSummary.averageScore || 0}%`,
      hint: `${parentSummary.learningSummary.totalActivities || 0} نشاط تعليمي`,
      icon: <Gamepad2 size={18} />,
      tone: parentSummary.learningSummary.averageScore >= 75 ? 'green' : parentSummary.learningSummary.averageScore >= 50 ? 'amber' : 'rose',
    },
    {
      label: 'تحتاج مراجعة',
      value: parentSummary.learningSummary.needsReview?.length || 0,
      hint: 'دروس مقترحة للمتابعة',
      icon: <BookOpen size={18} />,
      tone: parentSummary.learningSummary.needsReview?.length ? 'amber' : 'green',
    },
    {
      label: 'الإنجازات',
      value: parentSummary.positiveCount,
      hint: 'ملاحظات إيجابية',
      icon: <Award size={18} />,
      tone: 'green',
    },
    {
      label: 'التنبيهات',
      value: parentSummary.negativeCount,
      hint: 'تحتاج قراءة',
      icon: <AlertTriangle size={18} />,
      tone: parentSummary.negativeCount > 0 ? 'rose' : 'slate',
    },
  ];

  return (
    <GlassLayout
      title={allSubjects[0]?.name || 'الطالب'}
      subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
      icon={<User size={24} />}
      rightAction={
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="تحديث البيانات"
          className="rounded-xl border border-indigo-100 bg-white/70 p-2.5 text-[#002366] shadow-sm transition hover:bg-white active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      }
    >
      <div className="space-y-5">
        <section className="grid grid-cols-2 gap-3">
          {insights.map(item => <InsightCard key={item.label} {...item} />)}
        </section>

        <section className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <Lightbulb size={19} />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-800">توصية راصد</h2>
              <p className="mt-1 text-xs font-bold leading-6 text-slate-600">{parentSummary.recommendation}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-[#002366]">
                <BookOpen size={21} />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#002366]">المواد الدراسية</h2>
                <p className="mt-1 text-[10px] font-bold text-slate-400">{allSubjects.length} مادة مرتبطة بالطالب</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSubjects}
              className="rounded-xl bg-[#002366] px-4 py-2.5 text-[10px] font-black text-white transition active:scale-95"
            >
              عرض المواد
            </button>
          </div>
        </section>
      </div>
    </GlassLayout>
  );
};
