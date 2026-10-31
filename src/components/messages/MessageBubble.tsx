import React from 'react';
import { CheckCheck, Clock3, MessageSquare } from 'lucide-react';
import type { ParentConversationMessage } from '../../types/messages';
import { formatDateTime, isTeacherMessageToParent } from '../../utils/parentViewUtils';
export const MessageBubble:React.FC<{item:ParentConversationMessage;onReply:(item:ParentConversationMessage)=>void}>=({item,onReply})=>{
 const teacher=isTeacherMessageToParent(item);
 return <div className={`flex ${teacher?'justify-start':'justify-end'}`}><div className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-sm ${teacher?'bg-white border border-emerald-100 rounded-tr-md':'bg-[#002366] text-white rounded-tl-md'}`}>
  <div className="flex items-center justify-between gap-4 mb-1"><span className={`text-[10px] font-black ${teacher?'text-emerald-700':'text-indigo-100'}`}>{teacher?(item.teacherName||'المعلم'):'ولي الأمر'}</span><span className={`text-[9px] ${teacher?'text-slate-400':'text-indigo-200'}`}>{formatDateTime(item.date||'')}</span></div>
  {item.replyToMessage&&<div className={`mb-2 border-r-2 pr-2 text-[10px] line-clamp-2 ${teacher?'border-emerald-300 text-slate-500':'border-indigo-300 text-indigo-100'}`}>{item.replyToMessage}</div>}
  <p className="text-sm font-bold leading-6 whitespace-pre-wrap">{item.message}</p>
  <div className="mt-2 flex items-center justify-between gap-3">{teacher?<button type="button" onClick={()=>onReply(item)} className="text-[10px] font-black text-emerald-700 flex items-center gap-1"><MessageSquare size={13}/> رد</button>:<span/>}<span className={`text-[9px] flex items-center gap-1 ${teacher?'text-slate-400':'text-indigo-100'}`}>{item.status==='pending'?<><Clock3 size={11}/> بانتظار الإرسال</>:<><CheckCheck size={11}/> تم الإرسال</>}</span></div>
  {!teacher&&item.teacherReply&&<div className="mt-3 bg-white/10 border border-white/15 rounded-2xl p-3"><span className="text-[10px] font-black text-indigo-100">رد المعلم</span><p className="mt-1 text-xs font-bold">{item.teacherReply}</p></div>}
 </div></div>;
};
