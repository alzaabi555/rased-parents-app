import type { AnySubject } from '../types/subject';
import type { LearningGameResult, MasteryLevel, ParentLearningSummary, SummaryInsight } from '../types/learning';
import { toneClasses } from '../constants/toneClasses';

export const safeList = <T,>(value: T[] | undefined | null): T[] => Array.isArray(value) ? value : [];

export const getSubjectGameResults = (subject: AnySubject): LearningGameResult[] => {
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

export const getGameScorePercent = (game: LearningGameResult) => {
  const value = game?.scorePercent ?? game?.percentage ?? game?.score ?? 0;
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : 0;
};

export const getGameTitle = (game: LearningGameResult) => {
  return game?.gameTitle || game?.gameName || game?.title || game?.gameType || 'نشاط تعليمي';
};

export const getGameDate = (game: LearningGameResult) => {
  return game?.playedAt || game?.savedAt || game?.createdAt || game?.date || '';
};

export const getMasteryArabic = (level?: MasteryLevel) => {
  switch (level) {
    case 'excellent': return 'ممتاز';
    case 'good': return 'جيد';
    case 'needs_review': return 'يحتاج مراجعة';
    case 'needs_followup': return 'يحتاج متابعة';
    default: return 'غير محدد';
  }
};

export const getMasteryTone = (level?: MasteryLevel): SummaryInsight['tone'] => {
  switch (level) {
    case 'excellent': return 'green';
    case 'good': return 'blue';
    case 'needs_review': return 'amber';
    case 'needs_followup': return 'rose';
    default: return 'slate';
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-OM', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ar-OM', { dateStyle: 'medium', timeStyle: 'short' });
};

export const getLatestDate = (subjects: AnySubject[]) => {
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

export const buildLearningSummaryFromSubjects = (subjects: AnySubject[]): ParentLearningSummary => {
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


export const isTeacherMessageToParent = (msg: any) => {
  return (
    msg?.sender === 'teacher' ||
    msg?.direction === 'teacher_to_parent' ||
    msg?.status === 'teacher_sent'
  );
};

export const getMessageTypeArabic = (type?: string) => {
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

export const getConversationMessagesSorted = (messages: any[] = []) => {
  return [...messages].sort((a, b) => {
    return new Date(a.date || a.replyDate || 0).getTime() - new Date(b.date || b.replyDate || 0).getTime();
  });
};
export const isMeaningfulCloudValue = (value: unknown) => {
  const normalized = String(value || '').trim();
  return Boolean(normalized && normalized !== 'غير محدد' && normalized !== 'undefined' && normalized !== 'null');
};
export const firstMeaningfulCloudValue = (...values: unknown[]) => {
  const found = values.find(isMeaningfulCloudValue);
  return found ? String(found).trim() : '';
};
export const resolveParentMessageContext = (selectedSubject: any, relatedTeacherMessage?: any) => ({
  schoolName: firstMeaningfulCloudValue(
    relatedTeacherMessage?.schoolName,
    selectedSubject?.schoolName
  ),
  subject: firstMeaningfulCloudValue(
    relatedTeacherMessage?.subject,
    selectedSubject?.subject
  ),
  className: firstMeaningfulCloudValue(
    relatedTeacherMessage?.className,
    selectedSubject?.className
  ),
  grade: firstMeaningfulCloudValue(
    relatedTeacherMessage?.grade,
    selectedSubject?.grade
  ),
  semester: firstMeaningfulCloudValue(
    relatedTeacherMessage?.semester,
    selectedSubject?.semester
  )
});

export const buildParentSummary = (subjects: AnySubject[]) => {
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

export const getLocalConversationKey = (rasedId: string, schoolName: string, subject: string) =>
  `rased_parent_conversation_${String(rasedId || '').trim().toUpperCase()}_${String(schoolName || '').trim()}_${String(subject || '').trim()}`;

export const readLocalParentMessages = (rasedId: string, schoolName: string, subject: string) => {
  try {
    const list = JSON.parse(localStorage.getItem(getLocalConversationKey(rasedId, schoolName, subject)) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const saveLocalParentMessage = (rasedId: string, schoolName: string, subject: string, message: any) => {
  const current = readLocalParentMessages(rasedId, schoolName, subject);
  const next = [...current, message].slice(-50);
  localStorage.setItem(getLocalConversationKey(rasedId, schoolName, subject), JSON.stringify(next));
};

export const mergeParentConversation = (cloudMessages: any[] = [], localMessages: any[] = []) => {
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

