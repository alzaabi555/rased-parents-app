import React, { useMemo, useState } from 'react';
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { GlassLayout } from '../GlassLayout';
import { EmptyState } from '../EmptyState';
import { getSubjectGameResults, safeList } from '../../utils/parentViewUtils';
import { SubjectCard } from './SubjectCard';

type SubjectFilter = 'all' | 'grades' | 'alerts' | 'messages' | 'games';

interface ParentSubjectsProps {
  allSubjects: any[];
  onSelectSubject: (subject: any) => void;
}

export const ParentSubjects: React.FC<ParentSubjectsProps> = ({ allSubjects, onSelectSubject }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SubjectFilter>('all');

  const subjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...allSubjects]
      .filter(subject => !normalizedQuery || String(subject.subject || '').toLowerCase().includes(normalizedQuery))
      .filter(subject => {
        if (filter === 'grades') return safeList(subject.grades).length > 0;
        if (filter === 'alerts') return safeList<any>(subject.behaviors).some(item => item.type === 'negative');
        if (filter === 'messages') return safeList(subject.parentMessages).length > 0;
        if (filter === 'games') return getSubjectGameResults(subject).length > 0;
        return true;
      })
      .sort((a, b) => new Date(b.lastUpdate || 0).getTime() - new Date(a.lastUpdate || 0).getTime());
  }, [allSubjects, filter, query]);

  const filters: Array<{ id: SubjectFilter; label: string }> = [
    { id: 'all', label: 'الكل' },
    { id: 'grades', label: 'درجات' },
    { id: 'alerts', label: 'تنبيهات' },
    { id: 'messages', label: 'رسائل' },
    { id: 'games', label: 'ألعاب' },
  ];

  return (
    <GlassLayout
      title="المواد الدراسية"
      subtitle={`${allSubjects.length} مادة`}
      icon={<BookOpen size={24} />}
    >
      <div className="space-y-4 pb-4">
        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-md">
          <label className="relative block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="ابحث عن مادة..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-11 text-sm font-bold outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <SlidersHorizontal size={16} className="shrink-0 text-slate-400" />
            {filters.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`shrink-0 rounded-xl px-3 py-2 text-[10px] font-black transition ${
                  filter === item.id ? 'bg-[#002366] text-white' : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {subjects.length ? (
          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={`${subject.subject || 'subject'}-${subject.schoolName || ''}-${index}`}
                subject={subject}
                onOpen={() => onSelectSubject(subject)}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={<BookOpen size={18} />} title="لا توجد مواد مطابقة" subtitle="جرّب تغيير البحث أو التصفية" />
        )}
      </div>
    </GlassLayout>
  );
};
