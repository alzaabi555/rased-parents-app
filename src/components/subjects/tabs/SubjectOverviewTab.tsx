import React from 'react';
import { AlertTriangle, BarChart3, Gamepad2, Lightbulb, MessageSquare, Sparkles, Trophy } from 'lucide-react';
import { InsightCard } from '../../InsightCard';

interface Props {
  subject: any;
  positiveCount: number;
  negativeCount: number;
  gamesCount: number;
  messagesCount: number;
  recommendation: string;
  onOpenMessages: () => void;
}

export const SubjectOverviewTab: React.FC<Props> = ({
  subject, positiveCount, negativeCount, gamesCount, messagesCount, recommendation, onOpenMessages,
}) => (
  <div className="space-y-4">
    <section className="grid grid-cols-2 gap-3">
      <InsightCard label="النقاط" value={subject.totalPoints || 0} hint="إجمالي المادة" icon={<Trophy size={18} />} tone="blue" />
      <InsightCard label="الدرجات" value={subject.grades?.length || 0} hint="سجل التقييم" icon={<BarChart3 size={18} />} tone="slate" />
      <InsightCard label="الإنجازات" value={positiveCount} hint="سلوك إيجابي" icon={<Sparkles size={18} />} tone="green" />
      <InsightCard label="التنبيهات" value={negativeCount} hint="تحتاج متابعة" icon={<AlertTriangle size={18} />} tone={negativeCount ? 'rose' : 'slate'} />
      <InsightCard label="الألعاب" value={gamesCount} hint="نتائج تعليمية" icon={<Gamepad2 size={18} />} tone="amber" />
      <InsightCard label="الرسائل" value={messagesCount} hint="المحادثة الحالية" icon={<MessageSquare size={18} />} tone="blue" />
    </section>

    <section className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-5">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600"><Lightbulb size={19} /></div>
        <div><h3 className="text-sm font-black text-amber-800">توصية راصد للمادة</h3><p className="mt-1 text-xs font-bold leading-6 text-slate-600">{recommendation}</p></div>
      </div>
    </section>

    <button type="button" onClick={onOpenMessages} className="w-full rounded-2xl bg-[#002366] px-5 py-4 text-sm font-black text-white shadow-lg active:scale-[0.99]">
      فتح مراسلات المادة
    </button>
  </div>
);
