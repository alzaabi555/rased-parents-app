import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { EmptyState } from '../../EmptyState';
import { formatDate, getGameDate, getGameScorePercent, getGameTitle } from '../../../utils/parentViewUtils';
import type { LearningGameResult } from '../../../types/learning';

export const SubjectGamesTab: React.FC<{ games: LearningGameResult[] }> = ({ games }) => {
  if (!games.length) return <EmptyState icon={<Gamepad2 size={18} />} title="لا توجد نتائج ألعاب" subtitle="ستظهر نتائج الألعاب التعليمية هنا" />;
  return <div className="space-y-3">{games.map((game, index) => <div key={game.id || index} className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-slate-800">{getGameTitle(game)}</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{game.lesson || game.unit || 'نشاط تعليمي'} • {formatDate(getGameDate(game))}</p></div><span className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">{getGameScorePercent(game)}%</span></div>{game.reviewRecommendation && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-600">{game.reviewRecommendation}</p>}</div>)}</div>;
};
