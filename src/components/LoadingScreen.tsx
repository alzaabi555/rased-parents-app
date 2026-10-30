import React from 'react';
import { Loader2 } from 'lucide-react';
export const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'جاري تحميل بيانات الطالب...' }) => (
  <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#f0f4f8]" dir="rtl">
    <Loader2 className="w-10 h-10 animate-spin text-[#002366] mb-4" />
    <p className="text-slate-600 font-black">{label}</p>
  </div>
);
