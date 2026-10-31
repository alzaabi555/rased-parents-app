import React from 'react';
import { BookOpen, ChevronLeft, Gamepad2, MessageSquare, Sparkles, TriangleAlert } from 'lucide-react';
import { formatDate, getSubjectGameResults, safeList } from '../../utils/parentViewUtils';

interface SubjectCardProps {
  subject: any;
  onOpen: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onOpen }) => {
  const positive = safeList<any>(subject.behaviors).filter(item => item.type === 'positive').length;
  const negative = safeList<any>(subject.behaviors).filter(item => item.type === 'negative').length;
  const grades = safeList<any>(subject.grades).length;
  const messages = safeList<any>(subject.parentMessages).length;
  const games = getSubjectGameResults(subject).length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[2rem] border border-white/80 bg-white/90 p-5 text-right shadow-sm transition-all hover:border-indigo-200 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-[#002366]">
            <BookOpen size={21} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-800">{subject.subject || 'مادة دراسية'}</h3>
            <p className="mt-1 text-[10px] font-bold text-slate-400">آخر تحديث: {formatDate(subject.lastUpdate)}</p>
          </div>
        </div>
        <ChevronLeft size={20} className="mt-3 shrink-0 text-indigo-200" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <span className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-black text-[#002366]">{grades} درجة</span>
        <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700"><Sparkles size={12} className="ml-1 inline" />{positive} إنجاز</span>
        <span className={`rounded-xl border px-3 py-2 text-[10px] font-black ${negative ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}><TriangleAlert size={12} className="ml-1 inline" />{negative} تنبيه</span>
        <span className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-700"><Gamepad2 size={12} className="ml-1 inline" />{games} لعبة</span>
      </div>

      {messages > 0 && (
        <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-emerald-700">
          <MessageSquare size={13} />
          {messages} رسالة في المادة
        </div>
      )}
    </button>
  );
};
