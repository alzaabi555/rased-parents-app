import React from 'react';
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import type { SavedProfile } from '../types/parent';
import { SavedChildrenList } from './SavedChildrenList';

export interface ParentLoginProps {
  secretCode: string;
  error: string;
  isLoading: boolean;
  savedProfiles: SavedProfile[];
  onCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onSelectChild: (profile: SavedProfile) => void;
  onRemoveChild: (id: string, event: React.MouseEvent) => void;
}

export const ParentLogin: React.FC<ParentLoginProps> = props => (
  <div
    className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-5 font-sans"
    dir="rtl"
  >
    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl" />

    <main className="relative z-10 w-full max-w-md py-8">
      <header className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/20 ring-4 ring-white">
          <ShieldCheck size={38} strokeWidth={2.2} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-emerald-950">راصد</h1>
        <p className="mt-1 text-sm font-black text-emerald-700">ولي الأمر</p>
        <p className="mt-2 text-xs font-bold text-slate-400">
          اختر أحد الأبناء أو أدخل كود الطالب
        </p>
      </header>

      <div className="space-y-4">
        {props.savedProfiles.length > 0 && (
          <section aria-label="الأبناء المحفوظون">
            <SavedChildrenList
              profiles={props.savedProfiles}
              onSelect={props.onSelectChild}
              onRemove={props.onRemoveChild}
            />
          </section>
        )}

        <form
          onSubmit={props.onSubmit}
          className="rounded-[2rem] border border-emerald-100 bg-white/95 p-5 shadow-xl shadow-slate-200/60 backdrop-blur"
        >
          {props.savedProfiles.length > 0 && (
            <div className="mb-4 flex items-center gap-3 text-[10px] font-black text-slate-400">
              <span className="h-px flex-1 bg-slate-100" />
              دخول بكود طالب آخر
              <span className="h-px flex-1 bg-slate-100" />
            </div>
          )}

          <label htmlFor="parent-student-code" className="mb-2 block text-xs font-black text-slate-700">
            كود الطالب
          </label>

          <div className="relative">
            <KeyRound
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700"
              size={19}
            />
            <input
              id="parent-student-code"
              value={props.secretCode}
              onChange={event => props.onCodeChange(event.target.value.toUpperCase())}
              dir="ltr"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="RSD-XXXX-XXXX"
              aria-describedby={props.error ? 'parent-login-error' : undefined}
              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 py-4 pl-4 pr-12 text-center font-mono text-base font-black tracking-widest text-emerald-950 outline-none transition placeholder:text-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {props.error && (
            <p id="parent-login-error" role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-bold text-rose-600">
              {props.error}
            </p>
          )}

          <button
            type="submit"
            disabled={!props.secretCode.trim() || props.isLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-700 to-emerald-900 py-4 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {props.isLoading ? (
              <>
                <Loader2 className="animate-spin" size={19} />
                جاري الدخول...
              </>
            ) : (
              <>
                دخول
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[10px] font-bold text-slate-400">
        الحساب العائلي يستعاد بكود أي ابن مرتبط
      </p>
    </main>
  </div>
);
