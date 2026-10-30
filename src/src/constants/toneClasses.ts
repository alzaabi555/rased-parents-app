import type { SummaryInsight } from '../types/learning';
export const toneClasses: Record<SummaryInsight['tone'], string> = {
  blue: 'bg-indigo-50 text-[#002366] border-indigo-100', green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100', rose: 'bg-rose-50 text-rose-600 border-rose-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-100'
};
