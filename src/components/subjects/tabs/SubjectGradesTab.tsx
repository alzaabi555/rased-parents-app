import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '../../EmptyState';
import { formatDate, safeList } from '../../../utils/parentViewUtils';

export const SubjectGradesTab: React.FC<{ grades: any[] }> = ({ grades }) => {
  const rows = [...safeList<any>(grades)].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  if (!rows.length) return <EmptyState icon={<BarChart3 size={18} />} title="لا توجد درجات" subtitle="ستظهر درجات المادة هنا عند رصدها" />;
  return <div className="space-y-3">{rows.map((grade, index) => <div key={grade.id || grade.sourceGradeId || index} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-slate-800">{grade.category || grade.title || 'تقييم'}</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{formatDate(grade.date)}</p></div><span className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-black text-[#002366]">{grade.score ?? 0}{grade.maxScore ? ` / ${grade.maxScore}` : ''}</span></div></div>)}</div>;
};
