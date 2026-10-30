import React from 'react';
import { CheckCheck } from 'lucide-react';
export const WelcomeScreen: React.FC<{ studentName: string }> = ({ studentName }) => (
  <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#f0f4f8]" dir="rtl">
    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl border border-white flex items-center justify-center text-emerald-600 mb-6"><CheckCheck size={44} /></div>
    <h2 className="text-2xl font-black text-[#002366] mb-2">مرحبًا بكم</h2>
    <p className="text-slate-600 text-lg font-bold">{studentName}</p>
  </div>
);
