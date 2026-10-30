import React, { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  LogOut,
  Trophy,
  BookOpen,
  ChevronLeft,
  MessageSquare,
  MessagesSquare,
  SendHorizontal,
  X,
  Code,
  User,
  RefreshCw,
  Bell,
  AlertTriangle,
  ClipboardList,
  History,
  Users,
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


import type { TabId, AlertTabId, SavedProfile } from './types/parent';
import type { LearningGameResult, SummaryInsight } from './types/learning';
import { GlassLayout } from './components/GlassLayout';
import { SubjectDetails } from './components/SubjectDetails';
import { InsightCard } from './components/InsightCard';
import { EmptyState } from './components/EmptyState';
import { ParentLogin } from './components/ParentLogin';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentAlerts } from './components/ParentAlerts';
import { ParentProfile } from './components/ParentProfile';
import { formatDate, formatDateTime, buildParentSummary, isTeacherMessageToParent, getMessageTypeArabic, getConversationMessagesSorted, resolveParentMessageContext, readLocalParentMessages, saveLocalParentMessage, mergeParentConversation, safeList, getSubjectGameResults, getGameScorePercent, getGameTitle, getGameDate } from './utils/parentViewUtils';
import { fetchParentStudent } from './services/parentApi';
import { getOrCreateParentAccountId, linkParentStudent } from './services/parentAccountService';
import { getSavedProfiles, setSavedProfiles as persistSavedProfiles, upsertSavedProfile, readStudentCache, saveStudentCache, getSavedSessionCode, saveSessionCode, clearSessionCode } from './services/parentStorageService';
import { requestParentNotificationPermissions, notifyParentUpdates } from './services/parentNotificationService';
import { sendParentMessage, sendParentReply } from './services/parentMessageService';

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
  const [replyingToTeacherMessage, setReplyingToTeacherMessage] = useState<any>(null);
  const [teacherReplyText, setTeacherReplyText] = useState('');
  const [isSendingTeacherReply, setIsSendingTeacherReply] = useState(false);
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
    requestParentNotificationPermissions().catch(error => console.warn('Notification permission:', error));
    setSavedProfiles(getSavedProfiles());
  }, []);

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
      const result = await fetchParentStudent(sanitizedId);

      if (result.status === 'success' || result.success === true) {
        const newSubjects = normalizeSubjectList(result);
        const oldSubjects = readStudentCache(sanitizedId);
        const studentName = newSubjects[0]?.name || 'طالب';

        if (oldSubjects.length > 0) {
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
            notifyParentUpdates(studentName, newGrades, newAlerts, newReplies).catch(error => console.warn('Notification failed:', error));
          }
        }

        const identity = result?.identity || newSubjects?.[0] || {};
        const centralStudentId = String(identity?.centralStudentId || '').trim();
        const centralRasedId = String(identity?.centralRasedId || '').trim();
        const legacyRasedIds = Array.isArray(identity?.legacyRasedIds) ? identity.legacyRasedIds : [];
        const parentAccountId = getOrCreateParentAccountId();

        // Link only centrally resolved students. The experimental profile remains local and compatible.
        if (centralStudentId) {
          try {
            await linkParentStudent(centralStudentId, studentName);
          } catch (linkError) {
            console.warn('ParentStudentLink pending:', linkError);
          }
        }

        const currentProfiles = getSavedProfiles();
        const canonicalProfileId = centralStudentId || sanitizedId;
        const nextProfile: SavedProfile = {
          id: canonicalProfileId,
          name: studentName,
          centralStudentId: centralStudentId || undefined,
          currentRasedId: centralRasedId || sanitizedId,
          centralRasedId: centralRasedId || undefined,
          legacyRasedIds,
          identityStatus: String(identity?.identityStatus || (centralStudentId ? 'central_linked' : 'experimental_unlinked')),
          parentAccountId,
        };
        const updatedProfiles = upsertSavedProfile(currentProfiles, nextProfile, sanitizedId);
        setSavedProfiles(updatedProfiles);

        saveStudentCache(sanitizedId, identity, newSubjects);
        setAllSubjects(newSubjects);

        if (selectedSubject) {
          const updatedSelected = newSubjects.find((s: any) => s.subject === selectedSubject.subject && s.schoolName === selectedSubject.schoolName);
          if (updatedSelected) setSelectedSubject(updatedSelected);
        }

        saveSessionCode(sanitizedId);
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
    const savedID = getSavedSessionCode();
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
    clearSessionCode();
    setAllSubjects([]);
    setSelectedSubject(null);
    setSecretCode('');
    setCurrentTab('home');
  };

  const removeSavedProfile = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter(p => p.id !== idToRemove && p.centralStudentId !== idToRemove && p.currentRasedId !== idToRemove);
    setSavedProfiles(updated);
    persistSavedProfiles(updated);
    if (secretCode === idToRemove) setSecretCode('');
  };

  const handleSendReplyToTeacherMessage = async () => {
    if (!teacherReplyText.trim() || !selectedSubject || !replyingToTeacherMessage) return;

    setIsSendingTeacherReply(true);

    const rasedId = String(
      secretCode ||
      selectedSubject.rasedId ||
      selectedSubject.parentCode ||
      ''
    ).trim().toUpperCase();

    const context = resolveParentMessageContext(selectedSubject, replyingToTeacherMessage);
    const { schoolName, subject, className, grade, semester } = context;
    if (!schoolName || !subject) {
      alert('تعذر تحديد المدرسة أو المادة لهذه المحادثة. حدّث بيانات الطالب ثم أعد المحاولة.');
      setIsSendingTeacherReply(false);
      return;
    }
    const text = teacherReplyText.trim();
    const now = new Date().toISOString();

    const localMessage = {
      localId: `local_reply_${Date.now()}`,
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
      messageType: 'teacher_message_reply',
      replyToRow: replyingToTeacherMessage.rowNumber || '',
      replyToMessage: replyingToTeacherMessage.message || '',
      semester,
      className,
      grade
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
      messageEncoded: encodeURIComponent(text),
      sender: 'parent',
      direction: 'parent_to_teacher',
      messageType: 'teacher_message_reply',
      replyToRow: replyingToTeacherMessage.rowNumber || '',
      replyToMessage: replyingToTeacherMessage.message || '',
      semester,
      className,
      grade
    };

    try {
      const result = await sendParentReply(payload);

      if (result.status === 'success' || result.success === true) {
        setTeacherReplyText('');
        setReplyingToTeacherMessage(null);
        await fetchStudentData(secretCode, false, true);
        setTimeout(() => fetchStudentData(secretCode, false, true), 1200);
      } else {
        alert(result.message || 'تعذر إرسال الرد للمعلم.');
      }
    } catch (error) {
      alert('تم حفظ الرد محليًا، لكن تعذر إرساله للسحابة الآن.');
    } finally {
      setIsSendingTeacherReply(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedSubject) return;
    setIsSendingMsg(true);

    const rasedId = String(secretCode || selectedSubject.rasedId || selectedSubject.parentCode || '').trim().toUpperCase();
    const context = resolveParentMessageContext(selectedSubject);
    const { schoolName, subject, className, grade, semester } = context;
    if (!schoolName || !subject) {
      alert('تعذر تحديد المدرسة أو المادة. حدّث بيانات الطالب ثم أعد المحاولة.');
      setIsSendingMsg(false);
      return;
    }
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
      messageType: 'general',
      semester,
      className,
      grade
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
      messageEncoded: encodeURIComponent(text),
      sender: 'parent',
      direction: 'parent_to_teacher',
      messageType: 'general',
      semester,
      className,
      grade
    };

    try {
      const result = await sendParentMessage(payload);
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
      <ParentLogin
        secretCode={secretCode}
        error={error}
        isLoading={isLoading}
        savedProfiles={savedProfiles}
        onCodeChange={setSecretCode}
        onSubmit={handleLogin}
        onSelectChild={(profile) => fetchStudentData(profile.centralStudentId || profile.currentRasedId || profile.id)}
        onRemoveChild={removeSavedProfile}
      />
    );
  }

  if (showWelcomeScreen && allSubjects.length > 0) {
    return <WelcomeScreen studentName={allSubjects[0]?.name || 'الطالب'} />;
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
      <ParentDashboard>
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
      </ParentDashboard>
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
      <ParentAlerts>
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
      </ParentAlerts>
    );
  };

  const renderProfile = () => (
    <ParentProfile>
      <GlassLayout title="حسابي" icon={<User size={24} />}>
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/60 text-center mb-6">
          <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[2rem] mx-auto flex items-center justify-center text-[#002366] mb-4 shadow-inner"><User size={40} /></div>
          <h3 className="text-xl font-black text-slate-800 mb-1">ولي أمر الطالب</h3>
          <p className="text-[#002366] text-sm font-bold bg-indigo-50/50 py-2 px-6 rounded-xl border border-indigo-100/50 inline-block mt-2">{allSubjects[0]?.name}</p>
          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400">الكود السري المربوط: </span>
            <span className="text-xs font-mono font-black text-[#002366] bg-slate-100 px-2 py-1 rounded-md" dir="ltr">{String(allSubjects?.[0]?.centralRasedId || allSubjects?.[0]?.rasedId || secretCode)}</span>
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
    </ParentProfile>
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

      <BottomNavigation
        currentTab={currentTab}
        negativeCount={parentSummary.negativeCount}
        onChange={(tab) => { setCurrentTab(tab); setSelectedSubject(null); }}
      />

      {isMessageOpen && selectedSubject && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white/95 backdrop-blur-xl w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 sm:zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="font-black text-[#002366] flex items-center gap-2 text-lg">
                  <MessagesSquare size={22} /> صندوق رسائل المادة
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  مادة {selectedSubject.subject} - مراسلة المعلم والرد على رسائله
                </p>
              </div>
              <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-indigo-50 text-indigo-400 rounded-full hover:bg-indigo-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-3 pr-1">
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
                            ? 'bg-emerald-50/80 border-emerald-100 rounded-tl-sm'
                            : 'bg-white border-indigo-100 rounded-tr-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="min-w-0">
                            <span
                              className={`text-xs font-black flex items-center gap-1 ${
                                fromTeacher ? 'text-emerald-700' : 'text-[#002366]'
                              }`}
                            >
                              {fromTeacher ? (
                                <>
                                  <MailCheck size={14} />
                                  رسالة من المعلم
                                </>
                              ) : (
                                <>
                                  <MessagesSquare size={14} />
                                  رسالتك للمعلم
                                </>
                              )}
                            </span>

                            {fromTeacher && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-black bg-white/80 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">
                                  {messageTypeLabel}
                                </span>
                                {item.teacherName && (
                                  <span className="text-[9px] font-bold text-emerald-700/80">
                                    {item.teacherName}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <span className="text-[9px] font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded-md shrink-0 border border-slate-100">
                            {formatDateTime(item.date)}
                          </span>
                        </div>

                        {item.replyToMessage && (
                          <div className="mb-2 rounded-xl bg-indigo-50/70 border border-indigo-100 p-2.5">
                            <p className="text-[9px] font-black text-[#002366] mb-1">رد على رسالة المعلم</p>
                            <p className="text-[10px] font-bold text-slate-500 leading-5 line-clamp-3">{item.replyToMessage}</p>
                          </div>
                        )}
                        <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {item.message}
                        </p>

                        {!fromTeacher && (
                          <div className="mt-2 flex justify-end">
                            {item.status === 'replied' || item.teacherReply ? (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CheckCheck size={12} />
                                تم الرد
                              </span>
                            ) : item.status === 'pending' ? (
                              <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CircleDashed size={12} />
                                محفوظ محليًا
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CircleDashed size={12} />
                                بانتظار الرد
                              </span>
                            )}
                          </div>
                        )}

                        {fromTeacher && (
                          <div className="mt-3 border-t border-emerald-100 pt-3">
                            {replyingToTeacherMessage === item ? (
                              <div className="space-y-3">
                                <textarea
                                  value={teacherReplyText}
                                  onChange={(e) => setTeacherReplyText(e.target.value)}
                                  placeholder="اكتب ردك على رسالة المعلم..."
                                  className="w-full h-24 bg-white border border-emerald-100 rounded-2xl p-3 text-sm font-bold resize-none outline-none focus:border-emerald-500 text-slate-800 placeholder:text-slate-300"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToTeacherMessage(null);
                                      setTeacherReplyText('');
                                    }}
                                    className="flex-1 py-3 rounded-2xl bg-white border border-slate-100 text-slate-500 text-xs font-black active:scale-95"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSendReplyToTeacherMessage}
                                    disabled={!teacherReplyText.trim() || isSendingTeacherReply}
                                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    {isSendingTeacherReply ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <SendHorizontal size={16} />
                                        إرسال الرد
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToTeacherMessage(item);
                                  setTeacherReplyText('');
                                }}
                                className="w-full py-3 rounded-2xl bg-white border border-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center gap-2 active:scale-95 hover:bg-emerald-100 transition-all"
                              >
                                <MessageSquare size={16} />
                                الرد على المعلم
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {!fromTeacher && item.teacherReply && (
                        <div className="mr-6 bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <span className="text-xs font-black text-[#002366]">
                              {item.teacherName || 'المعلم'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md shrink-0">
                              {formatDateTime(item.replyDate)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {item.teacherReply}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="shrink-0 pt-3 border-t border-indigo-50">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب استفسارك هنا..."
                className="w-full h-24 bg-white/50 border border-indigo-100 rounded-[1.5rem] p-4 text-sm font-bold resize-none outline-none focus:border-[#002366] focus:bg-white mb-3 transition-all text-slate-800 placeholder:text-indigo-200"
              />
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
                    <span className="relative z-10">إرسال استفسار جديد</span>
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
