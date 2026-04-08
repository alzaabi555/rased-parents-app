import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, LogOut, Trophy, ThumbsUp, BookOpen, ChevronLeft, 
  MessageSquare, Send, X, Code, User, RefreshCw, HeartHandshake,
  Star, School, Fingerprint, LayoutGrid, Bell, AlertTriangle, 
  ClipboardList, Calendar, History, Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeProvider'; // 💉 استدعاء محرك الثيمات
import PageLayout from '../components/PageLayout'; // 💉 استدعاء الغلاف الزجاجي
import { Drawer as DrawerSheet } from '../components/ui/Drawer'; // 💉 استدعاء النافذة المحدثة

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

function App() {
  const { t, dir, language } = useApp();
  const { theme, toggleTheme } = useTheme();

  // ================= الحالات الأساسية للتطبيق =================
  const [civilID, setCivilID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  
  // ================= حالات التنقل والواجهات =================
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'alerts' | 'profile'>('home');
  const [activeAlertTab, setActiveAlertTab] = useState<'all' | 'urgent'>('all');

  // ================= حالات المراسلة =================
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // ================= دوال الاتصال بالسحابة =================
  const fetchStudentData = async (id: string, isManualRefresh = false) => {
    if (!id.trim()) return setError('الرجاء إدخال الرقم المدني للطالب.');
    
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${GOOGLE_WEB_APP_URL}?code=${id.trim()}`);
      const result = await response.json();

      if (result.status === 'success') {
        const newSubjects = result.subjects;
        
        // حفظ البيانات الجديدة للمقارنة لاحقاً
        localStorage.setItem(`rased_data_${id.trim()}`, JSON.stringify(newSubjects));

        setAllSubjects(newSubjects);
        localStorage.setItem('rased_parent_civil_id', id.trim());
        
        if (!isManualRefresh) {
          setShowWelcomeScreen(true);
          setTimeout(() => setShowWelcomeScreen(false), 2500);
        }
      } else {
        setError('لم يتم العثور على بيانات لهذا الرقم المدني.');
        if (!isManualRefresh) localStorage.removeItem('rased_parent_civil_id');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالسحابة.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const savedID = localStorage.getItem('rased_parent_civil_id');
    if (savedID) {
      setCivilID(savedID);
      fetchStudentData(savedID);
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
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // =========================================================================
  // 1. شاشة تسجيل الدخول (التصميم الزجاجي المتدرج) - تظل بدون تغيير جذري لحفظ هويتها
  // =========================================================================
  if (!allSubjects.length && !showWelcomeScreen) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center font-sans overflow-hidden relative px-6" dir={dir}
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
                <label className={`block text-xs font-bold text-white/90 px-1 text-${dir === 'rtl' ? 'right' : 'left'}`}>الرقم المدني للطالب</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#000666] z-10`}>
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <input type="number" value={civilID} onChange={(e) => setCivilID(e.target.value)}
                    className={`block w-full ${dir === 'rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'} py-4 bg-white/95 border-none rounded-2xl focus:ring-4 focus:ring-[#8690ee]/50 text-[#000666] font-black text-lg outline-none text-left`} placeholder="أدخل الرقم المدني" required />
                </div>
                {error && <p className="text-red-300 text-xs font-bold text-center mt-2">{error}</p>}
              </div>
              <button type="submit" disabled={!civilID || isLoading} className="w-full bg-white text-[#000666] py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl hover:bg-slate-50 active:scale-95 disabled:opacity-70 transition-all">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>دخول آمن</span><ArrowLeft className={`w-5 h-5 ${dir === 'ltr' ? 'rotate-180' : ''}`} /></>}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // 2. شاشة الترحيب المؤقتة
  // =========================================================================
  if (showWelcomeScreen && allSubjects.length > 0) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000666] to-[#1a237e] p-6 font-sans text-center relative overflow-hidden animate-in fade-in duration-500" dir={dir}>
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

  // =========================================================================
  // 3. شاشة الداشبورد (الرئيسية) - 💉 معالجة وتغليف بالكبسولة الزجاجية
  // =========================================================================
  const renderDashboard = () => (
    <PageLayout
        title={allSubjects[0]?.name || 'الطالب'}
        subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
        
        icon={
            <div className="w-12 h-12 rounded-xl bg-bgSoft border border-borderColor flex items-center justify-center overflow-hidden shadow-inner">
                <User size={24} className="text-textSecondary" />
            </div>
        }

        rightActions={
            <div className="flex gap-2 items-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all bg-bgSoft border-borderColor text-textSecondary hover:bg-bgCard hover:text-primary shadow-sm"
                >
                    <Palette size={18} />
                </button>
                <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all bg-bgSoft border-borderColor text-textSecondary hover:bg-bgCard hover:text-primary shadow-sm">
                    <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                </button>
            </div>
        }
    >
        <div className="animate-in fade-in duration-500 pb-32 pt-4 px-2">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-black text-textSecondary flex items-center gap-2">
                    <BookOpen size={20} className="text-primary"/> المواد الدراسية
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allSubjects.map((sub, idx) => (
                    <div key={idx} onClick={() => setSelectedSubject(sub)} className="glass-card group rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-borderColor cursor-pointer active:scale-[0.98] bg-bgCard">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-textPrimary mb-1">{sub.subject}</h3>
                                    <p className="text-textSecondary text-xs font-bold flex items-center gap-1">
                                        <History size={12} /> آخر تحديث: {formatDate(sub.lastUpdate)}
                                    </p>
                                </div>
                            </div>
                            <ChevronLeft size={24} className={`text-textSecondary group-hover:text-primary transition-colors ${dir === 'ltr' ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-bgSoft rounded-full overflow-hidden border border-borderColor">
                                <div className="h-full bg-success rounded-full" style={{ width: `${Math.min(100, (sub.totalPoints || 50) + 40)}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-success">{Math.min(100, (sub.totalPoints || 50) + 40)}%</span>
                        </div>
                    </div>
                ))}
                {allSubjects.length === 0 && (
                     <div className="col-span-full p-8 text-center text-textSecondary font-bold bg-bgSoft rounded-3xl border border-dashed border-borderColor">
                         لا توجد مواد مضافة حالياً.
                     </div>
                )}
            </div>
        </div>
    </PageLayout>
  );

  // =========================================================================
  // 4. شاشة تفاصيل المادة - 💉 معالجة وتغليف وتقليص الأحجام المبالغ فيها
  // =========================================================================
  const renderSubjectDetails = () => {
    const s = selectedSubject;
    const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
    const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
    const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];

    return (
        <PageLayout
            title={s.subject}
            subtitle="أداء الطالب خلال الأسابيع الماضية"
            showBackButton={true}
            onBack={() => setSelectedSubject(null)}
            
            icon={<BookOpen size={24} className="text-primary"/>}

            // 💉 الكبسولة العلوية الجميلة التي تحل محل الدائرة العملاقة
            rightActions={
                <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 px-3 py-1.5 rounded-xl shadow-sm">
                    <Trophy size={16} className="text-warning" />
                    <span className="text-sm font-black text-warning" dir="ltr">{s.totalPoints}</span>
                    <span className="text-[10px] font-bold text-warning/80">نقطة</span>
                </div>
            }
        >
            <div className="animate-in fade-in duration-500 pb-32 pt-4 px-2 space-y-6">
                
                {/* الإحصائيات (مصغرة ومدمجة) */}
                <section className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="glass-panel p-4 rounded-2xl shadow-sm border border-borderColor flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0"><Trophy size={20}/></div>
                        <div className="flex flex-col">
                            <p className="text-textSecondary text-[10px] font-bold">إجمالي النقاط</p>
                            <h3 className="text-lg font-black text-textPrimary leading-none">{s.totalPoints}</h3>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-2xl shadow-sm border border-borderColor flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Star size={20}/></div>
                        <div className="flex flex-col">
                            <p className="text-textSecondary text-[10px] font-bold">أيام الانضباط</p>
                            <h3 className="text-lg font-black text-textPrimary leading-none">{disciplineCount}</h3>
                        </div>
                    </div>
                </section>

                {/* زر التواصل الجديد (أنيق ومدمج بدلاً من العائم المزعج) */}
                <button onClick={() => setIsMessageOpen(true)} className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors">
                    <MessageSquare size={18} /> تواصل مع معلم المادة
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 💉 الإنجازات (تم تحويلها إلى أسطر مدمجة - Compact Rows) */}
                    <section className="glass-panel rounded-3xl p-5 border border-borderColor shadow-sm">
                        <h3 className="text-sm font-black text-textPrimary mb-4 flex items-center gap-2"><ThumbsUp size={16} className="text-success"/> إنجازات إيجابية</h3>
                        <div className="space-y-2">
                            {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-bgSoft border border-success/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-success shrink-0"></div>
                                        <h4 className="font-bold text-textPrimary text-xs">{b.description}</h4>
                                    </div>
                                    <span className="text-[9px] text-textSecondary font-bold bg-bgCard px-2 py-1 rounded-md">{formatDate(b.date)}</span>
                                </div>
                            )) : <p className="text-center text-xs text-textSecondary py-4 bg-bgSoft rounded-xl border border-dashed border-borderColor">- لا يوجد حالياً -</p>}
                        </div>
                    </section>

                    {/* 💉 الملاحظات (Compact Rows) */}
                    <section className="glass-panel rounded-3xl p-5 border border-borderColor shadow-sm">
                        <h3 className="text-sm font-black text-textPrimary mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-danger"/> تنبيهات وملاحظات</h3>
                        <div className="space-y-2">
                            {neg.length > 0 ? neg.map((b: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-bgSoft border border-danger/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-danger shrink-0"></div>
                                        <h4 className="font-bold text-textPrimary text-xs">{b.description}</h4>
                                    </div>
                                    <span className="text-[9px] text-textSecondary font-bold bg-bgCard px-2 py-1 rounded-md">{formatDate(b.date)}</span>
                                </div>
                            )) : <p className="text-center text-xs text-textSecondary py-4 bg-bgSoft rounded-xl border border-dashed border-borderColor">- لا يوجد تنبيهات -</p>}
                        </div>
                    </section>
                </div>

                <section className="glass-panel rounded-3xl p-5 border border-borderColor shadow-sm">
                    <h3 className="text-sm font-black text-textPrimary mb-4 flex items-center gap-2"><ClipboardList size={16} className="text-info"/> سجل الدرجات</h3>
                    <div className="rounded-2xl border border-borderColor overflow-hidden bg-bgCard">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-bgSoft text-textSecondary font-bold text-[10px] uppercase">
                                    <th className={`py-3 px-4 text-${dir === 'rtl' ? 'right' : 'left'}`}>الاختبار / الواجب</th>
                                    <th className="py-3 px-4 text-center">الدرجة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-borderColor">
                                {s.grades?.map((g: any, i: number) => (
                                    <tr key={i} className="hover:bg-bgSoft/50 transition-colors">
                                        <td className="py-3 px-4 font-bold text-textPrimary text-xs">{g.category}</td>
                                        <td className="py-3 px-4 text-center"><span className="text-sm font-black text-primary">{g.score}</span></td>
                                    </tr>
                                ))}
                                {(!s.grades || s.grades.length === 0) && (
                                    <tr><td colSpan={2} className="py-6 text-center text-xs text-textSecondary font-bold">لم يتم رصد درجات</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* نافذة المراسلة المنبثقة */}
            <DrawerSheet isOpen={isMessageOpen} onClose={() => setIsMessageOpen(false)} dir={dir} mode="bottom">
                <div className="flex flex-col w-full h-full p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-textPrimary flex items-center gap-2"><MessageSquare size={20} className="text-primary"/> رسالة لمعلم المادة</h3>
                    </div>
                    <textarea 
                        value={messageText} 
                        onChange={(e) => setMessageText(e.target.value)} 
                        placeholder="اكتب ملاحظاتك أو أعذار الغياب..." 
                        className="w-full flex-1 min-h-[150px] bg-bgSoft border border-borderColor rounded-xl p-4 text-sm font-bold resize-none outline-none focus:border-primary mb-4 text-textPrimary placeholder:text-textSecondary"
                    ></textarea>
                    <button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg} className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg">
                        {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال الرسالة <Send size={18}/></>}
                    </button>
                </div>
            </DrawerSheet>
        </PageLayout>
    );
  };

  // =========================================================================
  // 5. شاشة الإشعارات - 💉 معالجة وتغليف بالكبسولة الزجاجية
  // =========================================================================
  const renderNotifications = () => {
    let alerts: any[] = [];
    allSubjects.forEach(sub => {
      sub.behaviors?.filter((b:any)=> b.type === 'negative').forEach((b:any) => alerts.push({...b, subject: sub.subject, kind: 'alert'}));
      sub.grades?.forEach((g:any) => alerts.push({...g, subject: sub.subject, kind: 'grade'}));
    });

    return (
        <PageLayout
            title="الإشعارات والتنبيهات"
            subtitle="ابقَ على اطلاع دائم بتحديثات الطالب"
            icon={<Bell size={24} className="text-primary" />}
        >
            <div className="animate-in fade-in duration-500 pb-32 pt-4 px-2 max-w-2xl mx-auto">
                <div className="flex p-1 bg-bgSoft border border-borderColor rounded-xl mb-6 shadow-sm">
                    <button onClick={() => setActiveAlertTab('all')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeAlertTab === 'all' ? 'bg-bgCard text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}>الكل</button>
                    <button onClick={() => setActiveAlertTab('urgent')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeAlertTab === 'urgent' ? 'bg-danger/10 text-danger shadow-sm' : 'text-textSecondary hover:text-textPrimary'}`}>تنبيهات سلوكية</button>
                </div>

                <div className="space-y-3">
                    {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
                        <div key={idx} className="glass-card bg-bgCard rounded-2xl p-4 shadow-sm border border-borderColor transition-all hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-start gap-3">
                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${item.kind === 'alert' ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'}`}>
                                    {item.kind === 'alert' ? <AlertTriangle size={20} /> : <ClipboardList size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.kind === 'alert' ? 'bg-danger/5 text-danger border border-danger/10' : 'bg-info/5 text-info border border-info/10'} truncate`}>{item.subject}</span>
                                        <span className="text-[10px] text-textSecondary font-bold shrink-0">{formatDate(item.date)}</span>
                                    </div>
                                    <h3 className="font-black text-sm text-textPrimary mb-1">{item.kind === 'alert' ? 'تنبيه سلوكي' : 'تحديث درجة'}</h3>
                                    <p className="text-xs text-textSecondary font-bold leading-snug">{item.description || `تم رصد درجة: ${item.category} (${item.score})`}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {alerts.length === 0 && (
                        <div className="text-center bg-bgSoft border border-dashed border-borderColor rounded-3xl p-8">
                            <Bell size={32} className="mx-auto text-textSecondary opacity-30 mb-3" />
                            <p className="text-sm font-bold text-textSecondary">لا توجد إشعارات حالياً</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
  };

  // =========================================================================
  // 6. شاشة الملف الشخصي - 💉 معالجة وتغليف
  // =========================================================================
  const renderProfile = () => (
    <PageLayout
        title="حسابي"
        subtitle="إعدادات الحساب وتسجيل الخروج"
        icon={<User size={24} className="text-primary"/>}
    >
        <div className="animate-in fade-in duration-500 pb-32 pt-4 px-2 max-w-sm mx-auto">
            <div className="glass-panel bg-bgCard rounded-[2rem] p-6 shadow-sm border border-borderColor text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[1.5rem] mx-auto flex items-center justify-center text-primary mb-4 shadow-inner">
                    <User size={32} />
                </div>
                <h3 className="text-lg font-black text-textPrimary mb-1">ولي أمر الطالب</h3>
                <p className="text-textSecondary text-sm font-bold bg-bgSoft py-2 px-4 rounded-xl border border-borderColor inline-block">{allSubjects[0]?.name}</p>
            </div>

            <button onClick={handleLogout} className="w-full bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm">
                <LogOut size={18} /> تسجيل الخروج
            </button>

            <div className="mt-12 text-center opacity-60">
                <p className="text-textSecondary text-[10px] font-bold mb-1">برمجة وتطوير</p>
                <div className="flex items-center justify-center gap-1.5">
                    <Code size={12} className="text-textPrimary" />
                    <span className="text-textPrimary text-[11px] font-black tracking-widest uppercase">ALZAABI MOHAMMAD</span>
                </div>
            </div>
        </div>
    </PageLayout>
  );

  return (
    <div className="min-h-[100dvh] bg-bgMain font-sans text-textPrimary relative overflow-hidden transition-colors duration-500" dir={dir}>
      {/* 💉 عرض المحتوى حسب التاب النشط */}
      <div className="h-full overflow-y-auto custom-scrollbar">
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : renderSubjectDetails())}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* 💉 شريط التنقل السفلي (Bottom Nav) - أصبح يظهر دائماً للسهولة */}
      <nav className="fixed bottom-0 left-0 w-full z-[90] flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 bg-bgCard/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] border-t border-borderColor transition-colors duration-500">
        <button onClick={() => { setCurrentTab('home'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'home' ? 'text-primary scale-110 -translate-y-1' : 'text-textSecondary hover:text-textPrimary'}`}>
          <LayoutGrid size={22} className={currentTab === 'home' ? 'fill-primary/20' : ''} />
          <span className="text-[9px] font-black mt-1">الرئيسية</span>
        </button>
        
        <button onClick={() => { setCurrentTab('alerts'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 relative ${currentTab === 'alerts' ? 'text-primary scale-110 -translate-y-1' : 'text-textSecondary hover:text-textPrimary'}`}>
          <Bell size={22} className={currentTab === 'alerts' ? 'fill-primary/20' : ''} />
          <span className="absolute top-1 right-3 w-2 h-2 bg-danger rounded-full border border-bgCard"></span>
          <span className="text-[9px] font-black mt-1">إشعارات</span>
        </button>

        <button onClick={() => { setCurrentTab('profile'); setSelectedSubject(null); }} className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${currentTab === 'profile' ? 'text-primary scale-110 -translate-y-1' : 'text-textSecondary hover:text-textPrimary'}`}>
          <User size={22} className={currentTab === 'profile' ? 'fill-primary/20' : ''} />
          <span className="text-[9px] font-black mt-1">حسابي</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
