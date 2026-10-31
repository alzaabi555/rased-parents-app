import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'جاري تحميل بيانات الطالب...' }) => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-6" dir="rtl">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white text-emerald-700 shadow-xl ring-1 ring-emerald-100">
      <Loader2 className="h-9 w-9 animate-spin" />
    </div>
    <p className="text-center text-sm font-black text-emerald-950">{label}</p>
  </div>
);
