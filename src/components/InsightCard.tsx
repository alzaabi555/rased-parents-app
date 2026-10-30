import React from 'react';
import type { SummaryInsight } from '../types/learning';
import { toneClasses } from '../constants/toneClasses';

export const InsightCard: React.FC<SummaryInsight> = ({ label, value, hint, icon, tone }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/70">
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 mb-1">{label}</p>
        <h3 className="text-lg font-black text-slate-800 leading-none">{value}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-1 line-clamp-1">{hint}</p>
      </div>
    </div>
  </div>
);

