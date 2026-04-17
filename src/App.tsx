import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, LogOut, Trophy, ThumbsUp, BookOpen, ChevronLeft, 
  MessageSquare, Send, X, Code, User, RefreshCw, HeartHandshake,
  Star, School, Fingerprint, LayoutGrid, Bell, AlertTriangle, 
  ClipboardList, History, Users, Trash2 // 💉 تم إضافة أيقونات المحفظة هنا
} from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

// اللون الأزرق الملكي المعتمد
const ROYAL_BLUE = "#002366"; 

// =========================================================================
// 💎 1. الغلاف الزجاجي الفاخر (النسخة المحسنة للشفافية)
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
  <div className="h-full w-full overflow-y-auto custom-scrollbar bg-transparent" dir="rtl">
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/60 pt-[max(env(safe-area-inset-top),16px)] pb-4 px-5 transition-all shadow-[0_4px_30px_rgba(0,35,102,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button onClick={onBack} className="p-2.5 bg-white/50 hover:bg-white shadow-sm border border-indigo-100 rounded-full text-[#002366] transition-all active:scale-95 shrink-0">
              <ArrowLeft size={20}/>
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
        {rightAction && (
          <div className="shrink-0 flex items-center gap-2 pl-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>

    <main className="px-5 pt-6 pb-[130px]">
      {children}
    </main>
  </div>
);

// =========================================================================
// 💎 2. شاشة تفاصيل المادة
// =========================================================================
const SubjectDetails: React.FC<{
  subjectData: any;
  onBack: () => void;
  onOpenMessage: () => void;
  formatDate: (dateString: string) => string;
}> = ({ subjectData, onBack, onOpenMessage, formatDate }) => {
  const s = subjectData;
  const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
  const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
  const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
  const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];

  return (
    <div className="animate-in slide-in-from-left-8 fade-in duration-500 h-full">
      <GlassLayout
        title={s.subject}
        showBack={true}
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm">
            <Trophy size={16} className="text-amber-600" />
            <span className="text-base font-black text-amber-600" dir="ltr">{s.totalPoints}</span>
            <span className="text-[9px] font-bold text-amber-600/80 uppercase">نقطة</span>
          </div>
        }
      >
        <div className="space-y-5">
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-indigo-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#002366] shrink-0 border border-indigo-100"><Trophy size={18}/></div>
              <div className="flex flex-col">
                <p className="text-slate-500 text-[10px] font-bold">إجمالي النقاط</p>
                <h3 className="text-lg font-black text-[#002366] leading-none mt-0.5">{s.totalPoints}</h3>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-indigo-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100"><Star size={18}/></div>
              <div className="flex flex-col">
                <p className="text-slate-500 text-[10px] font-bold">أيام الانضباط</p>
                <h3 className="text-lg font-black text-[#002366] leading-none mt-0.5">{disciplineCount}</h3>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                  <ThumbsUp size={18} className="text-emerald-500"/> إنجازات إيجابية
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 transition-all hover:bg-emerald-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <p className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">- لا يوجد حالياً -</p>}
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[300px]">
              <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                  <AlertTriangle size={18} className="text-rose-500"/> تنبيهات وملاحظات
              </h3>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {neg.length > 0 ? neg.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-rose-50/40 border border-rose-100 transition-all hover:bg-rose-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                      <h4 className="font-bold text-slate-700 text-xs">{b.description}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0">{formatDate(b.date)}</span>
                  </div>
                )) : <p className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">- لا توجد تنبيهات -</p>}
              </div>
            </section>
          </div>

          <section className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-black text-[#002366] mb-3 flex items-center gap-2 px-1 shrink-0">
                <ClipboardList size={18} className="text-[#002366]"/> سجل الدرجات
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
                  {s.grades?.map((g: any, i: number) => (
                    <tr key={i} className="hover:bg-white transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-700 text-xs">{g.category}</td>
                      <td className="py-3.5 px-4 text-center"><span className="text-sm font-black text-[#002366] bg-indigo-50/80 px-3 py-1 rounded-lg border border-indigo-100/50">{g.score}</span></td>
                    </tr>
                  ))}
                  {(!s.grades || s.grades.length === 0) && (
                    <tr><td colSpan={2} className="py-8 text-center text-xs text-slate-400 font-bold">لم يتم رصد درجات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <button onClick={onOpenMessage} className="w-full mt-2 bg-gradient-to-r from-[#002366] to-[#1e40af] hover:shadow-lg hover:shadow-indigo-900/30 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md">
            <MessageSquare size={18} /> تواصل مع معلم المادة
          </button>
        </div>
      </GlassLayout>
    </div>
  );
};

// =========================================================================
// 💎 3. التطبيق الرئيسي (The Main App)
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

  // 💉 حالة جديدة لحفظ محفظة الأبناء
  const [savedProfiles, setSavedProfiles] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.requestPermissions();
      } else if ("Notification" in window) {
        Notification.requestPermission();
      }
    };
    requestPermissions();

    // 💉 تحميل محفظة الأبناء عند فتح التطبيق
    const loadedProfiles = JSON.parse(localStorage.getItem('rased_saved_profiles') || '[]');
    setSavedProfiles(loadedProfiles);
  }, []);

  const triggerDeviceNotification = async (studentName: string, newGradesCount: number, newAlertsCount: number) => {
    let msg = `تحديثات جديدة للطالب ${studentName}: `;
    if (newGradesCount > 0) msg += `(${newGradesCount}) درجات. `;
    if (newAlertsCount > 0) msg += `(${newAlertsCount}) تنبيهات.`;

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{ id: Date.now(), title: 'راصد الملكي 🔔', body: msg, schedule: { at: new Date(Date.now() + 1000) }, sound: 'beep.wav' }]
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification('راصد الملكي 🔔', { body: msg });
    }
  };

  const fetchStudentData = async (id: string, isManualRefresh = false, isSilent = false) => {
    if (!id.trim()) return setError('الرجاء إدخال الرقم المدني للطالب.');
    if (!isSilent) {
        if (isManualRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError('');
    }

    try {
      // 💉 كاسر الكاش لتجنب تأخر البيانات
      const cacheBuster = new Date().getTime();
      const response = await fetch(`${GOOGLE_WEB_APP_URL}?code=${id.trim()}&t=${cacheBuster}`, {
          method: 'GET',
          redirect: 'follow'
      });
      const textData = await response.text();
      const result = JSON.parse(textData);

      if (result.status === 'success') {
        const newSubjects = result.subjects;
        const cachedDataStr = localStorage.getItem(`rased_data_${id.trim()}`);
        const studentName = newSubjects[0]?.name || 'طالب';
        
        if (cachedDataStr) {
            const oldSubjects = JSON.parse(cachedDataStr);
            let newGrades = 0, newAlerts = 0;
            newSubjects.forEach((newSub: any, idx: number) => {
                const oldSub = oldSubjects[idx];
                if (oldSub) {
                    const oldG = oldSub.grades?.length || 0, newG = newSub.grades?.length || 0;
                    if (newG > oldG) newGrades += (newG - oldG);
                    const oldB = oldSub.behaviors?.length || 0, newB = newSub.behaviors?.length || 0;
                    if (newB > oldB) newAlerts += (newB - oldB);
                }
            });
            if (newGrades > 0 || newAlerts > 0) triggerDeviceNotification(studentName, newGrades, newAlerts);
        }

        // 💉 تحديث محفظة الأبناء
        const currentProfiles = JSON.parse(localStorage.getItem('rased_saved_profiles') || '[]');
        if (!currentProfiles.find((p: any) => p.id === id.trim())) {
            const updatedProfiles = [...currentProfiles, { id: id.trim(), name: studentName }];
            localStorage.setItem('rased_saved_profiles', JSON.stringify(updatedProfiles));
            setSavedProfiles(updatedProfiles);
        }

        localStorage.setItem(`rased_data_${id.trim()}`, JSON.stringify(newSubjects));
        setAllSubjects(newSubjects);
        localStorage.setItem('rased_parent_civil_id', id.trim());
        setCivilID(id.trim()); // ضمان تحديث الحقل
        
        if (!isManualRefresh && !isSilent) { setShowWelcomeScreen(true); setTimeout(() => setShowWelcomeScreen(false), 2500); }
      } else {
        if (!isSilent) setError('لم يتم العثور على بيانات أو تأكد من صحة الرقم المدني.');
      }
    } catch (err) {
      if (!isSilent) setError('خطأ في الاتصال بالسحابة.');
    } finally {
      if (!isSilent) { setIsLoading(false); setIsRefreshing(false); }
    }
  };

  useEffect(() => {
    const savedID = localStorage.getItem('rased_parent_civil_id');
    if (savedID) {
      setCivilID(savedID);
      fetchStudentData(savedID);
      const silentInterval = setInterval(() => fetchStudentData(savedID, false, true), 60000); 
      return () => clearInterval(silentInterval);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); fetchStudentData(civilID); };
  
  const handleLogout = () => { 
    localStorage.removeItem('rased_parent_civil_id'); 
    setAllSubjects([]); 
    setSelectedSubject(null); 
    setCivilID(''); 
    setCurrentTab('home'); 
  };

  // 💉 دالة لحذف ابن من المحفظة
  const removeSavedProfile = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter(p => p.id !== idToRemove);
    setSavedProfiles(updated);
    localStorage.setItem('rased_saved_profiles', JSON.stringify(updated));
    if (civilID === idToRemove) setCivilID('');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSendingMsg(true);
    const payload = { action: "sendMessage", civilID, studentName: selectedSubject.name, schoolName: selectedSubject.schoolName || "غير محدد", subject: selectedSubject.subject, message: messageText.trim() };
    try {
      const response = await fetch(GOOGLE_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.status === 'success') { alert('تم الإرسال بنجاح! ✅'); setMessageText(''); setIsMessageOpen(false); }
    } catch (error) { alert('خطأ في الإرسال.'); } 
    finally { setIsSendingMsg(false); }
  };

  const formatDate = (dateString: string) => { if (!dateString) return ''; return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); };

  // ================= شاشة تسجيل الدخول المحدثة بالمحفظة =================
  if (!allSubjects.length && !showWelcomeScreen) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center font-sans overflow-hidden relative px-6" dir="rtl"
        style={{ backgroundColor: ROYAL_BLUE, backgroundImage: `radial-gradient(at 0% 0%, #1e40af 0px, transparent 50%), radial-gradient(at 100% 0%, #002366 0px, transparent 50%), radial-gradient(at 100% 100%, #1e3a8a 0px, transparent 50%), radial-gradient(at 0% 100%, #002366 0px, transparent 50%)` }}>
        
        <main className="w-full max-w-md relative z-10 flex flex-col items-center max-h-screen overflow-y-auto custom-scrollbar py-10">
          
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shrink-0">
            <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md mb-6 shadow-2xl border border-white/10">
              <School className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">راصد</h1>
            <p className="text-indigo-200 font-bold tracking-wide text-sm">بوابة ولي الأمر الملكية</p>
          </div>

          <div className="w-full flex flex-col gap-6">
            
            {/* 💉 قسم محفظة الأبناء (يظهر فقط إذا كان هناك أبناء محفوظون) */}
            {savedProfiles.length > 0 && (
              <div className="w-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-sm font-black text-white mb-4 text-center flex items-center justify-center gap-2">
                  <Users size={16} className="text-indigo-300"/> الدخول السريع للأبناء
                </h2>
                <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  {savedProfiles.map(profile => (
                    <div 
                      key={profile.id} 
                      onClick={() => fetchStudentData(profile.id)} 
                      className="bg-white/5 hover:bg-white/20 border border-white/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-95 group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#002366]/50 flex items-center justify-center text-indigo-100 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                          <User size={18} />
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-black line-clamp-1">{profile.name}</p>
                          <p className="text-indigo-200 text-[10px] font-mono mt-0.5">{profile.id}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => removeSavedProfile(profile.id, e)} 
                        className="p-2.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="حذف الحساب"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 💉 قسم الدخول اليدوي الجديد */}
            <div className="w-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20">
              <h2 className="text-xl font-black text-white mb-6 text-center">
                {savedProfiles.length > 0 ? 'إضافة ابن جديد' : 'تسجيل الدخول'}
              </h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white/90 px-1 text-right">الرقم المدني للطالب</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-indigo-300 group-focus-within:text-white z-10"><Fingerprint className="w-6 h-6" /></div>
                    <input type="number" value={civilID} onChange={(e) => setCivilID(e.target.value)} className="block w-full pr-14 pl-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 text-white font-black text-lg outline-none text-left placeholder:text-indigo-200/50" placeholder="أدخل الرقم المدني" required />
                  </div>
                  {error && <p className="text-rose-300 text-xs font-bold text-center mt-2 animate-in fade-in">{error}</p>}
                </div>
                <button type="submit" disabled={!civilID || isLoading} className="w-full bg-white text-[#002366] py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
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
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#002366] p-6 text-center animate-in fade-in duration-500" dir="rtl">
        <div className="bg-white/10 p-6 rounded-full mb-8 shadow-2xl animate-pulse"><HeartHandshake size={72} className="text-white" /></div>
        <h1 className="text-3xl font-black text-white mb-4">أهلاً بك في راصد!</h1>
        <p className="text-indigo-100 text-lg font-bold">{allSubjects[0].name}</p>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="animate-in fade-in duration-500 h-full">
      <GlassLayout
        title={allSubjects[0]?.name || 'الطالب'}
        subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
        icon={<User size={24} />}
        rightAction={
          <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className="p-2.5 rounded-xl bg-white/50 border border-indigo-100 text-[#002366] active:scale-95 shadow-sm hover:bg-white transition-colors">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        }
      >
        <h2 className="text-sm font-black text-[#002366] flex items-center gap-2 mb-4 px-1">
          <BookOpen size={18} className="text-[#002366]"/> المواد الدراسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSubjects.map((sub, idx) => (
            <div key={idx} onClick={() => setSelectedSubject(sub)} className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white/60 hover:border-indigo-200 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all">
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
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-indigo-50 rounded-full overflow-hidden border border-indigo-100/30">
                  <div className="h-full bg-[#002366] rounded-full" style={{ width: `${Math.min(100, (sub.totalPoints || 50) + 40)}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-[#002366]">{Math.min(100, (sub.totalPoints || 50) + 40)}%</span>
              </div>
            </div>
          ))}
        </div>
      </GlassLayout>
    </div>
  );

  const renderNotifications = () => {
    let alerts: any[] = [];
    allSubjects.forEach(sub => {
      sub.behaviors?.filter((b:any)=> b.type === 'negative').forEach((b:any) => alerts.push({...b, subject: sub.subject, kind: 'alert'}));
      sub.grades?.forEach((g:any) => alerts.push({...g, subject: sub.subject, kind: 'grade'}));
    });
    return (
      <div className="animate-in fade-in duration-500 h-full">
        <GlassLayout title="الإشعارات" icon={<Bell size={24} />}>
          <div className="flex p-1 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl mb-6 shadow-sm">
            <button onClick={() => setActiveAlertTab('all')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${activeAlertTab === 'all' ? 'bg-[#002366] text-white shadow-md' : 'text-slate-500 hover:text-[#002366]'}`}>الكل</button>
            <button onClick={() => setActiveAlertTab('urgent')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${activeAlertTab === 'urgent' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-rose-500'}`}>تنبيهات</button>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 transition-all hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${item.kind === 'alert' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-indigo-50 text-[#002366] border-indigo-100'}`}>
                    {item.kind === 'alert' ? <AlertTriangle size={20} /> : <ClipboardList size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.kind === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-[#002366]'} truncate`}>{item.subject}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-800">{item.kind === 'alert' ? 'تنبيه سلوكي' : 'تحديث درجة'}</h3>
                    <p className="text-xs text-slate-500 font-bold leading-snug">{item.description || `تم رصد درجة: ${item.category} (${item.score})`}</p>
                  </div>
                </div>
              </div>
            ))}
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
              <p className="text-[#002366] text-sm font-bold bg-indigo-50/50 py-2 px-6 rounded-xl border border-indigo-100/50 inline-block">{allSubjects[0]?.name}</p>
          </div>
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
      
      {/* 💉 الفقاعات المحيطية الزرقاء لإبراز التأثير الزجاجي بشكل ملكي */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[50%] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute inset-0 z-10">
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : <SubjectDetails subjectData={selectedSubject} onBack={() => setSelectedSubject(null)} onOpenMessage={() => setIsMessageOpen(true)} formatDate={formatDate} />)}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* 💉 الشريط السفلي (Glassmorphism Royal Blue) */}
      <nav className="absolute bottom-0 left-0 right-0 z-[90] flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 bg-white/60 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,35,102,0.06)] border-t border-white/60 transition-all">
        <button onClick={() => { setCurrentTab('home'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'home' ? 'text-[#002366] scale-110 -translate-y-1' : 'text-slate-400 hover:text-indigo-400'}`}>
          <LayoutGrid size={22} className={currentTab === 'home' ? 'fill-indigo-50/50' : ''} /><span className="text-[9px] font-black mt-1">الرئيسية</span>
        </button>
        <button onClick={() => { setCurrentTab('alerts'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 relative ${currentTab === 'alerts' ? 'text-[#002366] scale-110 -translate-y-1' : 'text-slate-400 hover:text-indigo-400'}`}>
          <Bell size={22} className={currentTab === 'alerts' ? 'fill-indigo-50/50' : ''} /><span className="absolute top-1 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white"></span><span className="text-[9px] font-black mt-1">إشعارات</span>
        </button>
        <button onClick={() => { setCurrentTab('profile'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'profile' ? 'text-[#002366] scale-110 -translate-y-1' : 'text-slate-400 hover:text-indigo-400'}`}>
          <User size={22} className={currentTab === 'profile' ? 'fill-indigo-50/50' : ''} /><span className="text-[9px] font-black mt-1">حسابي</span>
        </button>
      </nav>

      {/* نافذة الرسائل */}
      {isMessageOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white/95 backdrop-blur-xl w-full sm:max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-7 shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-[#002366] flex items-center gap-2 text-lg"><MessageSquare size={22}/> رسالة للمعلم</h3>
              <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-indigo-50 text-indigo-400 rounded-full hover:bg-indigo-100 transition-colors"><X size={20}/></button>
            </div>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="اكتب ملاحظاتك هنا..." className="w-full h-40 bg-white/50 border border-indigo-100 rounded-[1.5rem] p-5 text-sm font-bold resize-none outline-none focus:border-[#002366] focus:bg-white mb-6 transition-all text-slate-800 placeholder:text-indigo-200"></textarea>
            <button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg} className="w-full bg-[#002366] text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-indigo-900/20">
              {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال الرسالة <Send size={18}/></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
