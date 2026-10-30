import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface GlassLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}

export const GlassLayout: React.FC<GlassLayoutProps> = ({ title, subtitle, icon, rightAction, showBack, onBack, children }) => {
  return (
    // الغلاف الخارجي مخفي التمرير ليثبت الهيدر
    <div className="flex flex-col h-full w-full relative bg-[#f8fafc] overflow-hidden" dir="rtl">
      
      {/* الهيدر الزجاجي المطلق (لا يتحرك أبداً) */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {showBack && (
              <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-[#000666] transition-colors active:scale-95 shrink-0">
                <ArrowLeft size={20}/>
              </button>
            )}
            {icon && !showBack && (
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#000666] shrink-0 shadow-inner">
                {icon}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <h1 className="font-black text-lg text-[#000666] leading-tight truncate">{title}</h1>
              {subtitle && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-[#000666] border border-indigo-100 mt-1 inline-block w-fit truncate">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          {rightAction && (
            <div className="shrink-0 flex items-center gap-2 pl-2">
              {rightAction}
            </div>
          )}
        </div>
      </header>

      {/* المحتوى الداخلي (هو الذي يمرر وينزلق تحت الهيدر) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-[calc(env(safe-area-inset-top)+90px)] px-5 pb-[120px]">
        {children}
      </main>
      
    </div>
  );
};
