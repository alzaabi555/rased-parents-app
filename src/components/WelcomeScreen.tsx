import React from 'react';
import { CheckCheck } from 'lucide-react';

export const WelcomeScreen: React.FC<{ studentName: string }> = ({ studentName }) => (
  <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-6" dir="rtl">
    <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-emerald-600 shadow-xl ring-1 ring-emerald-100">
      <CheckCheck size={44} />
    </div>
    <h2 className="text-2xl font-black text-emerald-950">مرحبًا بكم</h2>
    <p className="mt-2 text-center text-lg font-bold text-slate-600">{studentName}</p>
  </div>
);
