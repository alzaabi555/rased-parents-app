import React, { useState } from 'react';
import { 
  QrCode, ArrowLeft, Loader2, AlertCircle, 
  LogOut, Trophy, ThumbsUp, ThumbsDown, BookOpen, CalendarDays 
} from 'lucide-react';

// ✅ الرابط السري الخاص بالدكتور محمد
const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzKPPsQsM_dIttcYSxRLs6LQuvXhT6Qia5TwJ1Tw4ObQ-eZFZeJhV6epXXjxA9_SwWk/exec";

function App() {
  const [parentCode, setParentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentCode.trim()) {
      setError('الرجاء إدخال الكود السري الخاص بالطالب.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${GOOGLE_WEB_APP_URL}?code=${parentCode.trim().toUpperCase()}`);
      const data = await response.json();

      if (data.status === 'success') {
        setStudentData(data.student);
      } else {
        setError('الكود السري غير صحيح، تأكد من كتابته بشكل مطابق للبطاقة.');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // =========================================================================
  // 📱 واجهة "لوحة القيادة" (Dashboard) - تظهر لولي الأمر بعد الدخول
  // =========================================================================
  if (studentData) {
    const positiveBehaviors = studentData.behaviors?.filter((b: any) => b.type === 'positive') || [];
    const negativeBehaviors = studentData.behaviors?.filter((b: any) => b.type === 'negative') || [];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10" dir="rtl">
        
        {/* 1. الترويسة العلوية */}
        <div className="bg-gradient-to-b from-[#1e3a8a] to-[#2563eb] text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-200 text-sm font-bold mb-1">مرحباً بك، ولي أمر</p>
              <h1 className="text-2xl font-black">{studentData.name}</h1>
              <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                الصف: {studentData.className || 'غير محدد'}
              </span>
            </div>
            <button 
              onClick={() => setStudentData(null)}
              className="p-2 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl transition-colors backdrop-blur-md"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 -mt-6 relative z-20 space-y-5 max-w-md mx-auto">
          
          {/* 2. بطاقة رصيد الفرسان */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-500 mb-1">رصيد نقاط الفرسان</h2>
              <p className="text-xs text-slate-400">إجمالي النقاط الحالية</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-100 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-amber-600 shadow-inner">
              <Trophy className="w-6 h-6 mb-1" />
              <span className="text-2xl font-black leading-none">{studentData.totalPoints || 0}</span>
            </div>
          </div>

          {/* 3. قسم السلوكيات */}
          <div className="grid grid-cols-2 gap-4">
            {/* الإيجابي */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 border-b border-emerald-50 pb-2">
                <ThumbsUp className="w-4 h-4" />
                <h3 className="font-bold text-sm">السلوك الإيجابي</h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                {positiveBehaviors.length > 0 ? positiveBehaviors.map((b: any, i: number) => (
                  <div key={i} className="bg-emerald-50 p-2 rounded-lg">
                    <p className="text-xs font-bold text-emerald-900 mb-1">{b.description}</p>
                    <p className="text-[9px] text-emerald-600 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {formatDate(b.date)}</p>
                  </div>
                )) : <p className="text-xs text-slate-400 text-center py-2">لا يوجد سجل</p>}
              </div>
            </div>

            {/* السلبي */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <div className="flex items-center gap-2 mb-3 text-rose-600 border-b border-rose-50 pb-2">
                <ThumbsDown className="w-4 h-4" />
                <h3 className="font-bold text-sm">ملاحظات (تنبيه)</h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                {negativeBehaviors.length > 0 ? negativeBehaviors.map((b: any, i: number) => (
                  <div key={i} className="bg-rose-50 p-2 rounded-lg">
                    <p className="text-xs font-bold text-rose-900 mb-1">{b.description}</p>
                    <p className="text-[9px] text-rose-600 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {formatDate(b.date)}</p>
                  </div>
                )) : <p className="text-xs text-emerald-500 text-center py-2 font-bold">طالب منضبط 🌟</p>}
              </div>
            </div>
          </div>

          {/* 4. قسم الدرجات (تم التحديث ليدعم المصفوفة البرمجية والترتيب الذكي) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-black text-base">سجل الدرجات والتقويم</h3>
            </div>
            
            <div className="space-y-3">
              {studentData.grades && (Array.isArray(studentData.grades) || typeof studentData.grades === 'string') ? (
                (() => {
                  const allGrades = typeof studentData.grades === 'string' 
                    ? JSON.parse(studentData.grades) 
                    : studentData.grades;

                  const sortedGrades = [...allGrades].sort((a, b) => b.semester.localeCompare(a.semester));

                  return sortedGrades.map((g: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{g.category}</span>
                        <div className="flex gap-2 mt-0.5">
                           <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${g.semester === '2' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                            الفصل {g.semester === '1' ? 'الأول' : 'الثاني'}
                          </span>
                        </div>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 font-black text-sm px-4 py-1 rounded-lg">
                        {g.score}
                      </span>
                    </div>
                  ));
                })()
              ) : (
                <div className="text-center text-slate-400 text-sm py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  لم يتم رصد درجات حتى الآن.
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-6 font-bold">
            آخر تحديث للبيانات: {formatDate(studentData.lastUpdate)}
          </p>

        </div>
      </div>
    );
  }

  // =========================================================================
  // 🔐 واجهة "تسجيل الدخول" (بوابة التطبيق)
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-6 font-sans relative overflow-hidden" dir="rtl">
      
      {/* دوائر الزينة في الخلفية */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      {/* الشعار والترحيب */}
      <div className="text-center mb-10 relative z-10">
        <div className="w-24 h-24 bg-white/10 rounded-[2rem] backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
          <QrCode className="w-12 h-12 text-amber-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-wide">راصد للآباء</h1>
        <p className="text-blue-200 text-sm font-bold">بوابة متابعة السلوك والتحصيل الدراسي</p>
      </div>

      {/* صندوق الدخول */}
      <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl relative z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        
        <h2 className="text-xl font-black text-slate-800 mb-6 text-center">تسجيل الدخول</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">الكود السري للطالب (PIN)</label>
            <input 
              type="text" 
              value={parentCode}
              onChange={(e) => setParentCode(e.target.value)}
              placeholder="مثال: RSD-XXXX"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-center text-lg font-mono font-black tracking-widest text-slate-800 outline-none focus:border-[#1e3a8a] focus:bg-white transition-all uppercase"
              dir="ltr"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs font-bold flex items-start gap-2 border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !parentCode}
            className="w-full bg-[#1e3a8a] hover:bg-[#152c6b] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                دخول <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <p className="text-[10px] text-center text-slate-400 font-bold mt-6">
          * احصل على الكود السري من المعلم عبر بطاقة الدخول.
        </p>
      </div>
    </div>
  );
}

export default App;
