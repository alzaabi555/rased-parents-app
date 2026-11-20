import React, { useMemo } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { EmptyState } from '../../EmptyState';
import { formatDate, safeList } from '../../../utils/parentViewUtils';

type BehaviorRow = {
  item: any;
  count: number;
  date: string | number | Date | undefined;
};

const normalizeBehaviorName = (value: unknown) =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ar');

export const SubjectBehaviorTab: React.FC<{ behaviors: any[] }> = ({ behaviors }) => {
  const rows = useMemo<BehaviorRow[]>(() => {
    const source = safeList<any>(behaviors);
    const positiveGroups = new Map<string, BehaviorRow>();
    const ungrouped: BehaviorRow[] = [];

    source.forEach((item, index) => {
      if (item.type !== 'positive') {
        ungrouped.push({ item, count: 1, date: item.date });
        return;
      }

      const fallbackName = item.description || 'إنجاز إيجابي';
      const normalizedName = normalizeBehaviorName(fallbackName);
      // SubjectBehaviorTab is rendered inside one subject, and `behaviors` is
      // expected to contain only the currently displayed period.
      const groupKey = normalizedName || `positive-${item.id || index}`;
      const existing = positiveGroups.get(groupKey);

      if (!existing) {
        positiveGroups.set(groupKey, { item, count: 1, date: item.date });
        return;
      }

      existing.count += 1;

      // Keep the newest record as the representative row.
      if (new Date(item.date || 0).getTime() > new Date(existing.date || 0).getTime()) {
        existing.item = item;
        existing.date = item.date;
      }
    });

    return [...positiveGroups.values(), ...ungrouped].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );
  }, [behaviors]);

  if (!rows.length) {
    return (
      <EmptyState
        icon={<Sparkles size={18} />}
        title="لا توجد سجلات سلوكية"
        subtitle="ستظهر الإنجازات والتنبيهات هنا"
      />
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(({ item, count }, index) => {
        const positive = item.type === 'positive';
        const title = item.description || (positive ? 'إنجاز إيجابي' : 'تنبيه سلوكي');

        return (
          <div
            key={positive ? `positive-${normalizeBehaviorName(title)}` : item.id || `negative-${index}`}
            className={`rounded-2xl border p-4 shadow-sm ${
              positive
                ? 'border-emerald-100 bg-emerald-50/70'
                : 'border-rose-100 bg-rose-50/70'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${
                  positive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {positive ? <Sparkles size={18} /> : <AlertTriangle size={18} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-sm font-black ${
                      positive ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {title}
                  </h3>
                  {positive && count > 1 && (
                    <span
                      className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white"
                      aria-label={`تكرر ${count} مرات`}
                    >
                      ×{count}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {formatDate(item.date)}
                </p>

                {item.points !== undefined && (
                  <p className="mt-2 text-xs font-black text-slate-600">
                    النقاط: {item.points}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
