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
      <div className={`h-screen flex flex-col items-center justify-center p-6 font-sans text-center relative overflow-hidden animate-in fade-in duration-500 ${isRamadan ? 'bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]' : 'bg-gradient-to-br from-[#1e3a8a] to-blue-700'}`} dir="rtl">
        {isRamadan && <RamadanTheme />}
        <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
          <div className={`p-6 rounded-full mb-8 animate-pulse ${isRamadan ? 'bg-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.3)]' : 'bg-white/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]'}`}>
            <HeartHandshake size={72} className="text-amber-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">شكراً لاهتمامك!</h1>
          <p className="text-indigo-200 text-lg font-bold leading-relaxed max-w-xs">
             متابعتك المستمرة هي سر نجاح وتفوق الطالب
             <span className={`block mt-4 text-2xl font-black py-2 px-4 rounded-2xl shadow-inner ${isRamadan ? 'text-amber-300 bg-white/5 border border-white/10' : 'text-amber-400 bg-white/10'}`}>
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
      <div className={`h-screen flex flex-col font-sans overflow-hidden animate-in fade-in duration-500 relative ${isRamadan ? 'bg-[#0f172a]' : 'bg-slate-50'}`} dir="rtl">
        {isRamadan && <RamadanTheme />}
        
        <div className={`px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden z-20 ${isRamadan ? 'bg-[#1e1b4b] border-b border-indigo-500/20' : 'bg-gradient-to-br from-[#1e3a8a] to-blue-600'}`}>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md ${isRamadan ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/20 border-white/30'}`}>
              <User size={32} className={isRamadan ? 'text-amber-400' : 'text-white'} />
            </div>
            <div>
              <p className={`text-xs font-bold mb-1 ${isRamadan ? 'text-indigo-300' : 'text-blue-200'}`}>ولي أمر الطالب:</p>
              <h1 className="text-2xl font-black text-white">{allSubjects[0].name}</h1>
              <div className={`inline-block mt-1 text-[10px] font-black px-3 py-1 rounded-full ${isRamadan ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-400 text-amber-900'}`}>
                الصف: {allSubjects[0].className}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6 flex justify-between items-center shrink-0 relative z-20">
          <h2 className={`text-lg font-black ${isRamadan ? 'text-white' : 'text-slate-800'}`}>المواد الدراسية</h2>
          <div className="flex gap-3">
            <button onClick={() => fetchStudentData(civilID, true)} disabled={isRefreshing} className={`p-3 rounded-xl border transition-all ${isRamadan ? 'bg-indigo-900/50 border-indigo-500/30 text-indigo-300' : 'bg-white text-blue-600'}`}>
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={handleLogout} className={`p-3 rounded-xl border transition-all ${isRamadan ? 'bg-rose-900/30 border-rose-500/30 text-rose-400' : 'bg-white text-rose-500'}`}>
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 mt-4 pb-20 space-y-4 relative z-20 custom-scrollbar">
          {allSubjects.map((sub, idx) => (
            <button key={idx} onClick={() => setSelectedSubject(sub)} className={`w-full p-5 rounded-[1.5rem] flex justify-between items-center transition-all border ${isRamadan ? 'bg-white/5 border-white/10 text-white' : 'bg-white text-slate-700'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isRamadan ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-50 text-blue-600'}`}>
                  <GraduationCap size={26} />
                </div>
                <div className="text-right">
                  <h3 className="font-black text-base">{sub.subject}</h3>
                  <p className="text-[11px] font-semibold mt-1 flex items-center gap-1 text-slate-400">
                    <RefreshCw size={10} /> {formatDate(sub.lastUpdate)}
                  </p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-slate-400" />
            </button>
          ))}
        </div>
        
        <div className={`py-4 text-center shrink-0 border-t relative z-20 ${isRamadan ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
            <div className="flex items-center justify-center gap-1.5">
              <Code size={12} className="text-amber-500" />
              <span className="text-amber-500/80 text-[11px] font-black tracking-widest uppercase">Mohammed Alzaabi</span>
            </div>
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
      <div className={`h-screen flex flex-col font-sans relative overflow-hidden ${isRamadan ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
        {isRamadan && <RamadanTheme />}

        {isMessageOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-[2rem] p-6 border ${isRamadan ? 'bg-[#1e293b] border-white/10' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-black flex items-center gap-2 ${isRamadan ? 'text-amber-400' : 'text-[#1e3a8a]'}`}>
                  <MessageSquare className="w-5 h-5"/> رسالة للمعلم
                </h3>
                <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={18}/></button>
              </div>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} className={`w-full h-32 border rounded-xl p-4 mb-4 ${isRamadan ? 'bg-black/20 text-white' : 'bg-slate-50'}`}></textarea>
              <button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg} className="w-full py-3.5 rounded-xl font-black bg-amber-500 text-white">إرسال</button>
            </div>
          </div>
        )}

        <div className={`px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg relative z-20 ${isRamadan ? 'bg-[#1e1b4b] border-b border-indigo-500/20' : 'bg-[#1e3a8a] text-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedSubject(null)} className="p-2 bg-white/5 rounded-xl"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-black">{s.subject}</h1>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-amber-400">{s.name}</h2>
          </div>
        </div>

        <div className="px-5 -mt-4 space-y-5 flex-1 overflow-y-auto pt-8 pb-32 relative z-20">
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-3xl p-5 border ${isRamadan ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
              <span className="text-xs">نقاط التميز</span>
              <div className="text-xl font-black text-blue-400">{s.totalPoints}</div>
            </div>
            <div className={`rounded-3xl p-5 border ${isRamadan ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
              <span className="text-xs">أيام الانضباط</span>
              <div className="text-xl font-black text-amber-400">{disciplineCount}</div>
            </div>
          </div>

          <div className={`rounded-3xl p-5 border ${isRamadan ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
            <h3 className="font-black mb-4">سجل الدرجات</h3>
            {s.grades?.map((g: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm">{g.category}</span>
                <span className="font-black text-amber-400">{g.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
          <button onClick={() => setIsMessageOpen(true)} className="pointer-events-auto w-full bg-amber-500 text-white py-4 rounded-full font-black shadow-lg">
            تواصل مع المعلم
          </button>
        </div>
      </div>
    );
  }

  // 4. تسجيل الدخول
  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-6 font-sans relative overflow-hidden ${isRamadan ? 'bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]' : 'bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]'}`} dir="rtl">
      {isRamadan && <RamadanTheme />}
      
      <div className="w-full flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl relative overflow-hidden">
            <QrCode className="w-12 h-12 text-amber-400 relative z-10" />
            <div className={`absolute inset-0 ${isRamadan ? 'bg-indigo-500/20' : 'bg-amber-400/20'}`}></div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">راصد لولي الأمر</h1>
          <p className="text-indigo-200 text-sm font-bold">بوابة متابعة الطالب</p>
        </div>

        <div className={`w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border ${isRamadan ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white'}`}>
          {isLoading && !civilID ? (
             <div className="flex flex-col items-center justify-center py-8">
               <Loader2 className="animate-spin text-amber-400 w-10 h-10 mb-4" />
               <p className="text-sm text-indigo-200">جاري تسجيل الدخول...</p>
             </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="number" value={civilID} onChange={(e) => setCivilID(e.target.value)} placeholder="أدخل الرقم المدني" className={`w-full border rounded-xl p-4 text-center text-xl font-black ${isRamadan ? 'bg-black/20 text-white border-white/10' : 'bg-slate-50 text-[#1e3a8a]'}`} />
              {error && <div className="text-xs text-rose-400 text-center">{error}</div>}
              <button type="submit" className="w-full py-4 rounded-xl font-black bg-amber-500 text-white shadow-lg">دخول</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
