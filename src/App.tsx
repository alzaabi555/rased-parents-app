import React, { useMemo, useState } from 'react';
import {
  LogOut,
  Trophy,
  BookOpen,
  ChevronLeft,
  MessageSquare,
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
} from 'lucide-react';


import type { TabId, AlertTabId } from './types/parent';
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
import { formatDate, buildParentSummary, safeList, getSubjectGameResults, getGameScorePercent, getGameTitle, getGameDate, isTeacherMessageToParent, getMessageTypeArabic } from './utils/parentViewUtils';
import { useParentMessages } from './hooks/useParentMessages';
import { ParentMessagesModal } from './components/messages/ParentMessagesModal';
import { useParentStudent } from './hooks/useParentStudent';
import { useParentSession } from './hooks/useParentSession';
import { useSavedChildren } from './hooks/useSavedChildren';
import { useParentNotifications } from './hooks/useParentNotifications';

function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [activeAlertTab, setActiveAlertTab] = useState<AlertTabId>('all');
  const { savedProfiles, saveProfile, removeProfile } = useSavedChildren();
  const { notifyUpdates } = useParentNotifications();
  const student = useParentStudent({ saveProfile, notifyUpdates });
  const { clearSession } = useParentSession({ loadStudent: student.loadStudent });
  const {
    secretCode, setSecretCode, allSubjects, selectedSubject, setSelectedSubject,
    isLoading, isRefreshing, error, showWelcomeScreen, loadStudent, clearStudent,
  } = student;
  const parentSummary = useMemo(() => buildParentSummary(allSubjects), [allSubjects]);
  const handleLogin = (event: React.FormEvent) => { event.preventDefault(); void loadStudent(secretCode); };
  const handleLogout = () => { clearSession(); clearStudent(); setCurrentTab('home'); };
  const removeSavedProfile = (id: string, event: React.MouseEvent) => { event.stopPropagation(); removeProfile(id); if (secretCode === id) setSecretCode(''); };
  const messages = useParentMessages({
    selectedSubject, secretCode, refresh: () => loadStudent(secretCode, false, true),
  });

  if (!allSubjects.length && !showWelcomeScreen) {
    return (
      <ParentLogin
        secretCode={secretCode}
        error={error}
        isLoading={isLoading}
        savedProfiles={savedProfiles}
        onCodeChange={setSecretCode}
        onSubmit={handleLogin}
        onSelectChild={(profile) => loadStudent(profile.centralStudentId || profile.currentRasedId || profile.id)}
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
            <button onClick={() => loadStudent(secretCode, true)} disabled={isRefreshing} className="p-2.5 rounded-xl bg-white/70 border border-indigo-100 text-[#002366] active:scale-95 shadow-sm hover:bg-white transition-colors">
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
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : <SubjectDetails subjectData={selectedSubject} onBack={() => setSelectedSubject(null)} onOpenMessage={() => messages.setOpen(true)} />)}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      <BottomNavigation
        currentTab={currentTab}
        negativeCount={parentSummary.negativeCount}
        onChange={(tab) => { setCurrentTab(tab); setSelectedSubject(null); }}
      />

      <ParentMessagesModal
        open={messages.open}
        subject={selectedSubject}
        items={messages.items}
        messageText={messages.messageText}
        replyText={messages.replyText}
        replyingTo={messages.replyingTo}
        isSending={messages.isSending}
        isSendingReply={messages.isSendingReply}
        onClose={() => messages.setOpen(false)}
        onMessageChange={messages.setMessageText}
        onReplyTextChange={messages.setReplyText}
        onStartReply={(item) => { messages.setReplyingTo(item); messages.setReplyText(''); }}
        onCancelReply={() => { messages.setReplyingTo(null); messages.setReplyText(''); }}
        onSend={messages.send}
        onSendReply={messages.sendReply}
      />
    </div>
  );
}

export default App;
