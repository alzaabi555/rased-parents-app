import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Trophy,
  ThumbsUp,
  BookOpen,
  ChevronLeft,
  MessageSquare,
  MessagesSquare,
  SendHorizontal,
  X,
  Code,
  User,
  RefreshCw,
  HeartHandshake,
  Star,
  School,
  LayoutGrid,
  Bell,
  AlertTriangle,
  ClipboardList,
  History,
  Users,
  Trash2,
  Key,
  Sparkles,
  ShieldCheck,
  Gamepad2,
  CalendarCheck2,
  Lightbulb,
  MailCheck,
  Award,
  Clock3,
  CheckCheck,
  CircleDashed
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const GOOGLE_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec';

type TabId = 'home' | 'alerts' | 'profile';
type AlertTabId = 'all' | 'urgent';

type SavedProfile = {
  id: string;
  name: string;
};

type AnySubject = any;

type SummaryInsight = {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  tone: 'blue' | 'green' | 'amber' | 'rose' | 'slate';
};

type MasteryLevel = 'excellent' | 'good' | 'needs_review' | 'needs_followup' | string;

type LearningGameResult = {
  id?: string;
  gameType?: string;
  gameTitle?: string;
  gameName?: string;
  title?: string;
  subject?: string;
  unit?: string;
  lesson?: string;
  score?: number;
  scorePercent?: number;
  percentage?: number;
  total?: number;
  totalQuestions?: number;
  correct?: number;
  wrong?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  attemptNumber?: number;
  masteryLevel?: MasteryLevel;
  reviewRecommendation?: string;
  wrongDetails?: any[];
  playedAt?: string;
  savedAt?: string;
  createdAt?: string;
  date?: string;
};

type ParentLearningSummary = {
  totalActivities: number;
  averageScore: number;
  latestResult: LearningGameResult | null;
  needsReview: Array<{
    subject?: string;
    lesson?: string;
    count?: number;
    latestScore?: number;
    recommendation?: string;
  }>;
  strengths: Array<{
    subject?: string;
    lesson?: string;
    count?: number;
    latestScore?: number;
  }>;
  recommendation: string;
};

const toneClasses: Record<SummaryInsight['tone'], string> = {
  blue: 'bg-indigo-50 text-[#002366] border-indigo-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-100'
};

const safeList = <T,>(value: T[] | undefined | null): T[] => Array.isArray(value) ? value : [];

const getSubjectGameResults = (subject: AnySubject): LearningGameResult[] => {
  const candidates = [
    subject?.gameResults,
    subject?.games,
    subject?.educationalGames,
    subject?.studentGamesResults,
    subject?.gameResultsSummary?.results,
    subject?.learningSummary?.results
  ];
  const firstList = candidates.find(Array.isArray);
  return Array.isArray(firstList) ? firstList : [];
};

const getGameScorePercent = (game: LearningGameResult) => {
  const value = game?.scorePercent ?? game?.percentage ?? game?.score ?? 0;
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : 0;
};

const getGameTitle = (game: LearningGameResult) => {
  return game?.gameTitle || game?.gameName || game?.title || game?.gameType || 'نشاط تعليمي';
};

const getGameDate = (game: LearningGameResult) => {
  return game?.playedAt || game?.savedAt || game?.createdAt || game?.date || '';
};

const getMasteryArabic = (level?: MasteryLevel) => {
  switch (level) {
    case 'excellent': return 'ممتاز';
    case 'good': return 'جيد';
    case 'needs_review': return 'يحتاج مراجعة';
    case 'needs_followup': return 'يحتاج متابعة';
    default: return 'غير محدد';
  }
};

const getMasteryTone = (level?: MasteryLevel): SummaryInsight['tone'] => {
  switch (level) {
    case 'excellent': return 'green';
    case 'good': return 'blue';
    case 'needs_review': return 'amber';
    case 'needs_followup': return 'rose';
    default: return 'slate';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-OM', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ar-OM', { dateStyle: 'medium', timeStyle: 'short' });
};

const getLatestDate = (subjects: AnySubject[]) => {
  const dates: number[] = [];
  subjects.forEach(subject => {
    if (subject?.lastUpdate) {
      const time = new Date(subject.lastUpdate).getTime();
      if (!Number.isNaN(time)) dates.push(time);
    }
    safeList(subject?.behaviors).forEach((item: any) => {
      const time = new Date(item?.date).getTime();
      if (!Number.isNaN(time)) dates.push(time);
    });
    safeList(subject?.grades).forEach((item: any) => {
      const time = new Date(item?.date).getTime();
      if (!Number.isNaN(time)) dates.push(time);
    });
    getSubjectGameResults(subject).forEach((game: LearningGameResult) => {
      const time = new Date(getGameDate(game)).getTime();
      if (!Number.isNaN(time)) dates.push(time);
    });
  });
  if (!dates.length) return '';
  return new Date(Math.max(...dates)).toISOString();
};

const buildLearningSummaryFromSubjects = (subjects: AnySubject[]): ParentLearningSummary => {
  const cloudSummary = subjects
    .map(s => s?.gameResultsSummary || s?.learningSummary || s?.studentLearningSummary)
    .find(summary => summary && typeof summary === 'object');

  if (cloudSummary) {
    return {
      totalActivities: Number(cloudSummary.totalActivities || 0),
      averageScore: Number(cloudSummary.averageScore || 0),
      latestResult: cloudSummary.latestResult || null,
      needsReview: Array.isArray(cloudSummary.needsReview) ? cloudSummary.needsReview : [],
      strengths: Array.isArray(cloudSummary.strengths) ? cloudSummary.strengths : [],
      recommendation: cloudSummary.recommendation || 'تابع نتائج الألعاب التعليمية بصورة دورية.'
    };
  }

  const allGames: LearningGameResult[] = [];
  subjects.forEach(subject => {
    getSubjectGameResults(subject).forEach(game => {
      allGames.push({ ...game, subject: game.subject || subject.subject });
    });
  });

  allGames.sort((a, b) => new Date(getGameDate(b) || 0).getTime() - new Date(getGameDate(a) || 0).getTime());

  if (!allGames.length) {
    return {
      totalActivities: 0,
      averageScore: 0,
      latestResult: null,
      needsReview: [],
      strengths: [],
      recommendation: 'لا توجد نتائج ألعاب كافية حتى الآن. شجّع الطالب على تجربة تحديات اليوم.'
    };
  }

  const total = allGames.length;
  const averageScore = Math.round(allGames.reduce((sum, game) => sum + getGameScorePercent(game), 0) / total);
  const needsReviewMap = new Map<string, any>();
  const strengthsMap = new Map<string, any>();

  allGames.forEach(game => {
    const score = getGameScorePercent(game);
    const lesson = game.lesson || 'غير محدد';
    const subject = game.subject || 'عام';
    const key = `${subject}|${lesson}`;

    if (game.masteryLevel === 'needs_review' || game.masteryLevel === 'needs_followup' || score < 60) {
      const current = needsReviewMap.get(key) || { subject, lesson, count: 0, latestScore: score, recommendation: game.reviewRecommendation };
      current.count += 1;
      current.latestScore = score;
      current.recommendation = game.reviewRecommendation || current.recommendation;
      needsReviewMap.set(key, current);
    }

    if (game.masteryLevel === 'excellent' || score >= 90) {
      const current = strengthsMap.get(key) || { subject, lesson, count: 0, latestScore: score };
      current.count += 1;
      current.latestScore = score;
      strengthsMap.set(key, current);
    }
  });

  const needsReview = Array.from(needsReviewMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0));
  const strengths = Array.from(strengthsMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0));

  const recommendation = needsReview[0]?.recommendation ||
    (averageScore >= 90
      ? 'أداء ممتاز. يمكن تشجيع الطالب على تحديات أعلى أو أنشطة إثرائية.'
      : 'أداء الطالب جيد، ويُنصح بالاستمرار في التحديات التعليمية والمراجعة القصيرة.');

  return { totalActivities: total, averageScore, latestResult: allGames[0], needsReview, strengths, recommendation };
};


const isTeacherMessageToParent = (msg: any) => {
  return (
    msg?.sender === 'teacher' ||
    msg?.direction === 'teacher_to_parent' ||
    msg?.status === 'teacher_sent'
  );
};

const isParentMessageToTeacher = (msg: any) => !isTeacherMessageToParent(msg);

const getMessageTypeArabic = (type?: string) => {
  switch (type) {
    case 'behavior_alert': return 'تنبيه سلوكي';
    case 'performance_report': return 'تقرير أداء';
    case 'follow_up': return 'طلب متابعة';
    case 'praise': return 'إشادة';
    case 'homework': return 'تذكير بواجب';
    case 'reply': return 'رد من المعلم';
    default: return 'رسالة عامة';
  }
};

const getConversationMessagesSorted = (messages: any[] = []) => {
  return [...messages].sort((a, b) => {
    return new Date(a.date || a.replyDate || 0).getTime() - new Date(b.date || b.replyDate || 0).getTime();
  });
};

const buildParentSummary = (subjects: AnySubject[]) => {
  const totalPoints = subjects.reduce((sum, subject) => sum + Number(subject?.totalPoints || 0), 0);
  const positiveCount = subjects.reduce((sum, subject) => sum + safeList(subject?.behaviors).filter((b: any) => b?.type === 'positive').length, 0);
  const negativeCount = subjects.reduce((sum, subject) => sum + safeList(subject?.behaviors).filter((b: any) => b?.type === 'negative').length, 0);
  const gradesCount = subjects.reduce((sum, subject) => sum + safeList(subject?.grades).length, 0);
  const repliesCount = subjects.reduce((sum, subject) => {
    const teacherReplies = safeList(subject?.teacherReplies).length;
    const teacherMessages = safeList(subject?.parentMessages).filter((m: any) => isTeacherMessageToParent(m)).length;
    return sum + teacherReplies + teacherMessages;
  }, 0);
  const parentMessagesCount = subjects.reduce((sum, subject) => sum + safeList(subject?.parentMessages).length, 0);
  const gamesCount = subjects.reduce((sum, subject) => sum + getSubjectGameResults(subject).length, 0);
  const learningSummary = buildLearningSummaryFromSubjects(subjects);
  const latestUpdate = getLatestDate(subjects);

  const status = negativeCount === 0
    ? 'مطمئنة'
    : negativeCount <= 2
      ? 'تحتاج متابعة بسيطة'
      : 'تحتاج متابعة قريبة';

  const recommendation = negativeCount === 0 && positiveCount > 0
    ? 'الأداء العام مطمئن. عزّز إنجازات الطالب بكلمة تشجيع ومراجعة قصيرة للمادة الأقل نقاطًا.'
    : negativeCount > 0
      ? 'يوجد تنبيه يحتاج قراءة هادئة. ابدأ بمراجعة آخر ملاحظة ثم تواصل مع المعلم عند الحاجة.'
      : 'تابع التحديثات الجديدة واطلع على سجل الدرجات والمواد بصورة دورية.';

  return {
    totalPoints,
    positiveCount,
    negativeCount,
    gradesCount,
    repliesCount,
    parentMessagesCount,
    gamesCount,
    learningSummary,
    latestUpdate,
    status,
    recommendation
  };
};

const getLocalConversationKey = (rasedId: string, schoolName: string, subject: string) =>
  `rased_parent_conversation_${String(rasedId || '').trim().toUpperCase()}_${String(schoolName || '').trim()}_${String(subject || '').trim()}`;

const readLocalParentMessages = (rasedId: string, schoolName: string, subject: string) => {
  try {
    const list = JSON.parse(localStorage.getItem(getLocalConversationKey(rasedId, schoolName, subject)) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const saveLocalParentMessage = (rasedId: string, schoolName: string, subject: string, message: any) => {
  const current = readLocalParentMessages(rasedId, schoolName, subject);
  const next = [...current, message].slice(-50);
  localStorage.setItem(getLocalConversationKey(rasedId, schoolName, subject), JSON.stringify(next));
};

const mergeParentConversation = (cloudMessages: any[] = [], localMessages: any[] = []) => {
  const cloudList = Array.isArray(cloudMessages) ? cloudMessages : [];
  const localList = Array.isArray(localMessages) ? localMessages : [];
  const merged: any[] = [];

  cloudList.forEach(item => merged.push({ ...item, status: item.status || 'new', source: 'cloud' }));

  localList.forEach(localItem => {
    const localTime = new Date(localItem.date || 0).getTime();
    const hasCloudMatch = cloudList.some(cloudItem => {
      const cloudTime = new Date(cloudItem.date || 0).getTime();
      const sameMessage = String(cloudItem.message || '').trim() === String(localItem.message || '').trim();
      const nearTime = Math.abs(cloudTime - localTime) < 5 * 60 * 1000;
      return sameMessage && nearTime;
    });
    if (!hasCloudMatch) merged.push({ ...localItem, source: 'local' });
  });

  return merged.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
};

const GlassLayout: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, rightAction, showBack, onBack, children }) => (
  <div className="h-full w-full overflow-y-auto custom-scrollbar bg-transparent" dir="rtl">
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/70 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5 transition-all shadow-[0_4px_30px_rgba(0,35,102,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button onClick={onBack} className="p-2.5 bg-white/70 hover:bg-white shadow-sm border border-indigo-100 rounded-full text-[#002366] transition-all active:scale-95 shrink-0">
              <ArrowLeft size={20} />
            </button>
          )}
          {icon && !showBack && (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 shadow-inner flex items-center justify-center text-[#002366] shrink-0">
              {icon}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <h1 className="font-black text-xl text-[#002366] leading-tight truncate">{title}</h1>
            {subtitle && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#002366]/5 text-[#002366] border border-[#002366]/10 mt-1 inline-block w-fit truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {rightAction && <div className="shrink-0 flex items-center gap-2 pl-2">{rightAction}</div>}
      </div>
    </header>

    <main className="px-5 pt-6 pb-[130px]">{children}</main>
  </div>
);

const InsightCard: React.FC<SummaryInsight> = ({ label, value, hint, icon, tone }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/70">
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 mb-1">{label}</p>
        <h3 className="text-lg font-black text-slate-800 leading-none">{value}</h3>
        <p className="text-[9px] font-bold text-slate-400 mt-1 line-clamp-1">{hint}</p>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-3">
      {icon}
    </div>
    <p className="text-xs font-black text-slate-500">{title}</p>
    {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

const SubjectDetails: React.FC<{
  subjectData: any;
  onBack: () => void;
  onOpenMessage: () => void;
}> = ({ subjectData, onBack, onOpenMessage }) => {
  const s = subjectData;
  const allPos = safeList<any>(s.behaviors).filter((b: any) => b.type === 'positive');
  const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
  const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
  const neg = safeList<any>(s.behaviors).filter((b: any) => b.type === 'negative');
  const games = getSubjectGameResults(s);

  const subjectRecommendation = neg.length > 0
    ? 'توجد ملاحظة تحتاج متابعة. يُفضّل قراءة التنبيه ثم التواصل مع المعلم عند الحاجة.'
    : games.some(g => g.masteryLevel === 'needs_review' || g.masteryLevel === 'needs_followup')
      ? 'توجد نتائج ألعاب تشير إلى حاجة لمراجعة قصيرة في هذه المادة.'
      : displayPos.length > 0
        ? 'المادة تسير بشكل مطمئن. كلمة تشجيع للطالب ستزيد دافعيته.'
        : 'لا توجد ملاحظات كثيرة بعد. تابع نتائج الدرجات والإنجازات القادمة.';

  return (
    <div className="animate-in slide-in-from-left-8 fade-in duration-500 h-full">
      <GlassLayout
        title={s.subject}
        showBack={true}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm">
            <Trophy size={16} className="text-amber-600" />
            <span className="text-base font-black text-amber-600" dir="ltr">{s.totalPoints || 0}</span>
            <span className="text-[9px] font-bold text-amber-600/80 uppercase">نقطة</span>
          </div>
        }
      >
        <div className="space-y-5">
          <section className="bg-gradient-to-br from-white to-indigo-50/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/80 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-[#002366] shrink-0">
                <Lightbulb size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#002366] mb-1">توصية راصد لهذه المادة</h3>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">{subjectRecommendation}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <InsightCard label="إجمالي النقاط" value={s.totalPoints || 0} hint="نقاط رصدها المعلم" icon={<Trophy size={18} />} tone="blue" />
            <InsightCard label="أيام الانضباط" value={disciplineCount} hint="هدوء وانضباط" icon={<Star size={18} />} tone="amber" />
          </section>

          {games.length > 0 && (
            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1">
                <Gamepad2 size={18} className="text-[#002366]" /> إنجازات الألعاب التعليمية
              </h3>
              <div className="space-y-2">
                {games.slice(0, 5).map((game: LearningGameResult, i: number) => {
                  const masteryTone = getMasteryTone(game.masteryLevel);
                  return (
                    <div key={i} className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/70">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-700 line-clamp-1">{getGameTitle(game)}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                            {game.lesson || game.unit || s.lesson || 'نشاط مرتبط بالمادة'}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-[#002366] bg-white border border-indigo-100 px-2.5 py-1 rounded-xl shrink-0">
                          {getGameScorePercent(game)}%
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${toneClasses[masteryTone]}`}>
                          {getMasteryArabic(game.masteryLevel)}
                        </span>
                        {game.attemptNumber && (
                          <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                            محاولة {game.attemptNumber}
                          </span>
                        )}
                      </div>
                      {game.reviewRecommendation && (
                        <p className="text-[10px] font-bold text-slate-500 leading-5 mt-2 bg-white/70 border border-white rounded-xl p-2">
                          {game.reviewRecommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                <ThumbsUp size={18} className="text-emerald-500" /> إنجازات إيجابية
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 transition-all hover:bg-emerald-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <EmptyState icon={<ThumbsUp size={18} />} title="لا يوجد حالياً" />}
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                <AlertTriangle size={18} className="text-rose-500" /> تنبيهات وملاحظات
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {neg.length > 0 ? neg.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-rose-50/40 border border-rose-100 transition-all hover:bg-rose-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <EmptyState icon={<ShieldCheck size={18} />} title="لا توجد تنبيهات" subtitle="الوضع مطمئن في هذه المادة" />}
              </div>
            </section>
          </div>

          <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
              <ClipboardList size={18} className="text-[#002366]" /> سجل الدرجات
            </h3>
            <div className="rounded-2xl border border-indigo-50 overflow-hidden overflow-y-auto custom-scrollbar flex-1 bg-white/50">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 shadow-sm">
                  <tr className="text-slate-500 font-black text-[10px] uppercase border-b border-indigo-50">
                    <th className="py-3.5 px-4 text-right">الاختبار / الواجب</th>
                    <th className="py-3.5 px-4 text-center w-28">الدرجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50/50">
                  {safeList<any>(s.grades).map((g: any, i: number) => (
                    <tr key={i} className="hover:bg-white transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-700 text-xs">{g.category}</td>
                      <td className="py-3.5 px-4 text-center"><span className="text-sm font-black text-[#002366] bg-indigo-50/80 px-3 py-1 rounded-lg border border-indigo-100/50">{g.score}</span></td>
                    </tr>
                  ))}
                  {safeList(s.grades).length === 0 && (
                    <tr><td colSpan={2} className="py-8 text-center text-xs text-slate-400 font-bold">لم يتم رصد درجات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <button
            onClick={onOpenMessage}
            className="group relative w-full mt-2 overflow-hidden rounded-[1.7rem] bg-gradient-to-r from-[#002366] via-[#1e40af] to-[#2563eb] p-[1px] shadow-xl shadow-indigo-900/20 active:scale-[0.98] transition-all"
          >
            <div className="relative rounded-[1.65rem] bg-gradient-to-r from-[#002366] via-[#1e40af] to-[#2563eb] px-5 py-4 text-white">
              <div className="absolute inset-0 translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
                    <MessagesSquare size={21} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-black">صندوق رسائل المادة</span>
                    <span className="text-[10px] font-bold text-white/75">مراسلة المعلم ومتابعة الردود</span>
                  </span>
                </div>
                <span className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <ChevronLeft size={20} />
                </span>
              </div>
            </div>
          </button>
        </div>
      </GlassLayout>
    </div>
  );
};

function App() {
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [activeAlertTab, setActiveAlertTab] = useState<AlertTabId>('all');

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [localConversationTick, setLocalConversationTick] = useState(0);

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);

  const parentSummary = useMemo(() => buildParentSummary(allSubjects), [allSubjects]);

  const activeConversationItems = useMemo(() => {
    if (!selectedSubject) return [];
    const rasedId = String(secretCode || selectedSubject.rasedId || selectedSubject.parentCode || '').trim().toUpperCase();
    const schoolName = selectedSubject.schoolName || 'غير محدد';
    const subject = selectedSubject.subject || 'غير محدد';
    return mergeParentConversation(
      Array.isArray(selectedSubject.parentMessages) ? selectedSubject.parentMessages : [],
      readLocalParentMessages(rasedId, schoolName, subject)
    );
  }, [selectedSubject, secretCode, localConversationTick]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.requestPermissions();
      } else if ('Notification' in window) {
        Notification.requestPermission();
      }
    };
    requestPermissions();

    const loadedProfiles = JSON.parse(localStorage.getItem('rased_saved_profiles') || '[]');
    setSavedProfiles(Array.isArray(loadedProfiles) ? loadedProfiles : []);
  }, []);

  const triggerDeviceNotification = async (studentName: string, newGradesCount: number, newAlertsCount: number, newRepliesCount: number) => {
    let msg = `تحديثات للطالب ${studentName}: `;
    if (newGradesCount > 0) msg += `(${newGradesCount}) درجات. `;
    if (newAlertsCount > 0) msg += `(${newAlertsCount}) تنبيهات. `;
    if (newRepliesCount > 0) msg += `(${newRepliesCount}) رسائل.`;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{ id: Date.now(), title: 'راصد ولي الأمر 🔔', body: msg, schedule: { at: new Date(Date.now() + 1000) }, sound: 'beep.wav' }]
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('راصد ولي الأمر 🔔', { body: msg });
    }
  };

  const normalizeSubjectList = (result: any) => {
    const rawSubjects = Array.isArray(result.subjects)
      ? result.subjects
      : Array.isArray(result.data?.subjects)
        ? result.data.subjects
        : Array.isArray(result.data)
          ? result.data
          : [];

    const studentSummary = result.gameResultsSummary || result.learningSummary || result.data?.gameResultsSummary || result.data?.learningSummary;

    if (studentSummary && rawSubjects.length > 0) {
      return rawSubjects.map((subject: any, index: number) => index === 0
        ? { ...subject, gameResultsSummary: studentSummary }
        : subject
      );
    }

    return rawSubjects;
  };

  const fetchStudentData = async (id: string, isManualRefresh = false, isSilent = false) => {
    if (!id.trim()) {
      setError('الرجاء إدخال الكود السري للطالب.');
      return;
    }

    const sanitizedId = id.trim().toUpperCase();

    if (!isSilent) {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError('');
    }

    try {
      const cacheBuster = new Date().getTime();
      const response = await fetch(`${GOOGLE_WEB_APP_URL}?code=${sanitizedId}&t=${cacheBuster}`, {
        method: 'GET',
        redirect: 'follow'
      });
      const textData = await response.text();
      const result = JSON.parse(textData);

      if (result.status === 'success' || result.success === true) {
        const newSubjects = normalizeSubjectList(result);
        const cachedDataStr = localStorage.getItem(`rased_data_${sanitizedId}`);
        const studentName = newSubjects[0]?.name || 'طالب';

        if (cachedDataStr) {
          const oldSubjects = JSON.parse(cachedDataStr);
          let newGrades = 0;
          let newAlerts = 0;
          let newReplies = 0;

          newSubjects.forEach((newSub: any, idx: number) => {
            const oldSub = oldSubjects[idx];
            if (oldSub) {
              const oldG = oldSub.grades?.length || 0;
              const newG = newSub.grades?.length || 0;
              if (newG > oldG) newGrades += (newG - oldG);

              const oldB = oldSub.behaviors?.length || 0;
              const newB = newSub.behaviors?.length || 0;
              if (newB > oldB) newAlerts += (newB - oldB);

              const oldParentMessages = oldSub.parentMessages?.filter((m: any) => m.teacherReply)?.length || oldSub.teacherReplies?.length || 0;
              const newParentMessages = newSub.parentMessages?.filter((m: any) => m.teacherReply)?.length || newSub.teacherReplies?.length || 0;
              if (newParentMessages > oldParentMessages) newReplies += (newParentMessages - oldParentMessages);
            }
          });

          if (newGrades > 0 || newAlerts > 0 || newReplies > 0) {
            triggerDeviceNotification(studentName, newGrades, newAlerts, newReplies);
          }
        }

        const currentProfiles = JSON.parse(localStorage.getItem('rased_saved_profiles') || '[]');
        if (!currentProfiles.find((p: any) => p.id === sanitizedId)) {
          const updatedProfiles = [...currentProfiles, { id: sanitizedId, name: studentName }];
          localStorage.setItem('rased_saved_profiles', JSON.stringify(updatedProfiles));
          setSavedProfiles(updatedProfiles);
        }

        localStorage.setItem(`rased_data_${sanitizedId}`, JSON.stringify(newSubjects));
        setAllSubjects(newSubjects);

        if (selectedSubject) {
          const updatedSelected = newSubjects.find((s: any) => s.subject === selectedSubject.subject && s.schoolName === selectedSubject.schoolName);
          if (updatedSelected) setSelectedSubject(updatedSelected);
        }

        localStorage.setItem('rased_parent_secret_code', sanitizedId);
        setSecretCode(sanitizedId);

        if (!isManualRefresh && !isSilent) {
          setShowWelcomeScreen(true);
          setTimeout(() => setShowWelcomeScreen(false), 2200);
        }
      } else if (!isSilent) {
        setError('لم يتم العثور على بيانات، تأكد من صحة كود راصد السري.');
      }
    } catch (err) {
      if (!isSilent) setError('خطأ في الاتصال بالسحابة.');
    } finally {
      if (!isSilent) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const savedID = localStorage.getItem('rased_parent_secret_code');
    if (savedID) {
      setSecretCode(savedID);
      fetchStudentData(savedID);
      const silentInterval = setInterval(() => fetchStudentData(savedID, false, true), 60000);
      return () => clearInterval(silentInterval);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudentData(secretCode);
  };

  const handleLogout = () => {
    localStorage.removeItem('rased_parent_secret_code');
    setAllSubjects([]);
    setSelectedSubject(null);
    setSecretCode('');
    setCurrentTab('home');
  };

  const removeSavedProfile = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter(p => p.id !== idToRemove);
    setSavedProfiles(updated);
    localStorage.setItem('rased_saved_profiles', JSON.stringify(updated));
    if (secretCode === idToRemove) setSecretCode('');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedSubject) return;
    setIsSendingMsg(true);

    const rasedId = String(secretCode || selectedSubject.rasedId || selectedSubject.parentCode || '').trim().toUpperCase();
    const schoolName = selectedSubject.schoolName || 'غير محدد';
    const subject = selectedSubject.subject || 'غير محدد';
    const text = messageText.trim();
    const now = new Date().toISOString();

    const localMessage = {
      localId: `local_${Date.now()}`,
      date: now,
      rasedId,
      civilID: rasedId,
      parentCode: rasedId,
      studentName: selectedSubject.name,
      schoolName,
      subject,
      message: text,
      status: 'pending',
      teacherReply: '',
      replyDate: '',
      teacherName: '',
      sender: 'parent',
      direction: 'parent_to_teacher',
      messageType: 'general'
    };

    saveLocalParentMessage(rasedId, schoolName, subject, localMessage);
    setLocalConversationTick(prev => prev + 1);

    const payload = {
      action: 'sendMessage',
      civilID: rasedId,
      rasedId,
      parentCode: rasedId,
      studentName: selectedSubject.name,
      schoolName,
      subject,
      message: text,
      sender: 'parent',
      direction: 'parent_to_teacher',
      messageType: 'general'
    };

    try {
      const response = await fetch(GOOGLE_WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success' || result.success === true) {
        setMessageText('');
        fetchStudentData(secretCode, false, true);
      } else {
        alert(result.message || 'تعذر إرسال الرسالة.');
      }
    } catch (error) {
      alert('تم حفظ الرسالة محليًا، لكن تعذر إرسالها للسحابة الآن.');
    } finally {
      setIsSendingMsg(false);
    }
  };

  if (!allSubjects.length && !showWelcomeScreen) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center font-sans overflow-hidden relative px-6 bg-[#f0f4f8]" dir="rtl">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[50%] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />

        <main className="w-full max-w-md relative z-10 flex flex-col items-center max-h-screen overflow-y-auto custom-scrollbar py-10">
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shrink-0">
            <div className="inline-flex items-center justify-center p-5 rounded-[2rem] bg-white/80 backdrop-blur-xl mb-6 shadow-xl border border-white/70 text-[#002366]">
              <School className="w-12 h-12" />
            </div>
            <h1 className="text-5xl font-black text-[#002366] tracking-tight mb-2">راصد</h1>
            <p className="text-slate-500 font-black tracking-wide text-sm">بوابة ولي الأمر</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2">هوية موحدة لعائلة راصد</p>
          </div>

          <div className="w-full flex flex-col gap-6">
            {savedProfiles.length > 0 && (
              <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl border border-white/70 animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-sm font-black text-[#002366] mb-4 text-center flex items-center justify-center gap-2">
                  <Users size={16} className="text-[#002366]" /> الدخول السريع للأبناء
                </h2>
                <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  {savedProfiles.map(profile => (
                    <div
                      key={profile.id}
                      onClick={() => fetchStudentData(profile.id)}
                      className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-95 group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#002366] border border-indigo-100 shadow-inner group-hover:scale-110 transition-transform">
                          <User size={18} />
                        </div>
                        <div className="text-right">
                          <p className="text-slate-800 text-sm font-black line-clamp-1">{profile.name}</p>
                          <p className="text-slate-400 text-[10px] font-mono mt-0.5" dir="ltr">{profile.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => removeSavedProfile(profile.id, e)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="حذف الحساب"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full bg-white/85 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/70">
              <div className="text-center mb-6">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-[#002366] mb-3">
                  <Key size={22} />
                </div>
                <h2 className="text-xl font-black text-[#002366]">
                  {savedProfiles.length > 0 ? 'إضافة ابن جديد' : 'تسجيل الدخول'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">أدخل كود راصد السري المستلم من المدرسة</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 px-1 text-right">كود راصد السري</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#002366] z-10"><Key className="w-6 h-6" /></div>
                    <input
                      type="text"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                      className="block w-full pr-14 pl-4 py-4 bg-slate-50 border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 text-[#002366] font-black text-lg outline-none text-left placeholder:text-slate-300 uppercase"
                      placeholder="مثال: RSD-A7X9"
                      required
                      dir="ltr"
                    />
                  </div>
                  {error && <p className="text-rose-500 text-xs font-bold text-center mt-2 animate-in fade-in">{error}</p>}
                </div>
                <button type="submit" disabled={!secretCode || isLoading} className="w-full bg-[#002366] text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin" /> : <><span>دخول آمن</span><ArrowLeft className="w-5 h-5" /></>}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showWelcomeScreen && allSubjects.length > 0) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#f0f4f8] p-6 text-center animate-in fade-in duration-500" dir="rtl">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="bg-white/80 border border-white/70 p-6 rounded-full mb-8 shadow-xl animate-pulse text-[#002366]"><HeartHandshake size={72} /></div>
        <h1 className="text-3xl font-black text-[#002366] mb-4">أهلاً بك في راصد!</h1>
        <p className="text-slate-600 text-lg font-bold">{allSubjects[0].name}</p>
      </div>
    );
  }

  const renderDashboard = () => {
    const insights: SummaryInsight[] = [
      { label: 'حالة اليوم', value: parentSummary.status, hint: 'قراءة عامة للمتابعة', icon: <ShieldCheck size={18} />, tone: parentSummary.negativeCount > 2 ? 'rose' : parentSummary.negativeCount > 0 ? 'amber' : 'green' },
      { label: 'إجمالي النقاط', value: parentSummary.totalPoints, hint: 'من جميع المواد', icon: <Trophy size={18} />, tone: 'blue' },
      {
        label: 'متوسط الألعاب',
        value: `${parentSummary.learningSummary.averageScore || 0}%`,
        hint: `${parentSummary.learningSummary.totalActivities || 0} نشاط تعليمي`,
        icon: <Gamepad2 size={18} />,
        tone: parentSummary.learningSummary.averageScore >= 75 ? 'green' : parentSummary.learningSummary.averageScore >= 50 ? 'amber' : 'rose'
      },
      {
        label: 'تحتاج مراجعة',
        value: parentSummary.learningSummary.needsReview?.length || 0,
        hint: 'دروس مقترحة للمتابعة',
        icon: <BookOpen size={18} />,
        tone: parentSummary.learningSummary.needsReview?.length ? 'amber' : 'green'
      },
      { label: 'الإنجازات', value: parentSummary.positiveCount, hint: 'ملاحظات إيجابية', icon: <Award size={18} />, tone: 'green' },
      { label: 'التنبيهات', value: parentSummary.negativeCount, hint: 'تحتاج قراءة', icon: <AlertTriangle size={18} />, tone: parentSummary.negativeCount > 0 ? 'rose' : 'slate' }
    ];

    return (
      <div className="animate-in fade-in duration-500 h-full">
        <GlassLayout
          title={allSubjects[0]?.name || 'الطالب'}
          subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
          icon={<User size={24} />}
          rightAction={
            <button onClick={() => fetchStudentData(secretCode, true)} disabled={isRefreshing} className="p-2.5 rounded-xl bg-white/70 border border-indigo-100 text-[#002366] active:scale-95 shadow-sm hover:bg-white transition-colors">
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          }
        >
          <div className="space-y-5">
            <section className="bg-gradient-to-br from-white to-indigo-50/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/80">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#002366] flex items-center justify-center border border-indigo-100 shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 mb-1">ملخص راصد لولي الأمر</p>
                  <h2 className="text-lg font-black text-[#002366] mb-1">حالة الطالب: {parentSummary.status}</h2>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{parentSummary.recommendation}</p>
                  {parentSummary.latestUpdate && (
                    <p className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1"><Clock3 size={12} /> آخر تحديث: {formatDate(parentSummary.latestUpdate)}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/70">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                  <Lightbulb size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-400 mb-1">كيف أساعد ابني؟</p>
                  <h2 className="text-base font-black text-slate-800 mb-1">
                    {parentSummary.learningSummary.needsReview?.[0]
                      ? `راجع ${parentSummary.learningSummary.needsReview[0].lesson || 'الدرس المحدد'}`
                      : 'متابعة تعليمية مطمئنة'}
                  </h2>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {parentSummary.learningSummary.recommendation}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {insights.map(item => <InsightCard key={item.label} {...item} />)}
            </section>

            {(parentSummary.repliesCount > 0 || parentSummary.gradesCount > 0 || parentSummary.gamesCount > 0 || parentSummary.parentMessagesCount > 0) && (
              <section className="grid grid-cols-3 gap-3">
                <InsightCard label="الدرجات" value={parentSummary.gradesCount} hint="تحديثات مرصودة" icon={<ClipboardList size={18} />} tone="blue" />
                <InsightCard label="الرسائل" value={parentSummary.parentMessagesCount || parentSummary.repliesCount} hint="استفسارات وردود" icon={<MailCheck size={18} />} tone="green" />
                <InsightCard label="الألعاب" value={parentSummary.gamesCount || parentSummary.learningSummary.totalActivities} hint="أنشطة تعليمية" icon={<Gamepad2 size={18} />} tone="amber" />
              </section>
            )}

            <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/70">
              <h2 className="text-sm font-black text-[#002366] flex items-center gap-2 mb-4 px-1">
                <BookOpen size={18} className="text-[#002366]" /> المواد الدراسية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allSubjects.map((sub, idx) => {
                  const positive = safeList<any>(sub.behaviors).filter((b: any) => b.type === 'positive').length;
                  const negative = safeList<any>(sub.behaviors).filter((b: any) => b.type === 'negative').length;
                  const gameCount = getSubjectGameResults(sub).length;
                  const messageCount = safeList<any>(sub.parentMessages).length;
                  const subjectGames = getSubjectGameResults(sub);
                  const latestGameScore = subjectGames.length ? getGameScorePercent(subjectGames[0]) : 0;
                  const progress = latestGameScore || Math.min(100, Math.max(8, (Number(sub.totalPoints || 0) + 40)));
                  return (
                    <div key={idx} onClick={() => setSelectedSubject(sub)} className="bg-white/85 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/70 hover:border-indigo-200 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-[#002366] border border-indigo-100/50"><BookOpen size={20} /></div>
                          <div>
                            <h3 className="text-base font-black text-slate-800">{sub.subject}</h3>
                            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 mt-0.5"><History size={10} /> {formatDate(sub.lastUpdate)}</p>
                          </div>
                        </div>
                        <ChevronLeft size={20} className="text-indigo-200" />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">+{positive} إيجابي</span>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${negative > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{negative} تنبيه</span>
                        {messageCount > 0 && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-indigo-50 text-[#002366] border border-indigo-100">{messageCount} رسالة</span>}
                        {gameCount > 0 && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">{gameCount} لعبة</span>}
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-indigo-50 rounded-full overflow-hidden border border-indigo-100/30">
                          <div className="h-full bg-[#002366] rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-[#002366]">{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </GlassLayout>
      </div>
    );
  };

  const renderNotifications = () => {
    let alerts: any[] = [];
    allSubjects.forEach(sub => {
      safeList<any>(sub.behaviors).filter((b: any) => b.type === 'negative').forEach((b: any) => alerts.push({ ...b, subject: sub.subject, kind: 'alert' }));
      safeList<any>(sub.grades).forEach((g: any) => alerts.push({ ...g, subject: sub.subject, kind: 'grade' }));
      safeList<any>(sub.parentMessages).forEach((m: any) => {
        if (isTeacherMessageToParent(m)) {
          alerts.push({
            ...m,
            description: m.message || 'رسالة من المعلم',
            subject: sub.subject,
            kind: 'teacher_message',
            date: m.date,
            title: getMessageTypeArabic(m.messageType)
          });
        } else if (m.teacherReply) {
          alerts.push({
            ...m,
            description: `رد المعلم: ${m.teacherReply}`,
            subject: sub.subject,
            kind: 'reply',
            date: m.replyDate || m.date,
            title: 'رد المعلم'
          });
        }
      });
      getSubjectGameResults(sub).forEach((g: LearningGameResult) => alerts.push({
        ...g,
        description: `${getGameTitle(g)} - النتيجة ${getGameScorePercent(g)}%${g.reviewRecommendation ? ` — ${g.reviewRecommendation}` : ''}`,
        subject: g.subject || sub.subject,
        kind: 'game',
        date: getGameDate(g)
      }));
    });
    alerts.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

    return (
      <div className="animate-in fade-in duration-500 h-full">
        <GlassLayout title="الإشعارات" icon={<Bell size={24} />}>
          <div className="flex p-1 bg-white/70 backdrop-blur-md border border-white/80 rounded-xl mb-6 shadow-sm">
            <button onClick={() => setActiveAlertTab('all')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${activeAlertTab === 'all' ? 'bg-[#002366] text-white shadow-md' : 'text-slate-500 hover:text-[#002366]'}`}>الكل</button>
            <button onClick={() => setActiveAlertTab('urgent')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${activeAlertTab === 'urgent' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-rose-500'}`}>تنبيهات</button>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 transition-all hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${item.kind === 'alert' ? 'bg-rose-50 text-rose-500 border-rose-100' : item.kind === 'reply' || item.kind === 'teacher_message' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : item.kind === 'game' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-[#002366] border-indigo-100'}`}>
                    {item.kind === 'alert' ? <AlertTriangle size={20} /> : item.kind === 'reply' || item.kind === 'teacher_message' ? <MessageSquare size={20} /> : item.kind === 'game' ? <Gamepad2 size={20} /> : <ClipboardList size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.kind === 'alert' ? 'bg-rose-100 text-rose-600' : item.kind === 'reply' || item.kind === 'teacher_message' ? 'bg-emerald-100 text-emerald-600' : item.kind === 'game' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-[#002366]'} truncate`}>{item.subject}</span>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{formatDate(item.date || item.createdAt)}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-800">{item.kind === 'alert' ? 'تنبيه سلوكي' : item.kind === 'reply' ? 'رد من المعلم' : item.kind === 'teacher_message' ? (item.title || 'رسالة من المعلم') : item.kind === 'game' ? 'إنجاز تعليمي' : 'تحديث درجة'}</h3>
                    <p className="text-xs text-slate-500 font-bold leading-snug">{item.description || `تم رصد درجة: ${item.category} (${item.score})`}</p>
                  </div>
                </div>
              </div>
            ))}
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').length === 0 && (
              <EmptyState icon={<Bell size={18} />} title="لا توجد إشعارات" subtitle="ستظهر هنا التحديثات الجديدة" />
            )}
          </div>
        </GlassLayout>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="animate-in fade-in duration-500 h-full">
      <GlassLayout title="حسابي" icon={<User size={24} />}>
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/60 text-center mb-6">
          <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[2rem] mx-auto flex items-center justify-center text-[#002366] mb-4 shadow-inner"><User size={40} /></div>
          <h3 className="text-xl font-black text-slate-800 mb-1">ولي أمر الطالب</h3>
          <p className="text-[#002366] text-sm font-bold bg-indigo-50/50 py-2 px-6 rounded-xl border border-indigo-100/50 inline-block mt-2">{allSubjects[0]?.name}</p>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400">الكود السري المربوط: </span>
            <span className="text-xs font-mono font-black text-[#002366] bg-slate-100 px-2 py-1 rounded-md" dir="ltr">{secretCode}</span>
          </div>
        </div>
        <section className="grid grid-cols-2 gap-3 mb-6">
          <InsightCard label="الأبناء المحفوظون" value={savedProfiles.length} hint="دخول سريع" icon={<Users size={18} />} tone="blue" />
          <InsightCard label="آخر تحديث" value={parentSummary.latestUpdate ? formatDate(parentSummary.latestUpdate) : 'غير محدد'} hint="بيانات الطالب" icon={<CalendarCheck2 size={18} />} tone="green" />
        </section>
        <button onClick={handleLogout} className="w-full bg-rose-50/80 hover:bg-rose-100 border border-rose-100 text-rose-600 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"><LogOut size={20} /> تسجيل الخروج</button>
        <div className="mt-12 text-center opacity-50">
          <p className="text-slate-500 text-[10px] font-bold mb-1">برمجة وتطوير</p>
          <div className="flex items-center justify-center gap-1.5"><Code size={12} className="text-[#002366]" /><span className="text-[#002366] text-[11px] font-black tracking-widest uppercase">ALZAABI MOHAMMAD</span></div>
        </div>
      </GlassLayout>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-[#f0f4f8] font-sans text-slate-800" dir="rtl">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[50%] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="absolute inset-0 z-10">
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : <SubjectDetails subjectData={selectedSubject} onBack={() => setSelectedSubject(null)} onOpenMessage={() => setIsMessageOpen(true)} />)}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      <nav className="absolute bottom-0 left-0 right-0 z-[90] flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 bg-white/70 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,35,102,0.06)] border-t border-white/70 transition-all">
        <button onClick={() => { setCurrentTab('home'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'home' ? 'text-[#002366] scale-110 -translate-y-1' : 'text-slate-400 hover:text-indigo-400'}`}>
          <LayoutGrid size={22} className={currentTab === 'home' ? 'fill-indigo-50/50' : ''} /><span className="text-[9px] font-black mt-1">الرئيسية</span>
        </button>
        <button onClick={() => { setCurrentTab('alerts'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 relative ${currentTab === 'alerts' ? 'text-[#002366] scale-110 -translate-y-1' : 'text-slate-400 hover:text-indigo-400'}`}>
          <Bell size={22} className={currentTab === 'alerts' ? 'fill-indigo-50/50' : ''} />{parentSummary.negativeCount > 0 && <span className="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white" />}<span className="text-[9px] font-black mt-1">إشعارات</span>
        </button>
        <button onClick={() => { setCurrentTab('profile'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'profile' ? 'text-[#002366] scale-110 -translate-y-1' : 'text-slate-400 hover:text-indigo-400'}`}>
          <User size={22} className={currentTab === 'profile' ? 'fill-indigo-50/50' : ''} /><span className="text-[9px] font-black mt-1">حسابي</span>
        </button>
      </nav>

      {isMessageOpen && selectedSubject && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white/95 backdrop-blur-xl w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 sm:zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-black text-[#002366] flex items-center gap-2 text-lg"><MessagesSquare size={22} /> صندوق رسائل المادة</h3>
              <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-indigo-50 text-indigo-400 rounded-full hover:bg-indigo-100 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-3 pr-1">
              <p className="text-[10px] font-bold text-slate-400 text-center mb-2">
                صندوق رسائل مادة {selectedSubject.subject}
              </p>

              {activeConversationItems.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد رسائل سابقة. اكتب استفسارك وسيظهر هنا محفوظًا مع رد المعلم.
                </div>
              ) : (
                getConversationMessagesSorted(activeConversationItems).map((item: any, idx: number) => {
                  const fromTeacher = isTeacherMessageToParent(item);
                  const messageTypeLabel = getMessageTypeArabic(item.messageType);

                  return (
                    <div key={item.rowNumber || item.localId || idx} className="space-y-2">
                      <div
                        className={`border p-4 rounded-2xl shadow-sm ${
                          fromTeacher
                            ? 'mr-6 bg-emerald-50/90 border-emerald-100 rounded-tl-sm'
                            : 'bg-white border-indigo-100 rounded-tr-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <span
                            className={`text-xs font-black flex items-center gap-1 ${
                              fromTeacher ? 'text-emerald-700' : 'text-[#002366]'
                            }`}
                          >
                            {fromTeacher ? <MailCheck size={14} /> : <MessagesSquare size={14} />}
                            {fromTeacher ? `رسالة من المعلم - ${messageTypeLabel}` : 'رسالتك للمعلم'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded-md shrink-0">
                            {formatDateTime(item.date)}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.message}</p>

                        {fromTeacher && item.teacherName && (
                          <p className="mt-2 text-[10px] font-black text-emerald-700 bg-white/70 border border-emerald-100 px-2 py-1 rounded-lg inline-flex">
                            المعلم: {item.teacherName}
                          </p>
                        )}

                        {!fromTeacher && (
                          <div className="mt-2 flex justify-end">
                            {item.status === 'replied' || item.teacherReply ? (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CheckCheck size={12} /> تم الرد
                              </span>
                            ) : item.status === 'pending' ? (
                              <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CircleDashed size={12} /> محفوظ محليًا
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CircleDashed size={12} /> بانتظار الرد
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!fromTeacher && item.teacherReply && (
                        <div className="mr-6 bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <span className="text-xs font-black text-[#002366]">{item.teacherName || 'المعلم'}</span>
                            <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md shrink-0">
                              {formatDateTime(item.replyDate)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.teacherReply}</p>
                        </div>
                      )}
                    </div>
                  );
                })              )}
            </div>

            <div className="shrink-0 pt-3 border-t border-indigo-50">
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="اكتب استفسارك هنا..." className="w-full h-24 bg-white/50 border border-indigo-100 rounded-[1.5rem] p-4 text-sm font-bold resize-none outline-none focus:border-[#002366] focus:bg-white mb-3 transition-all text-slate-800 placeholder:text-indigo-200" />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSendingMsg}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#002366] via-[#1e40af] to-[#2563eb] text-white py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-indigo-900/20 group"
              >
                <span className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                {isSendingMsg ? (
                  <Loader2 className="animate-spin relative z-10" />
                ) : (
                  <>
                    <span className="relative z-10">إرسال الاستفسار</span>
                    <span className="relative z-10 w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
                      <SendHorizontal size={18} />
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
