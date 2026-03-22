import React, { useState, useEffect } from 'react';
import RamadanTheme from './components/RamadanTheme'; 
import { 
  QrCode, ArrowLeft, Loader2, 
  LogOut, Trophy, ThumbsUp, ThumbsDown, BookOpen, ChevronLeft, 
  GraduationCap, MessageSquare, Send, X, Code, User, RefreshCw, HeartHandshake,
  Star 
} from 'lucide-react';

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

function App() {
  const [civilID, setCivilID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // إبقاء الثيم يعمل في الخلفية فقط
  const isRamadan = true;

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
          setTimeout(() => { setShowWelcomeScreen(false); }, 2500);
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
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSendingMsg(true);
    const payload = {
      action: "sendMessage",
      civilID: civilID,
      studentName: selectedSubject.name,
      schoolName: selectedSubject.schoolName || "مدرسة غير محددة",
      subject: selectedSubject.subject,
      message: messageText.trim()
    };

    try {
      const response = await fetch(GOOGLE_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('تم إرسال رسالتك للمعلم بنجاح! ✅');
        setMessageText('');
        setIsMessageOpen(false);
      }
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال. تأكد من الاتصال بالإنترنت.');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // 1. شاشة الشكر
  if (showWelcomeScreen && allSubjects.length > 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 font-sans text-center relative overflow-hidden animate-in fade-in duration-500 bg-gradient-to-br from-[#1e3a8a] to-blue-700" dir="rtl">
        {isRamadan && <div className="absolute inset-0 opacity-50 pointer-events-none"><RamadanTheme /></div>}
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-6 rounded-full mb-8 animate-pulse bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <HeartHandshake size={72} className="text-amber-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">شكراً لاهتمامك!</h1>
          <p className="text-blue-100 text-lg font-bold leading-relaxed max-w-xs">
             متابعتك المستمرة هي سر نجاح وتفوق الطالب
             <span className="block mt-4 text-2xl font-black py-2 px-4 rounded-2xl shadow-inner text-amber-500 bg-white border border-white/20">
               {allSubjects[0].name}
             </span>
          </p>
        </div>
      </div>
    );
  }

  // 2. واجهة اختيار المادة 
  if (allSubjects.length > 0 && !selectedSubject) {
    return (
      <div className="h-screen flex flex-col font-sans overflow-hidden relative bg-slate-50" dir="rtl">
        {/* الثيم بشفافية عالية لكي لا يزعج القراءة */}
        {isRamadan && <div className="absolute inset-0 opacity-20 pointer-events-none"><RamadanTheme /></div>}
        
        <div className="px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg shrink-0 relative z-20 bg-gradient-to-br from-[#1e3a8a] to-blue-600">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/30 bg-white/20 backdrop-blur-md">
              <User size={32} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold mb-1 text-blue-200">ولي أمر الطالب:</p>
              <h1 className="text-2xl font-black text-white">{allSubjects[0].name}</h1>
              <div className="inline-block mt-1 text-[10px] font-black px-3 py-1 rounded-full bg-amber-400 text-amber-900 shadow-sm">
                الصف: {allSubjects[0].className}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6 flex justify-between items-center relative z-20">
          <h2 className="text-lg font-black text-slate-800">المواد الدراسية</h2>
          <div className="flex gap-3">
            <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className="p-3 rounded-xl border bg-white border-slate-200 text-blue-600 shadow-sm active:scale-95">
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={handleLogout} className="p-3 rounded-xl border bg-white border-slate-200 text-rose-500 shadow-sm active:scale-95">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 mt-4 pb-20 space-y-4 relative z-20 custom-scrollbar">
          {allSubjects.map((sub, idx) => (
            <button key={idx} onClick={() => setSelectedSubject(sub)} className="w-full p-5 rounded-[1.5rem] flex justify-between items-center bg-white shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
                  <GraduationCap size={26} />
                </div>
                <div className="text-right">
                  <h3 className="font-black text-base text-slate-800">{sub.subject}</h3>
                  <p className="text-[11px] font-semibold mt-1 flex items-center gap-1 text-slate-400">
                    <RefreshCw size={10} /> {formatDate(sub.lastUpdate)}
                  </p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. لوحة قيادة المادة
  if (selectedSubject) {
    const s = selectedSubject;
    const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
    const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
    const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];
    const absenceCount = s.attendance?.filter((a: any) => a.status === 'absent').length || 0;
    const truantCount = s.attendance?.filter((a: any) => a.status === 'truant').length || 0;

    return (
      <div className="h-screen flex flex-col font-sans relative overflow-hidden bg-slate-50 text-slate-800" dir="rtl">
        {isRamadan && <div className="absolute inset-0 opacity-20 pointer-events-none"><RamadanTheme /></div>}

        {isMessageOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-[2rem] p-6 bg-white shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black flex items-center gap-2 text-[#1e3a8a]">
                  <MessageSquare className="w-5 h-5"/> رسالة للمعلم
                </h3>
                <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X size={18}/></button>
              </div>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="اكتب ملاحظاتك أو استفسارك هنا..." className="w-full h-32 border border-slate-200 rounded-xl p-4 mb-4 bg-slate-50 outline-none focus:border-[#1e3a8a] resize-none"></textarea>
              <button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg} className="w-full py-3.5 rounded-xl font-black bg-[#1e3a8a] text-white flex justify-center gap-2 shadow-lg disabled:opacity-50">
                {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال <Send size={18} /></>}
              </button>
            </div>
          </div>
        )}

        <div className="px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg relative z-20 bg-[#1e3a8a] text-white">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedSubject(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-black">{s.subject}</h1>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-amber-400">{s.name}</h2>
          </div>
        </div>

        <div className="px-5 -mt-4 space-y-5 flex-1 overflow-y-auto pt-8 pb-32 relative z-20">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-2"><Trophy size={14}/><span className="text-xs font-bold">التميز</span></div>
              <div className="text-2xl font-black text-[#1e3a8a]">{s.totalPoints}</div>
            </div>
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-slate-100 text-center relative overflow-hidden">
              <Star size={40} className="absolute -top-2 -right-2 text-amber-100" />
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-2 relative z-10"><Star size={14} fill="currentColor" /><span className="text-xs font-bold">الانضباط</span></div>
              <div className="text-2xl font-black text-amber-500 relative z-10">{disciplineCount}</div>
            </div>
          </div>

          {(absenceCount > 0 || truantCount > 0) && (
            <div className="flex gap-4">
              <div className="flex-1 rounded-2xl p-4 bg-white shadow-sm border border-rose-100 text-center">
                <span className="text-xs font-bold text-slate-500 block mb-1">أيام الغياب</span>
                <span className="text-xl font-black text-rose-500">{absenceCount}</span>
              </div>
              <div className="flex-1 rounded-2xl p-4 bg-white shadow-sm border border-purple-100 text-center">
                <span className="text-xs font-bold text-slate-500 block mb-1">مرات التسرب</span>
                <span className="text-xl font-black text-purple-600">{truantCount}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="rounded-2xl p-4 bg-white shadow-sm border border-emerald-100">
                <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2 text-emerald-600"><ThumbsUp size={14}/><h3 className="font-bold text-xs">إنجازات</h3></div>
                {displayPos.length > 0 ? displayPos.map((b: any, i: number) => <div key={i} className="bg-emerald-50 p-2 rounded-lg mb-2 text-[10px] font-bold text-emerald-900">{b.description}</div>) : <div className="text-center text-[10px] text-slate-400 py-2">- لا يوجد -</div>}
             </div>
             <div className="rounded-2xl p-4 bg-white shadow-sm border border-rose-100">
                <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2 text-rose-600"><ThumbsDown size={14}/><h3 className="font-bold text-xs">تنبيهات</h3></div>
                {neg.length > 0 ? neg.map((b: any, i: number) => <div key={i} className="bg-rose-50 p-2 rounded-lg mb-2 text-[10px] font-bold text-rose-900">{b.description}</div>) : <div className="text-center text-[10px] text-slate-400 py-2">- لا يوجد -</div>}
             </div>
          </div>

          <div className="rounded-3xl p-5 bg-white shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-[#1e3a8a]"><BookOpen size={18}/><h3 className="font-black">سجل الدرجات</h3></div>
            {s.grades?.map((g: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                <span className="text-xs font-bold text-slate-600">{g.category}</span>
                <span className="font-black text-sm text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-lg">{g.score}</span>
              </div>
            ))}
            {(!s.grades || s.grades.length === 0) && (
              <div className="text-center text-xs font-bold text-slate-400 py-4">لم يتم رصد درجات بعد</div>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
          <button onClick={() => setIsMessageOpen(true)} className="pointer-events-auto w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-full font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
            <MessageSquare size={18} /> تواصل مع المعلم
          </button>
        </div>
      </div>
    );
  }

  // 4. تسجيل الدخول
  return (
    <div className="min-h-screen flex flex-col justify-between items-center p-6 font-sans relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]" dir="rtl">
      {isRamadan && <div className="absolute inset-0 opacity-40 pointer-events-none"><RamadanTheme /></div>}
      
      <div className="w-full flex-1 flex flex-col justify-center items-center relative z-20">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl relative overflow-hidden">
            <QrCode className="w-12 h-12 text-amber-400 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent"></div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">راصد لولي الأمر</h1>
          <p className="text-blue-200 text-sm font-bold">بوابة متابعة الطالب</p>
        </div>

        <div className="w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative bg-white">
          {isLoading && !civilID ? (
             <div className="flex flex-col items-center justify-center py-8">
               <Loader2 className="animate-spin text-[#1e3a8a] w-10 h-10 mb-4" />
               <p className="text-sm font-bold text-slate-500">جاري تسجيل الدخول...</p>
             </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="number" value={civilID} onChange={(e) => setCivilID(e.target.value)} placeholder="أدخل الرقم المدني" className="w-full border-2 border-slate-200 rounded-xl p-4 text-center text-xl font-black tracking-widest bg-slate-50 text-[#1e3a8a] outline-none focus:border-amber-400" />
              {error && <div className="text-xs font-bold text-rose-500 text-center bg-rose-50 p-2 rounded-lg">{error}</div>}
              <button type="submit" disabled={isLoading || !civilID} className="w-full py-4 rounded-xl font-black bg-gradient-to-l from-[#1e3a8a] to-blue-700 text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                {isLoading ? <Loader2 className="animate-spin" /> : <>دخول <ArrowLeft size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="pt-8 text-center relative z-20">
        <div className="flex items-center justify-center gap-1.5 opacity-80">
          <Code size={14} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Mohammed Alzaabi</span>
        </div>
      </div>
    </div>
  );
}

export default App;
