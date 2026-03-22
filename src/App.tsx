import React, { useState, useEffect } from 'react';
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
  
  // حالة الشاشة الترحيبية
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  // حالات نافذة المراسلة 
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // 🌙 متغير الثيم الرمضاني الفاخر
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
        
        // إظهار شاشة الترحيب فقط عند الدخول وليس عند تحديث الصفحة يدوياً
        if (!isManualRefresh) {
          setShowWelcomeScreen(true);
          // إخفاء الشاشة بعد 2.5 ثانية
          setTimeout(() => {
            setShowWelcomeScreen(false);
          }, 2500);
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

  // =========================================================================
  // شاشة الشكر والترحيب المؤقتة
  // =========================================================================
  if (showWelcomeScreen && allSubjects.length > 0) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center p-6 font-sans text-center relative overflow-hidden animate-in fade-in duration-500 ${isRamadan ? 'bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]' : 'bg-gradient-to-br from-[#1e3a8a] to-blue-700'}`} dir="rtl">
        {/* تأثيرات بصرية للخلفية */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-amber-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
          <div className={`p-6 rounded-full mb-8 animate-pulse ${isRamadan ? 'bg-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.3)]' : 'bg-white/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]'}`}>
            <HeartHandshake size={72} className={isRamadan ? 'text-amber-400' : 'text-amber-400'} />
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

  // =========================================================================
  // واجهة 1: اختيار المادة 
  // =========================================================================
  if (allSubjects.length > 0 && !selectedSubject) {
    return (
      <div className={`h-screen flex flex-col font-sans overflow-hidden animate-in fade-in duration-500 ${isRamadan ? 'bg-[#0f172a]' : 'bg-slate-50'}`} dir="rtl">
        
        {/* Header */}
        <div className={`px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-xl shrink-0 relative overflow-hidden ${isRamadan ? 'bg-[#1e1b4b] border-b border-indigo-500/20' : 'bg-gradient-to-br from-[#1e3a8a] to-blue-600'}`}>
          <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md shadow-inner ${isRamadan ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/20 border-white/30'}`}>
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

        {/* Toolbar */}
        <div className="px-6 mt-6 flex justify-between items-center shrink-0">
          <h2 className={`text-lg font-black ${isRamadan ? 'text-white' : 'text-slate-800'}`}>المواد الدراسية</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchStudentData(civilID, true)} 
              disabled={isRefreshing}
              className={`p-3 rounded-xl shadow-sm transition-all active:scale-90 border ${isRamadan ? 'bg-indigo-900/50 border-indigo-500/30 text-indigo-300 hover:bg-indigo-800' : 'bg-white border-slate-100 text-blue-600 hover:bg-blue-50'}`}
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleLogout} 
              className={`p-3 rounded-xl shadow-sm transition-all active:scale-90 border ${isRamadan ? 'bg-rose-900/30 border-rose-500/30 text-rose-400 hover:bg-rose-900/50' : 'bg-white border-slate-100 text-rose-500 hover:bg-rose-50'}`}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Subjects List */}
        <div className="flex-1 overflow-y-auto px-6 mt-4 pb-20 space-y-4 custom-scrollbar">
          {allSubjects.map((sub, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedSubject(sub)}
              className={`w-full p-5 rounded-[1.5rem] flex justify-between items-center transition-all active:scale-[0.98] text-right group border ${isRamadan ? 'bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10' : 'bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-slate-100 hover:border-blue-300 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isRamadan ? 'bg-indigo-500/20 text-indigo-300 group-hover:bg-amber-500/20 group-hover:text-amber-400' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white'}`}>
                  <GraduationCap size={26} />
                </div>
                <div>
                  <h3 className={`font-black text-base ${isRamadan ? 'text-white' : 'text-slate-700'}`}>{sub.subject}</h3>
                  <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${isRamadan ? 'text-slate-400' : 'text-slate-400'}`}>
                    <RefreshCw size={10} className={isRamadan ? 'text-amber-500/70' : ''} /> {formatDate(sub.lastUpdate)}
                  </p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRamadan ? 'bg-white/5 group-hover:bg-amber-500/20' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                <ChevronLeft size={18} className={isRamadan ? 'text-slate-400 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-blue-600'} />
              </div>
            </button>
          ))}
        </div>
        
        {/* Footer */}
        <div className={`py-4 text-center shrink-0 border-t ${isRamadan ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
            <p className="text-slate-500 text-[10px] font-bold mb-1">برمجة وتطوير</p>
            <div className="flex items-center justify-center gap-1.5">
              <Code size={12} className="text-amber-500" />
              <span className="text-amber-500/80 text-[11px] font-black tracking-widest uppercase">Mohammed Alzaabi</span>
            </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // واجهة 2: لوحة قيادة المادة
  // =========================================================================
  if (selectedSubject) {
    const s = selectedSubject;
    
    // فلترة وفصل السلوكيات
    const allPos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const disciplineCount = allPos.filter((b: any) => b.description === 'هدوء وانضباط').length;
    const displayPos = allPos.filter((b: any) => b.description !== 'هدوء وانضباط');
    const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];
    const absenceCount = s.attendance?.filter((a: any) => a.status === 'absent').length || 0;
    const truantCount = s.attendance?.filter((a: any) => a.status === 'truant').length || 0;

    return (
      <div className={`h-screen flex flex-col font-sans relative overflow-hidden ${isRamadan ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
        
        {/* Message Modal */}
        {isMessageOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 border ${isRamadan ? 'bg-[#1e293b] border-white/10' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-black flex items-center gap-2 ${isRamadan ? 'text-amber-400' : 'text-[#1e3a8a]'}`}>
                  <MessageSquare className="w-5 h-5"/> رسالة لمعلم المادة
                </h3>
                <button onClick={() => setIsMessageOpen(false)} className={`p-2 rounded-full transition-colors ${isRamadan ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><X size={18}/></button>
              </div>
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب ملاحظاتك، استفساراتك، أو أعذار الغياب هنا..."
                className={`w-full h-32 border rounded-xl p-4 text-sm font-bold resize-none outline-none mb-4 custom-scrollbar transition-colors ${isRamadan ? 'bg-black/20 border-white/10 focus:border-amber-400 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:border-[#1e3a8a] text-slate-800'}`}
              ></textarea>
              <button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSendingMsg}
                className={`w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg ${isRamadan ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-[#1e3a8a] text-white'}`}
              >
                {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال <Send size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className={`px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg shrink-0 relative z-10 ${isRamadan ? 'bg-[#1e1b4b] border-b border-indigo-500/20' : 'bg-[#1e3a8a] text-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedSubject(null)} className={`p-2 rounded-xl transition-colors ${isRamadan ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200' : 'bg-white/10 hover:bg-white/20 text-white'}`}><ArrowLeft size={20}/></button>
            <h1 className={`text-lg font-black ${isRamadan ? 'text-white' : ''}`}>{s.subject}</h1>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-amber-400">{s.name}</h2>
            <p className={`text-xs mt-1 ${isRamadan ? 'text-indigo-300' : 'text-blue-200'}`}>سجل مادة {s.subject}</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-5 -mt-4 space-y-5 flex-1 overflow-y-auto pt-8 pb-32 custom-scrollbar">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-2 border ${isRamadan ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-white shadow-xl border-transparent'}`}>
              <h2 className={`font-bold text-xs ${isRamadan ? 'text-indigo-200' : 'text-slate-500'}`}>نقاط التميز</h2>
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${isRamadan ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                <Trophy size={20} /><span className="text-xl font-black">{s.totalPoints}</span>
              </div>
            </div>

            <div className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-2 border relative overflow-hidden ${isRamadan ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-white shadow-xl border-transparent'}`}>
              <div className={`absolute top-[-10px] right-[-10px] opacity-20 ${isRamadan ? 'text-amber-400' : 'text-amber-100'}`}>
                <Star size={60} fill="currentColor" />
              </div>
              <h2 className={`font-bold text-xs relative z-10 ${isRamadan ? 'text-amber-200/70' : 'text-slate-500'}`}>أيام الانضباط</h2>
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border relative z-10 ${isRamadan ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                <Star size={20} fill="currentColor" /><span className="text-xl font-black">{disciplineCount}</span>
              </div>
            </div>
          </div>

          {/* Attendance Alerts */}
          {(absenceCount > 0 || truantCount > 0) && (
            <div className="flex gap-4">
              <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center text-center border ${isRamadan ? 'bg-rose-900/20 border-rose-500/20' : 'bg-white shadow-sm border-slate-100'}`}>
                <span className={`text-xs font-bold mb-1 ${isRamadan ? 'text-rose-300' : 'text-slate-500'}`}>أيام الغياب</span>
                <span className="text-2xl font-black text-rose-500">{absenceCount}</span>
              </div>
              <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center text-center border ${isRamadan ? 'bg-purple-900/20 border-purple-500/20' : 'bg-white shadow-sm border-slate-100'}`}>
                <span className={`text-xs font-bold mb-1 ${isRamadan ? 'text-purple-300' : 'text-slate-500'}`}>مرات التسرب</span>
                <span className={`text-2xl font-black ${isRamadan ? 'text-purple-400' : 'text-purple-600'}`}>{truantCount}</span>
              </div>
            </div>
          )}

          {/* Behaviors Lists */}
          <div className="grid grid-cols-2 gap-4">
             <div className={`rounded-2xl p-4 border ${isRamadan ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-white shadow-sm border-emerald-100'}`}>
                <div className={`flex items-center gap-2 mb-2 border-b pb-2 ${isRamadan ? 'text-emerald-400 border-emerald-500/20' : 'text-emerald-600 border-emerald-100'}`}><ThumbsUp size={14} /><h3 className="font-bold text-xs">إنجازات</h3></div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {displayPos.length > 0 ? displayPos.map((b: any, i: number) => (
                    <div key={i} className={`p-2 rounded-lg ${isRamadan ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}><p className={`text-[10px] font-bold ${isRamadan ? 'text-emerald-200' : 'text-emerald-900'}`}>{b.description}</p></div>
                  )) : <div className="text-center text-[10px] text-slate-400 py-2">- لا يوجد حالياً -</div>}
                </div>
             </div>
             
             <div className={`rounded-2xl p-4 border ${isRamadan ? 'bg-rose-900/10 border-rose-500/20' : 'bg-white shadow-sm border-rose-100'}`}>
                <div className={`flex items-center gap-2 mb-2 border-b pb-2 ${isRamadan ? 'text-rose-400 border-rose-500/20' : 'text-rose-600 border-rose-100'}`}><ThumbsDown size={14} /><h3 className="font-bold text-xs">تنبيهات</h3></div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {neg.length > 0 ? neg.map((b: any, i: number) => (
                    <div key={i} className={`p-2 rounded-lg ${isRamadan ? 'bg-rose-500/10' : 'bg-rose-50'}`}><p className={`text-[10px] font-bold ${isRamadan ? 'text-rose-200' : 'text-rose-900'}`}>{b.description}</p></div>
                  )) : <div className="text-center text-[10px] text-slate-400 py-2">- لا يوجد -</div>}
                </div>
             </div>
          </div>

          {/* Grades List */}
          <div className={`rounded-3xl p-5 border ${isRamadan ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-white shadow-sm border-slate-100'}`}>
            <div className={`flex items-center gap-2 mb-4 ${isRamadan ? 'text-indigo-300' : 'text-indigo-600'}`}><BookOpen size={18}/><h3 className="font-black">سجل الدرجات</h3></div>
            <div className="space-y-2">
              {s.grades?.map((g: any, i: number) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${isRamadan ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <span className={`text-xs font-bold ${isRamadan ? 'text-slate-300' : 'text-slate-700'}`}>{g.category}</span>
                  <span className={`font-black text-xs px-3 py-1 rounded-lg ${isRamadan ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>{g.score}</span>
                </div>
              ))}
              {(!s.grades || s.grades.length === 0) && (
                <div className="text-center text-xs font-bold text-slate-400 py-4">لم يتم رصد درجات بعد</div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button for Messaging */}
        <div className={`absolute bottom-6 left-0 right-0 px-6 flex flex-col items-center justify-center z-40 pt-6 pointer-events-none ${isRamadan ? 'bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent' : 'bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent'}`}>
          <button 
            onClick={() => setIsMessageOpen(true)}
            className="pointer-events-auto bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-black flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all w-full max-w-sm border border-amber-400 mb-2"
          >
            <MessageSquare size={20} />
            تواصل مع المعلم
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // واجهة 3: تسجيل الدخول
  // =========================================================================
  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-6 font-sans overflow-hidden relative ${isRamadan ? 'bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]' : 'bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]'}`} dir="rtl">
      
      {/* تأثيرات الإضاءة في الخلفية */}
      <div className={`absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full mix-blend-screen filter blur-3xl ${isRamadan ? 'bg-indigo-500/10' : 'bg-blue-500/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full mix-blend-screen filter blur-3xl ${isRamadan ? 'bg-amber-500/10' : 'bg-amber-500/20'}`}></div>

      <div className="w-full flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl relative overflow-hidden">
            <QrCode className="w-12 h-12 text-amber-400 relative z-10" />
            <div className={`absolute inset-0 rounded-[2rem] ${isRamadan ? 'bg-gradient-to-tr from-indigo-500/20 to-amber-500/20' : 'bg-gradient-to-tr from-amber-400/20 to-transparent'}`}></div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">راصد لولي الأمر</h1>
          <p className="text-indigo-200 text-sm font-bold">بوابة متابعة الطالب</p>
        </div>

        <div className={`w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border ${isRamadan ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-transparent'}`}>
          {isLoading && !civilID ? (
             <div className="flex flex-col items-center justify-center py-8">
               <Loader2 className={`animate-spin w-10 h-10 mb-4 ${isRamadan ? 'text-amber-400' : 'text-[#1e3a8a]'}`} />
               <p className={`text-sm font-bold ${isRamadan ? 'text-indigo-200' : 'text-slate-500'}`}>جاري تسجيل الدخول...</p>
             </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="number" 
                value={civilID}
                onChange={(e) => setCivilID(e.target.value)}
                placeholder="أدخل الرقم المدني للطالب"
                className={`w-full border rounded-xl p-4 text-center text-xl font-black tracking-[0.2em] outline-none transition-colors ${isRamadan ? 'bg-black/20 border-white/10 text-white focus:border-amber-400 placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1e3a8a] focus:border-amber-400 placeholder-slate-400'}`}
              />
              {error && <div className={`text-xs font-bold text-center p-2 rounded-lg ${isRamadan ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-500'}`}>{error}</div>}
              <button 
                type="submit" 
                disabled={isLoading || !civilID}
                className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-95 ${isRamadan ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-gradient-to-l from-[#1e3a8a] to-blue-700 text-white'}`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>دخول <ArrowLeft size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="pt-8 text-center relative z-10">
        <p className="text-slate-400/50 text-[10px] font-bold mb-1">برمجة وتطوير</p>
        <div className="flex items-center justify-center gap-1.5 opacity-80">
          <Code size={14} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-black tracking-widest uppercase">Mohammed Alzaabi</span>
        </div>
      </div>

    </div>
  );
}

export default App;
