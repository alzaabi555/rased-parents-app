import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, LogOut, Trophy, ThumbsUp, ThumbsDown, BookOpen, ChevronLeft, 
  GraduationCap, MessageSquare, Send, X, Code, User, RefreshCw, HeartHandshake,
  Star, School, Fingerprint, Lock, LayoutGrid, BarChart3, Bell, AlertTriangle, 
  ClipboardList, Info, Calendar, History
} from 'lucide-react';

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

function App() {
  // ================= الحالات الأساسية للتطبيق =================
  const [civilID, setCivilID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  
  // ================= حالات التنقل والواجهات =================
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'grades' | 'alerts' | 'profile'>('home');
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
        setAllSubjects(result.subjects);
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
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // =========================================================================
  // 1. شاشة تسجيل الدخول (التصميم الزجاجي المتدرج)
  // =========================================================================
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
                <label className="block text-xs font-bold text-white/90 px-1 text-right">الرقم المدني</label>
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
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>دخول آمن</span><ArrowLeft className="w-5 h-5 rotate-180" /></>}
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

  // =========================================================================
  // 3. محتوى التطبيق الرئيسي (حسب التاب النشط)
  // =========================================================================
  
  const renderDashboard = () => (
    <div className="animate-in fade-in duration-500 pb-32">
      {/* الهيدر الفخم */}
      <section className="relative px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-16 bg-gradient-to-br from-[#000666] to-[#1a237e] rounded-b-[2rem] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8690ee] rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
          <div className="w-28 h-28 rounded-[2rem] bg-white/10 border-4 border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <User size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-3 leading-tight">{allSubjects[0]?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold">
                <School size={14} className="ml-1" /> الصف: {allSubjects[0]?.className}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* قائمة المواد */}
      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-20">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-black text-[#191c1e] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#000666] rounded-full"></span> المواد الدراسية
          </h2>
          <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className="p-2 bg-white rounded-full shadow-sm text-[#000666]">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSubjects.map((sub, idx) => (
            <div key={idx} onClick={() => setSelectedSubject(sub)} className="group bg-white rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#000666]/10 cursor-pointer active:scale-[0.98]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#000666] group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">{sub.subject}</h3>
                    <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                      <History size={12} /> آخر تحديث: {formatDate(sub.lastUpdate)}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={24} className="text-slate-300 group-hover:text-[#000666] transition-colors" />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  {/* شريط نسبة وهمي للجمالية كما في التصميم */}
                  <div className="h-full bg-[#1b6d24] rounded-full" style={{ width: `${Math.min(100, (sub.totalPoints || 50) + 40)}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-[#1b6d24]">{Math.min(100, (sub.totalPoints || 50) + 40)}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderSubjectDetails = () => {
    const s = selectedSubject;
    const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
    const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
    const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];

    return (
      <div className="animate-in slide-in-from-left-4 duration-300 pb-32">
        <header className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-lg shadow-sm border-b border-slate-100 px-6 py-[env(safe-area-inset-top)] pb-4 flex items-center justify-between">
          <button onClick={() => setSelectedSubject(null)} className="p-2 rounded-full hover:bg-slate-200 text-[#000666] transition-colors"><ArrowLeft size={24}/></button>
          <h1 className="text-lg font-black text-[#000666]">{s.subject}</h1>
          <div className="w-10"></div>
        </header>

        <main className="max-w-4xl mx-auto px-6 mt-6 space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#000666] to-[#1a237e] p-8 text-white shadow-xl">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">الفصل الحالي</span>
                <h1 className="text-3xl font-black mt-3">{s.subject}</h1>
                <p className="text-indigo-200 mt-1 text-sm font-bold">أداء الطالب خلال الأسابيع الماضية</p>
              </div>
              <div className="h-20 w-20 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md shrink-0">
                <div className="text-center">
                  <span className="block text-2xl font-black">{s.totalPoints}</span>
                  <span className="text-[9px] uppercase font-bold opacity-80">نقطة</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-3"><Trophy size={24}/></div>
              <p className="text-slate-500 text-xs font-bold">إجمالي النقاط</p>
              <h3 className="text-2xl font-black text-[#000666]">{s.totalPoints}</h3>
            </div>
            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3"><Star size={24}/></div>
              <p className="text-slate-500 text-xs font-bold">أيام الانضباط</p>
              <h3 className="text-2xl font-black text-[#000666]">{disciplineCount}</h3>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <h3 className="text-lg font-black text-[#000666] px-2">إنجازات إيجابية</h3>
              <div className="space-y-3">
                {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                  <div key={i} className="bg-green-50/50 p-4 rounded-2xl border-r-4 border-green-500 flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-xl text-green-600 shrink-0"><ThumbsUp size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{b.description}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block font-bold">{formatDate(b.date)}</span>
                    </div>
                  </div>
                )) : <p className="text-center text-xs text-slate-400 py-4">- لا يوجد حالياً -</p>}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-black text-[#000666] px-2">تنبيهات وملاحظات</h3>
              <div className="space-y-3">
                {neg.length > 0 ? neg.map((b: any, i: number) => (
                  <div key={i} className="bg-red-50/50 p-4 rounded-2xl border-r-4 border-red-500 flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0"><AlertTriangle size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{b.description}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block font-bold">{formatDate(b.date)}</span>
                    </div>
                  </div>
                )) : <p className="text-center text-xs text-slate-400 py-4">- لا يوجد تنبيهات -</p>}
              </div>
            </section>
          </div>

          <section className="space-y-4 pb-10">
            <h3 className="text-lg font-black text-[#000666] px-2">سجل الدرجات</h3>
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold text-xs">
                    <th className="py-4 px-5 text-right">الاختبار / الواجب</th>
                    <th className="py-4 px-5 text-center">الدرجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {s.grades?.map((g: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-4 px-5 font-bold text-slate-800 text-sm">{g.category}</td>
                      <td className="py-4 px-5 text-center"><span className="text-base font-black text-[#000666]">{g.score}</span></td>
                    </tr>
                  ))}
                  {(!s.grades || s.grades.length === 0) && (
                    <tr><td colSpan={2} className="py-6 text-center text-xs text-slate-400 font-bold">لم يتم رصد درجات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <div className="fixed bottom-24 left-0 w-full px-6 flex justify-center z-40 pointer-events-none pb-[env(safe-area-inset-bottom)]">
          <button onClick={() => setIsMessageOpen(true)} className="pointer-events-auto bg-[#000666] text-white px-8 py-4 rounded-full shadow-2xl shadow-[#000666]/40 flex items-center gap-3 active:scale-95 transition-all border border-indigo-500">
            <MessageSquare size={20} />
            <span className="font-black text-sm">تواصل مع المعلم</span>
          </button>
        </div>

        {/* نافذة المراسلة المنبثقة */}
        {isMessageOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-[#000666] flex items-center gap-2"><MessageSquare size={20}/> رسالة للمعلم</h3>
                <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X size={18}/></button>
              </div>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="اكتب ملاحظاتك أو أعذار الغياب..." className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold resize-none outline-none focus:border-[#000666] mb-4"></textarea>
              <button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg} className="w-full bg-[#000666] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all">
                {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال <Send size={18}/></>}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    // تجميع التنبيهات من كل المواد لبناء شاشة الإشعارات
    let alerts: any[] = [];
    allSubjects.forEach(sub => {
      sub.behaviors?.filter((b:any)=> b.type === 'negative').forEach((b:any) => alerts.push({...b, subject: sub.subject, kind: 'alert'}));
      sub.grades?.forEach((g:any) => alerts.push({...g, subject: sub.subject, kind: 'grade'}));
    });

    return (
      <div className="animate-in fade-in duration-500 pb-32 max-w-xl mx-auto px-6">
        <section className="py-8 pt-[calc(env(safe-area-inset-top)+2rem)] space-y-2">
          <h2 className="font-black text-3xl tracking-tight text-[#000666]">إشعاراتك</h2>
          <p className="text-slate-500 text-xs font-bold">ابقَ على اطلاع دائم بتحديثات الطالب.</p>
        </section>

        <nav className="flex p-1.5 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
          <button onClick={() => setActiveAlertTab('all')} className={`flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all duration-300 ${activeAlertTab === 'all' ? 'bg-[#000666] text-white shadow-md' : 'text-slate-500 hover:text-[#000666]'}`}>الكل</button>
          <button onClick={() => setActiveAlertTab('urgent')} className={`flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all duration-300 ${activeAlertTab === 'urgent' ? 'bg-[#000666] text-white shadow-md' : 'text-slate-500 hover:text-[#000666]'}`}>عاجل (تنبيهات)</button>
        </nav>

        <div className="space-y-4">
          {/* كروت بصرية كما في التصميم */}
          <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="bg-[#a0f399]/30 rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden border border-[#1b6d24]/20">
              <Trophy size={60} className="text-[#1b6d24] opacity-10 absolute -bottom-2 -left-2" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1b6d24]">إنجاز عام</span>
              <p className="font-black text-[#005312] leading-tight text-sm">أداء ممتاز في أغلب المواد</p>
            </div>
            <div className="bg-[#ffdad6]/50 rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden border border-[#ba1a1a]/20">
              <Calendar size={60} className="text-[#ba1a1a] opacity-10 absolute -bottom-2 -left-2" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ba1a1a]">تذكير</span>
              <p className="font-black text-[#93000a] leading-tight text-sm">راجع تفاصيل التنبيهات الأخيرة</p>
            </div>
          </div>

          {/* قائمة الإشعارات الديناميكية */}
          {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${item.kind === 'alert' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-[#000666]'}`}>
                  {item.kind === 'alert' ? <AlertTriangle size={24} /> : <ClipboardList size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] font-black uppercase ${item.kind === 'alert' ? 'text-red-500' : 'text-[#000666]'}`}>{item.subject}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="font-black text-sm text-slate-800 mb-1">{item.kind === 'alert' ? 'تنبيه سلوكي' : 'تحديث درجة'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{item.description || `تم رصد درجة: ${item.category} (${item.score})`}</p>
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && <p className="text-center text-sm font-bold text-slate-400 py-10">لا توجد إشعارات حالياً</p>}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="animate-in fade-in duration-500 pb-32 max-w-xl mx-auto px-6 pt-[calc(env(safe-area-inset-top)+2rem)]">
       <h2 className="font-black text-3xl tracking-tight text-[#000666] mb-8">حسابي</h2>
       <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto flex items-center justify-center text-[#000666] mb-4">
            <User size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-1">ولي أمر الطالب</h3>
          <p className="text-slate-500 text-sm font-bold mb-8">{allSubjects[0]?.name}</p>
          
          <button onClick={handleLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors">
            <LogOut size={20} /> تسجيل الخروج
          </button>
       </div>
       <div className="mt-12 text-center opacity-60">
            <p className="text-slate-500 text-[10px] font-bold mb-1">برمجة وتطوير</p>
            <div className="flex items-center justify-center gap-1.5">
              <Code size={12} className="text-[#000666]" />
              <span className="text-[#000666] text-[11px] font-black tracking-widest uppercase">ALZAABI MOHAMMAD</span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#f7f9fc] font-sans text-slate-800 relative overflow-hidden" dir="rtl">
      {/* عرض المحتوى حسب التاب */}
      <div className="h-full overflow-y-auto custom-scrollbar">
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : renderSubjectDetails())}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* شريط التنقل السفلي (Bottom Nav) */}
      {!selectedSubject && (
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 bg-white/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem] border-t border-slate-100">
          <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center justify-center px-6 py-2 transition-all duration-300 ${currentTab === 'home' ? 'text-[#000666] scale-110' : 'text-slate-400 hover:text-[#000666]'}`}>
            <LayoutGrid size={24} className={currentTab === 'home' ? 'fill-indigo-100' : ''} />
            <span className="text-[10px] font-black mt-1">الرئيسية</span>
          </button>
          
          <button onClick={() => setCurrentTab('alerts')} className={`flex flex-col items-center justify-center px-6 py-2 transition-all duration-300 relative ${currentTab === 'alerts' ? 'text-[#000666] scale-110' : 'text-slate-400 hover:text-[#000666]'}`}>
            <Bell size={24} className={currentTab === 'alerts' ? 'fill-indigo-100' : ''} />
            <span className="absolute top-1 right-5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            <span className="text-[10px] font-black mt-1">إشعارات</span>
          </button>

          <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center justify-center px-6 py-2 transition-all duration-300 ${currentTab === 'profile' ? 'text-[#000666] scale-110' : 'text-slate-400 hover:text-[#000666]'}`}>
            <User size={24} className={currentTab === 'profile' ? 'fill-indigo-100' : ''} />
            <span className="text-[10px] font-black mt-1">حسابي</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;