import React from 'react';

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-3">
      {icon}
    </div>
    <p className="text-xs font-black text-slate-500">{title}</p>
    {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

