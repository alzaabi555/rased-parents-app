import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, LogOut, BookOpen, ChevronLeft, 
  MessageSquare, Send, X, Code, User, RefreshCw, HeartHandshake,
  School, Fingerprint, LayoutGrid, Bell, AlertTriangle, 
  ClipboardList, History
} from 'lucide-react';
import { GlassLayout } from './components/GlassLayout';
import { SubjectDetails } from './components/SubjectDetails';

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

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
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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

  const renderDashboard = () => (
    <div className="animate-in fade-in duration-500 h-full">
      <GlassLayout
        title={allSubjects[0]?.name || 'الطالب'}
        subtitle={`الصف: ${allSubjects[0]?.className || '...'}`}
        icon={<User size={24} />}
        rightAction={
          <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#000666] active:scale-95 transition-all shadow-sm">
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        }
      >
        <h2 className="text-sm font-black text-[#000666] flex items-center gap-2 mb-4 px-1">
          <BookOpen size={18} className="text-[#000666]"/> المواد الدراسية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSubjects.map((sub, idx) => (
            <div key={idx} onClick={() => setSelectedSubject(sub)} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:border-[#000666]/30 cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#000666]">
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
                  <div className="h-full bg-[#1b6d24] rounded-full" style={{ width: `${Math.min(100, (sub.totalPoints || 50) + 40)}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-[#1b6d24]">{Math.min(100, (sub.totalPoints || 50) + 40)}%</span>
              </div>
            </div>
          ))}
          {allSubjects.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-3xl border border-dashed border-slate-300">
               لا توجد مواد مضافة حالياً.
            </div>
          )}
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
        <GlassLayout
          title="الإشعارات والتنبيهات"
          icon={<Bell size={24} />}
        >
          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6 shadow-sm">
            <button onClick={() => setActiveAlertTab('all')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeAlertTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>الكل</button>
            <button onClick={() => setActiveAlertTab('urgent')} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeAlertTab === 'urgent' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>تنبيهات سلوكية</button>
          </div>

          <div className="space-y-3">
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${item.kind === 'alert' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-[#000666]'}`}>
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
              <div className="text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8">
                <Bell size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </div>
        </GlassLayout>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="animate-in fade-in duration-500 h-full">
      <GlassLayout
          title="حسابي"
          icon={<User size={24} />}
      >
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
    // 💉 إزالة overflow-y-auto من الحاوية الخارجية ليتمكن الهيدر الزجاجي من التثبيت!
    <div className="h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 relative overflow-hidden transition-colors duration-500" dir="rtl">
      
      {/* عرض المحتوى حسب التاب النشط - كل مكون يعالج تمريره بنفسه بفضل GlassLayout */}
      <div className="h-full w-full">
        {currentTab === 'home' && (!selectedSubject ? renderDashboard() : <SubjectDetails subjectData={selectedSubject} onBack={() => setSelectedSubject(null)} onOpenMessage={() => setIsMessageOpen(true)} formatDate={formatDate} />)}
        {currentTab === 'alerts' && renderNotifications()}
        {currentTab === 'profile' && renderProfile()}
      </div>

      {/* 💉 شريط التنقل السفلي */}
      <nav className="fixed bottom-0 left-0 w-full z-[90] flex justify-around items-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 bg-white/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] border-t border-slate-200 transition-colors duration-500">
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
