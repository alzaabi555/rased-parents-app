import React from 'react';
import { AlertTriangle, Bell, ClipboardList, Gamepad2, MessageSquare } from 'lucide-react';
import type { AlertTabId } from '../types/parent';
import type { LearningGameResult } from '../types/learning';
import type { ParentAlertView, ParentSubjectView } from '../types/viewModels';
import { GlassLayout } from './GlassLayout';
import { EmptyState } from './EmptyState';
import { formatDate, getGameDate, getGameScorePercent, getGameTitle, getMessageTypeArabic, getSubjectGameResults, isTeacherMessageToParent, safeList } from '../utils/parentViewUtils';

interface ParentAlertsProps {
  allSubjects: ParentSubjectView[];
  activeAlertTab: AlertTabId;
  onTabChange: (tab: AlertTabId) => void;
}
export const ParentAlerts:React.FC<ParentAlertsProps>=({allSubjects,activeAlertTab,onTabChange})=>{
let alerts: ParentAlertView[] = [];
    allSubjects.forEach(sub => {
      safeList(sub.behaviors).filter((behavior) => behavior.type === 'negative').forEach((behavior) => alerts.push({ ...behavior, subject: sub.subject, kind: 'alert' }));
      safeList(sub.grades).forEach((grade) => alerts.push({ ...grade, subject: sub.subject, kind: 'grade' }));
      safeList(sub.parentMessages).forEach((message) => {
        if (isTeacherMessageToParent(message)) {
          alerts.push({
            ...m,
            description: message.message || 'رسالة من المعلم',
            subject: sub.subject,
            kind: 'teacher_message',
            date: message.date,
            title: getMessageTypeArabic(message.messageType)
          });
        } else if (message.teacherReply) {
          alerts.push({
            ...m,
            description: `رد المعلم: ${message.teacherReply}`,
            subject: sub.subject,
            kind: 'reply',
            date: message.replyDate || message.date,
            title: 'رد المعلم'
          });
        }
      });
      getSubjectGameResults(sub).forEach((g: LearningGameResult) => alerts.push({
        ...g,
        description: `${getGameTitle(g)} - النتيجة ${getGameScorePercent(g)}%${g.reviewRecommendation ? ` — ${g.reviewRecommendation}` : ''}`,
        subject: g.subject || sub.subject,
        kind: 'game',
        date: getGameDate(g)
      }));
    });
    alerts.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

    return (
      <>
        <GlassLayout title="الإشعارات" icon={<Bell size={24} />}>
          <div className="flex p-1 bg-white/70 backdrop-blur-md border border-white/80 rounded-xl mb-6 shadow-sm">
            <button onClick={() => onTabChange('all')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${activeAlertTab === 'all' ? 'bg-[#002366] text-white shadow-md' : 'text-slate-500 hover:text-[#002366]'}`}>الكل</button>
            <button onClick={() => onTabChange('urgent')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${activeAlertTab === 'urgent' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-rose-500'}`}>تنبيهات</button>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').map((item, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 transition-all hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${item.kind === 'alert' ? 'bg-rose-50 text-rose-500 border-rose-100' : item.kind === 'reply' || item.kind === 'teacher_message' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : item.kind === 'game' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-[#002366] border-indigo-100'}`}>
                    {item.kind === 'alert' ? <AlertTriangle size={20} /> : item.kind === 'reply' || item.kind === 'teacher_message' ? <MessageSquare size={20} /> : item.kind === 'game' ? <Gamepad2 size={20} /> : <ClipboardList size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.kind === 'alert' ? 'bg-rose-100 text-rose-600' : item.kind === 'reply' || item.kind === 'teacher_message' ? 'bg-emerald-100 text-emerald-600' : item.kind === 'game' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-[#002366]'} truncate`}>{item.subject}</span>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{formatDate(itemessage.date || item.createdAt)}</span>
                    </div>
                    <h3 className="font-black text-sm text-slate-800">{item.kind === 'alert' ? 'تنبيه سلوكي' : item.kind === 'reply' ? 'رد من المعلم' : item.kind === 'teacher_message' ? (item.title || 'رسالة من المعلم') : item.kind === 'game' ? 'إنجاز تعليمي' : 'تحديث درجة'}</h3>
                    <p className="text-xs text-slate-500 font-bold leading-snug">{item.description || `تم رصد درجة: ${item.category} (${item.score})`}</p>
                  </div>
                </div>
              </div>
            ))}
            {alerts.filter(a => activeAlertTab === 'all' || a.kind === 'alert').length === 0 && (
              <EmptyState icon={<Bell size={18} />} title="لا توجد إشعارات" subtitle="ستظهر هنا التحديثات الجديدة" />
            )}
          </div>
        </GlassLayout>
      </>
    );
};
