import React from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { EmptyState } from '../../EmptyState';
import { formatDate, safeList } from '../../../utils/parentViewUtils';

export const SubjectBehaviorTab: React.FC<{ behaviors: any[] }> = ({ behaviors }) => {
  const rows = [...safeList<any>(behaviors)].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  if (!rows.length) return <EmptyState icon={<Sparkles size={18} />} title="لا توجد سجلات سلوكية" subtitle="ستظهر الإنجازات والتنبيهات هنا" />;
  return <div className="space-y-3">{rows.map((item, index) => { const positive = item.type === 'positive'; return <div key={item.id || index} className={`rounded-2xl border p-4 shadow-sm ${positive ? 'border-emerald-100 bg-emerald-50/70' : 'border-rose-100 bg-rose-50/70'}`}><div className="flex items-start gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{positive ? <Sparkles size={18} /> : <AlertTriangle size={18} />}</div><div><h3 className={`text-sm font-black ${positive ? 'text-emerald-800' : 'text-rose-800'}`}>{item.description || (positive ? 'إنجاز إيجابي' : 'تنبيه سلوكي')}</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{formatDate(item.date)}</p>{item.points !== undefined && <p className="mt-2 text-xs font-black text-slate-600">النقاط: {item.points}</p>}</div></div></div>; })}</div>;
};
