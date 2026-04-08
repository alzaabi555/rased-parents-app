import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Loader2, LogOut, Trophy, ThumbsUp, BookOpen, ChevronLeft, 
  MessageSquare, Send, X, Code, User, RefreshCw, HeartHandshake,
  Star, School, Fingerprint, LayoutGrid, Bell, AlertTriangle, 
  ClipboardList, History
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

// =========================================================================
// 💎 1. الغلاف الزجاجي الفاخر
// =========================================================================
const GlassLayout: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, rightAction, showBack, onBack, children }) => (
  <div className="h-full w-full overflow-y-auto custom-scrollbar bg-[#f8fafc]" dir="rtl">
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-200/80 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button onClick={onBack} className="p-2.5 bg-slate-50 hover:bg-slate-100 shadow-sm border border-slate-200 rounded-full text-[#000666] transition-all active:scale-95 shrink-0">
              <ArrowLeft size={20}/>
            </button>
          )}
          {icon && !showBack && (
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 shadow-inner flex items-center justify-center text-[#000666] shrink-0">
              {icon}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <h1 className="font-black text-xl text-[#000666] leading-tight truncate">{title}</h1>
            {subtitle && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50/80 text-[#000666] border border-indigo-100/50 mt-1 inline-block w-fit truncate">
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
    <main className="px-5 pt-6 pb-[120px]">
      {children}
    </main>
  </div>
);

// =========================================================================
// 💎 2. التطبيق الرئيسي
// =========================================================================
function App() {
  const [civilID, setCivilID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'alerts' | 'profile'>('home');
  const [activeAlertTab, setActiveAlertTab] = useState<'all' | 'urgent'>('all');

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // 🔔 1. طلب صلاحيات الإشعارات عند فتح التطبيق
  useEffect(() => {
    const requestPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.requestPermissions();
      } else if ("Notification" in window) {
        Notification.requestPermission();
      }
    };
    requestPermissions();
  }, []);

  // 🔔 2. دالة إرسال الإشعار لشاشة القفل
  const triggerDeviceNotification = async (studentName: string, newGradesCount: number, newAlertsCount: number) => {
    let msg = `يوجد تحديثات جديدة للطالب ${studentName}: `;
    if (newGradesCount > 0) msg += `(${newGradesCount}) درجات جديدة. `;
    if (newAlertsCount > 0) msg += `(${newAlertsCount}) تنبيهات سلوكية.`;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: new Date().getTime(),
            title: 'راصد - تحديث جديد 🔔',
            body: msg,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav'
          }
        ]
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification('راصد - تحديث جديد 🔔', { body: msg });
    }
  };

  // ⚙️ 3. الدالة المعدلة للاتصال بالسحابة (مع ميزة الاستشعار الصامت)
  const fetchStudentData = async (id: string, isManualRefresh = false, isSilent = false) => {
    if (!id.trim()) return setError('الرجاء إدخال الرقم المدني للطالب.');
    
    // إظهار دوائر التحميل فقط إذا لم يكن الفحص صامتاً
    if (!isSilent) {
        if (isManualRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError('');
    }

    try {
      const response = await fetch(`${GOOGLE_WEB_APP_URL}?code=${id.trim()}`);
      const result = await response.json();

      if (result.status === 'success') {
        const newSubjects = result.subjects;
        const cachedDataStr = localStorage.getItem(`rased_data_${id.trim()}`);
        
        // 🧠 ذكاء الاستشعار: مقارنة البيانات القديمة بالجديدة
        if (cachedDataStr) {
            const oldSubjects = JSON.parse(cachedDataStr);
            let newGrades = 0;
            let newAlerts = 0;

            newSubjects.forEach((newSub: any, idx: number) => {
                const oldSub = oldSubjects[idx];
                if (oldSub) {
                    const oldGCount = oldSub.grades?.length || 0;
                    const newGCount = newSub.grades?.length || 0;
                    if (newGCount > oldGCount) newGrades += (newGCount - oldGCount);

                    const oldBCount = oldSub.behaviors?.length || 0;
                    const newBCount = newSub.behaviors?.length || 0;
                    if (newBCount > oldBCount) newAlerts += (newBCount - oldBCount);
                }
            });

            // إذا كان هناك بيانات جديدة، أطلق الإشعار!
            if (newGrades > 0 || newAlerts > 0) {
                triggerDeviceNotification(newSubjects[0]?.name, newGrades, newAlerts);
            }
        }

        localStorage.setItem(`rased_data_${id.trim()}`, JSON.stringify(newSubjects));
        setAllSubjects(newSubjects);
        localStorage.setItem('rased_parent_civil_id', id.trim());
        
        if (!isManualRefresh && !isSilent) {
          setShowWelcomeScreen(true);
          setTimeout(() => setShowWelcomeScreen(false), 2500);
        }
      } else {
        if (!isSilent) setError('لم يتم العثور على بيانات لهذا الرقم المدني.');
        if (!isManualRefresh && !isSilent) localStorage.removeItem('rased_parent_civil_id');
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

  // ⏱️ 4. مؤقت الاستشعار الصامت (يشتغل كل دقيقة تلقائياً)
  useEffect(() => {
    const savedID = localStorage.getItem('rased_parent_civil_id');
    if (savedID) {
      setCivilID(savedID);
      fetchStudentData(savedID); // جلب مبدئي

      // نبض صامت كل 60 ثانية (لإشعار ولي الأمر فور التحديث)
      const silentInterval = setInterval(() => {
          fetchStudentData(savedID, false, true);
      }, 60000); 

      return () => clearInterval(silentInterval);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudentData(civilID);
  };

  const handleLogout = () => {
    localStorage.removeItem('rased_parent_civil_id');
    setAllSubjects([]);
    setSelectedSubject(null);
    setCivilID('');
    setCurrentTab('home');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSendingMsg(true);
    const payload = {
      action: "sendMessage", civilID, studentName: selectedSubject.name,
      schoolName: selectedSubject.schoolName || "غير محدد", subject: selectedSubject.subject, message: messageText.trim()
    };
    try {
      const response = await fetch(GOOGLE_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.status === 'success') {
        alert('تم إرسال رسالتك للمعلم بنجاح! ✅');
        setMessageText(''); setIsMessageOpen(false);
      }
    } catch (error) { alert('خطأ في الإرسال. تأكد من الإنترنت.'); } 
    finally { setIsSendingMsg(false); }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ==================== شاشة تسجيل الدخول ====================
  if (!allSubjects.length && !showWelcomeScreen) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center font-sans overflow-hidden relative px-6" dir="rtl"
        style={{ backgroundColor: '#000666', backgroundImage: `radial-gradient(at 0% 0%, #1a237e 0px, transparent 50%), radial-gradient(at 100% 0%, #000767 0px, transparent 50%), radial-gradient(at 100% 100%, #1b6d24 0px, transparent 50%), radial-gradient(at 0% 100%, #000666 0px, transparent 50%)` }}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8690ee]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1b6d24]/20 rounded-full blur-[100px] pointer-events-none"></div>

        <main className="w-full max-w-md relative z-10 flex flex-col items-center">
          <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md mb-6 shadow-2xl border border-white/10">
              <School className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">راصد</h1>
            <p className="text-[#bdc2ff] font-bold tracking-wide text-sm">بوابة ولي الأمر الرقمية</p>
          </div>

          <div className="w-full bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-white mb-2">تسجيل الدخول</h2>
              <p className="text-white/60 text-xs font-bold">يرجى إدخال بياناتك للوصول إلى لوحة التحكم</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/90 px-1 text-right">الرقم المدني للطالب</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#000666] z-10">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <input type="number" value={civilID} onChange={(e) => setCivilID(e.target.value)}
                    className="block w-full pr-14 pl-4 py-4 bg-white/95 border-none rounded-2xl focus:ring-4 focus:ring-[#8690ee]/50 text-[#000666] font-black text-lg outline-none text-left" placeholder="أدخل الرقم المدني" required />
                </div>
                {error && <p className="text-red-300 text-xs font-bold text-center mt-2">{error}</p>}
              </div>
              <button type="submit" disabled={!civilID || isLoading} className="w-full bg-white text-[#000666] py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl hover:bg-slate-50 active:scale-95 disabled:opacity-70 transition-all">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>دخول آمن</span><ArrowLeft className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ==================== شاشة الترحيب المؤقتة ====================
  if (showWelcomeScreen && allSubjects.length > 0) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000666] to-[#1a237e] p-6 font-sans text-center relative overflow-hidden animate-in fade-in duration-500" dir="rtl">
        <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white/10 p-6 rounded-full mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-pulse">
            <HeartHandshake size={72} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">أهلاً بك في راصد!</h1>
          <p className="text-blue-100 text-lg font-bold leading-relaxed max-w-xs">
             متابعتك المستمرة هي سر تفوق الطالب
             <span className="text-[#a0f399] text-2xl block mt-4 font-black bg-white/10 py-2 px-4 rounded-2xl">
               {allSubjects[0].name}
             </span>
          </p>
        </div>
      </div>
    );
  }

  // ==================== 3. شاشة الداشبورد (الرئيسية) ====================
  const renderDashboard = () => (
    <div className="animate-in fade-in duration-500 h-full">
      <GlassLayout
        title={allSubjects[0]?.name || 'الطالب'}
        subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
        icon={<User size={24} />}
        rightAction={
          <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#000666] active:scale-95 transition-all shadow-sm">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        }
      >
        <h2 className="text-sm font-black text-[#000666] flex items-center gap-2 mb-4 px-1">
          <BookOpen size={18} className="text-[#000666]"/> المواد الدراسية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSubjects.map((sub, idx) => (
            <div key={idx} onClick={() => setSelectedSubject(sub)} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-[#000666]/30 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#000666] shadow-inner">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">{sub.subject}</h3>
                    <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                      <History size={10} /> آخر تحديث: {formatDate(sub.lastUpdate)}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={20} className="text-slate-300" />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (sub.totalPoints || 50) + 40)}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-emerald-600">{Math.min(100, (sub.totalPoints || 50) + 40)}%</span>
              </div>
            </div>
          ))}
          {allSubjects.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 font-bold bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
               لا توجد مواد مضافة حالياً.
            </div>
          )}
        </div>
      </GlassLayout>
    </div>
  );

  // ==================== 4. شاشة تفاصيل المادة ====================
  const renderSubjectDetails = () => {
    const s = selectedSubject;
    const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
    const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
    const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];

    return (
      <div className="animate-in slide-in-from-left-8 fade-in duration-300 h-full">
        <GlassLayout
          title={s.subject}
          showBack={true}
          onBack={() => setSelectedSubject(null)}
          rightAction={
            <div className="flex items-center gap-1.5 bg-[#fff8e1] border border-[#ffecb3] px-3 py-1.5 rounded-xl shadow-sm">
              <Trophy size={14} className="text-[#d97706]" />
              <span className="text-sm font-black text-[#d97706]" dir="ltr">{s.totalPoints}</span>
              <span className="text-[9px] font-bold text-[#d97706]/80">نقطة</span>
            </div>
          }
        >
          <div className="space-y-5">
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100"><Trophy size={18}/></div>
                <div className="flex flex-col">
                  <p className="text-slate-500 text-[10px] font-bold">إجمالي النقاط</p>
                  <h3 className="text-lg font-black text-[#000666] leading-none mt-0.5">{s.totalPoints}</h3>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100"><Star size={18}/></div>
                <div className="flex flex-col">
                  <p className="text-slate-500 text-[10px] font-bold">أيام الانضباط</p>
                  <h3 className="text-lg font-black text-[#000666] leading-none mt-0.5">{disciplineCount}</h3>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col max-h-[300px]">
                <h3 className="text-sm font-black text-[#000666] mb-3 flex items-center gap-2 px-1 shrink-0">
                    <ThumbsUp size={18} className="text-emerald-500"/> إنجازات إيجابية
                </h3>
                <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                  {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                        <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                    </div>
                  )) : <p className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">- لا يوجد حالياً -</p>}
                </div>
              </section>

              <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col max-h-[300px]">
                <h3 className="text-sm font-black text-[#000666] mb-3 flex items-center gap-2 px-1 shrink-0">
                    <AlertTriangle size={18} className="text-rose-500"/> تنبيهات وملاحظات
                </h3>
                <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                  {neg.length > 0 ? neg.map((b: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
                        <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                    </div>
                  )) : <p className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">- لا توجد تنبيهات -</p>}
                </div>
              </section>
            </div>

            <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col max-h-[350px]">
              <h3 className="text-sm font-black text-[#000666] mb-3 flex items-center gap-2 px-1 shrink-0">
                  <ClipboardList size={18} className="text-[#000666]"/> سجل الدرجات
              </h3>
              <div className="rounded-2xl border border-slate-200 overflow-hidden overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr className="text-slate-500 font-black text-[10px] uppercase border-b border-slate-200">
                      <th className="py-3 px-4 text-right">الاختبار / الواجب</th>
                      <th className="py-3 px-4 text-center w-28">الدرجة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {s.grades?.map((g: any, i: number) => (
                      <tr key={i} className="hover:bg-white transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-700 text-xs">{g.category}</td>
                        <td className="py-3 px-4 text-center"><span className="text-sm font-black text-[#000666] bg-indigo-50 px-3 py-1 rounded-lg">{g.score}</span></td>
                      </tr>
                    ))}
                    {(!s.grades || s.grades.length === 0) && (
                      <tr><td colSpan={2} className="py-8 text-center text-xs text-slate-400 font-bold">لم يتم رصد درجات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <button onClick={() => setIsMessageOpen(true)} className="w-full mt-2 bg-[#000666] hover:bg-indigo-900 text-white shadow-xl shadow-indigo-900/20 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95">
              <MessageSquare size={18} /> تواصل مع معلم المادة
            </button>
          </div>
        </GlassLayout>
      </div>
    );
  };

  // =========================================================================
  // 5. شاشة الإشعارات
  // =========================================================================
  const renderNotifications = () => {
    let alerts: any[] = [];
    allSubjects.forEach(sub => {
      sub.behaviors?.filter((b:any)=> b.type === 'negative').forEach((b:any) => alerts.push({...b, subject: sub.subject, kind: 'alert'}));
      sub.grades?.forEach((g:any) => alerts.push({...g, subject: sub.subject, kind: 'grade'}));
    });

    return (
      <div className="animate-in fade-in duration-500 h-full">
        <GlassLayout title="الإشعارات والتنبيهات" icon={<Bell size={24} />}>
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm">
            <button onClick={() => setActiveAlertTab('all')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeAlertTab === 'all' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>الكل</button>
            <button onClick={() => setActiveAlertTab('urgent')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeAlertTab === 'urgent' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>تنبيهات سلوكية</button>
          </div>

          <div className="space-y-3">
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${item.kind === 'alert' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-indigo-50 text-[#000666] border-indigo-100'}`}>
                    {item.kind === 'alert' ? <AlertTriangle size={20} /> : <ClipboardList size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.kind === 'alert' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-indigo-50 text-[#000666] border border-indigo-100'} truncate`}>{item.subject}</span>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-800 mb-0.5">{item.kind === 'alert' ? 'تنبيه سلوكي' : 'تحديث درجة'}</h3>
                    <p className="text-xs text-slate-500 font-bold leading-snug">{item.description || `تم رصد درجة: ${item.category} (${item.score})`}</p>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 shadow-sm">
                <Bell size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </div>
        </GlassLayout>
      </div>
    );
  };

  // =========================================================================
  // 6. شاشة الملف الشخصي
  // =========================================================================
  const renderProfile = () => (
    <div className="animate-in fade-in duration-500 h-full">
      <GlassLayout title="حسابي" icon={<User size={24} />}>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 text-center mb-6">
              <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] mx-auto flex items-center justify-center text-[#000666] mb-4 shadow-inner">
                  <User size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">ولي أمر الطالب</h3>
              <p className="text-slate-500 text-sm font-bold bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 inline-block">{allSubjects[0]?.name}</p>
          </div>

          <button onClick={handleLogout} className="w-full bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm">
              <LogOut size={18} /> تسجيل الخروج
          </button>

          <div className="mt-12 text-center opacity-60">
              <p className="text-slate-400 text-[10px] font-bold mb-1">برمجة وتطوير</p>
              <div className="flex items-center justify-center gap-1.5">
                  <Code size={12} className="text-slate-600" />
                  <span className="text-slate-600 text-[11px] font-black tracking-widest uppercase">ALZAABI MOHAMMAD</span>
              </div>
          </div>
      </GlassLayout>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-[#f8fafc] font-sans text-slate-800" dir="rtl">
      
      {/* عرض المحتوى حسب التاب النشط - حاوية بملء الشاشة مع إخفاء التمرير الخارجي */}
      <div className="absolute inset-0 z-0">
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : renderSubjectDetails())}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* 💉 شريط التنقل السفلي الملتصق بالحافة (Standard Bottom Nav) */}
      <nav className="absolute bottom-0 left-0 right-0 z-[90] flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 bg-white/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-200 transition-colors duration-500">
        <button onClick={() => { setCurrentTab('home'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'home' ? 'text-[#000666] scale-110 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}>
          <LayoutGrid size={22} className={currentTab === 'home' ? 'fill-[#000666]/10' : ''} />
          <span className="text-[9px] font-black mt-1">الرئيسية</span>
        </button>
        
        <button onClick={() => { setCurrentTab('alerts'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 relative ${currentTab === 'alerts' ? 'text-[#000666] scale-110 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}>
          <Bell size={22} className={currentTab === 'alerts' ? 'fill-[#000666]/10' : ''} />
          <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          <span className="text-[9px] font-black mt-1">إشعارات</span>
        </button>

        <button onClick={() => { setCurrentTab('profile'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'profile' ? 'text-[#000666] scale-110 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}>
          <User size={22} className={currentTab === 'profile' ? 'fill-[#000666]/10' : ''} />
          <span className="text-[9px] font-black mt-1">حسابي</span>
        </button>
      </nav>

      {/* نافذة المراسلة المنبثقة */}
      {isMessageOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-[#000666] flex items-center gap-2"><MessageSquare size={20}/> رسالة للمعلم</h3>
              <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X size={18}/></button>
            </div>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="اكتب ملاحظاتك أو أعذار الغياب..." className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold resize-none outline-none focus:border-[#000666] mb-4"></textarea>
            <button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg} className="w-full bg-[#000666] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg">
              {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال الرسالة <Send size={18}/></>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
