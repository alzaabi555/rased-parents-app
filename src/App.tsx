import React, { useState } from 'react';
import { 
  QrCode, ArrowLeft, Loader2, 
  LogOut, Trophy, ThumbsUp, ThumbsDown, BookOpen, ChevronLeft, 
  GraduationCap, MessageSquare, Send, X
} from 'lucide-react';

const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

function App() {
  const [civilID, setCivilID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // 💬 حالات نافذة المراسلة الجديدة
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!civilID.trim()) return setError('الرجاء إدخال الرقم المدني للطالب.');

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${GOOGLE_WEB_APP_URL}?code=${civilID.trim()}`);
      const result = await response.json();

      if (result.status === 'success') {
        setAllSubjects(result.subjects);
      } else {
        setError('لم يتم العثور على بيانات لهذا الرقم المدني.');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالسحابة.');
    } finally {
      setIsLoading(false);
    }
  };

  // 📩 دالة إرسال الملاحظة للمعلم
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
  // 1. واجهة اختيار المادة
  // =========================================================================
  if (allSubjects.length > 0 && !selectedSubject) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-6" dir="rtl">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setAllSubjects([])} className="p-2 bg-white rounded-xl shadow-sm"><LogOut size={20} className="text-rose-500"/></button>
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-800">{allSubjects[0].name}</h1>
            <p className="text-xs font-bold text-slate-400">الصف: {allSubjects[0].className}</p>
          </div>
        </div>

        <h2 className="text-lg font-black text-[#1e3a8a] mb-4">اختر المادة الدراسية:</h2>
        <div className="grid gap-4">
          {allSubjects.map((sub, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedSubject(sub)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-blue-300 transition-all active:scale-95 text-right"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-700">{sub.subject}</h3>
                  <p className="text-[10px] text-slate-400">آخر تحديث: {formatDate(sub.lastUpdate)}</p>
                </div>
              </div>
              <ChevronLeft className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. لوحة قيادة المادة المختارة + نافذة المراسلة
  // =========================================================================
  if (selectedSubject) {
    const s = selectedSubject;
    const pos = s.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const neg = s.behaviors?.filter((b: any) => b.type === 'negative') || [];
    
    // حساب إحصائيات الغياب والتسرب
    const absenceCount = s.attendance?.filter((a: any) => a.status === 'absent').length || 0;
    const truantCount = s.attendance?.filter((a: any) => a.status === 'truant').length || 0;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 relative" dir="rtl">
        
        {/* ✉️ نافذة كتابة الرسالة للمعلم */}
        {isMessageOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-[#1e3a8a] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5"/> رسالة لمعلم المادة
                </h3>
                <button onClick={() => setIsMessageOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X size={18}/></button>
              </div>
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب ملاحظاتك، استفساراتك، أو أعذار الغياب هنا..."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold resize-none outline-none focus:border-[#1e3a8a] mb-4"
              ></textarea>
              <button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSendingMsg}
                className="w-full bg-[#1e3a8a] text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSendingMsg ? <Loader2 className="animate-spin" /> : <>إرسال <Send size={18}/></>}
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#1e3a8a] text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setSelectedSubject(null)} className="p-2 bg-white/10 rounded-xl"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-black">{s.subject}</h1>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-amber-400">{s.name}</h2>
            <p className="text-xs text-blue-200 mt-1">سجل مادة {s.subject}</p>
          </div>
        </div>

        <div className="px-5 -mt-6 space-y-5">
          {/* رصيد النقاط */}
          <div className="bg-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <h2 className="font-bold text-slate-500">نقاط التميز في المادة</h2>
            <div className="bg-amber-50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-amber-600 border border-amber-100">
              <Trophy size={20} /><span className="text-xl font-black">{s.totalPoints}</span>
            </div>
          </div>

          {/* سجل الغياب والتسرب */}
          {(absenceCount > 0 || truantCount > 0) && (
            <div className="flex gap-4">
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-500 mb-1">أيام الغياب</span>
                <span className="text-2xl font-black text-rose-500">{absenceCount}</span>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-500 mb-1">مرات التسرب</span>
                <span className="text-2xl font-black text-purple-600">{truantCount}</span>
              </div>
            </div>
          )}

          {/* السلوكيات */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-emerald-600 border-b pb-2"><ThumbsUp size={14} /><h3 className="font-bold text-xs">إيجابي</h3></div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {pos.map((b: any, i: number) => (
                    <div key={i} className="bg-emerald-50 p-2 rounded-lg"><p className="text-[10px] font-bold text-emerald-900">{b.description}</p></div>
                  ))}
                </div>
             </div>
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-600 border-b pb-2"><ThumbsDown size={14} /><h3 className="font-bold text-xs">تنبيهات</h3></div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {neg.map((b: any, i: number) => (
                    <div key={i} className="bg-rose-50 p-2 rounded-lg"><p className="text-[10px] font-bold text-rose-900">{b.description}</p></div>
                  ))}
                </div>
             </div>
          </div>

          {/* الدرجات */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600"><BookOpen size={18}/><h3 className="font-black">سجل الدرجات</h3></div>
            <div className="space-y-2">
              {s.grades?.map((g: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">{g.category}</span>
                  <span className="bg-indigo-100 text-indigo-700 font-black text-xs px-3 py-1 rounded-lg">{g.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 💬 الزر العائم للتواصل مع المعلم */}
        <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-40">
          <button 
            onClick={() => setIsMessageOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 shadow-[0_10px_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all w-full max-w-sm justify-center border-2 border-amber-300"
          >
            <MessageSquare size={20} />
            تواصل مع المعلم
          </button>
        </div>

      </div>
    );
  }

  // =========================================================================
  // 3. واجهة تسجيل الدخول بالرقم المدني
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-6 font-sans overflow-hidden" dir="rtl">
      <div className="text-center mb-10 relative z-10">
        <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl">
          <QrCode className="w-12 h-12 text-amber-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">راصد للآباء</h1>
        <p className="text-blue-200 text-sm font-bold">يرجى إدخال الرقم المدني للطالب</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl relative z-10">
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="number" 
            value={civilID}
            onChange={(e) => setCivilID(e.target.value)}
            placeholder="الرقم المدني"
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-center text-xl font-black tracking-[0.2em] text-slate-800 outline-none focus:border-[#1e3a8a]"
          />
          {error && <div className="text-rose-500 text-xs font-bold text-center">{error}</div>}
          <button 
            type="submit" 
            disabled={isLoading || !civilID}
            className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>دخول <ArrowLeft size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
