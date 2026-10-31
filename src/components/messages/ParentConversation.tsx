import React from 'react';
import { MessagesSquare } from 'lucide-react';
import type { ParentConversationMessage } from '../../types/messages';
import { getConversationMessagesSorted } from '../../utils/parentViewUtils';
import { MessageBubble } from './MessageBubble';
export const ParentConversation:React.FC<{items:ParentConversationMessage[];onReply:(item:ParentConversationMessage)=>void}>=({items,onReply})=><div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-gradient-to-b from-emerald-50/50 via-white to-indigo-50/40 custom-scrollbar">{!items.length?<div className="h-full min-h-56 flex flex-col items-center justify-center text-center"><div className="w-16 h-16 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm mb-3"><MessagesSquare size={28}/></div><p className="font-black text-slate-700">لا توجد رسائل بعد</p><p className="text-xs text-slate-400 mt-1">ابدأ محادثة مباشرة مع معلم المادة</p></div>:getConversationMessagesSorted(items).map((item:any,index:number)=><MessageBubble key={item.localId||item.rowNumber||`${item.date}-${index}`} item={item} onReply={onReply}/>)}</div>;
