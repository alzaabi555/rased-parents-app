import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { ParentConversationMessage } from '../../../types/messages';
import { ParentConversation } from '../../messages/ParentConversation';
import { ParentMessageComposer } from '../../messages/ParentMessageComposer';
import { TeacherMessageReply } from '../../messages/TeacherMessageReply';

interface Props {
  subject: any;
  items: ParentConversationMessage[];
  messageText: string;
  replyText: string;
  replyingTo: ParentConversationMessage | null;
  isSending: boolean;
  isSendingReply: boolean;
  onMessageChange: (value: string) => void;
  onReplyTextChange: (value: string) => void;
  onStartReply: (message: ParentConversationMessage) => void;
  onCancelReply: () => void;
  onSend: () => void;
  onSendReply: () => void;
}

export const SubjectMessagesTab: React.FC<Props> = props => (
  <section className="flex min-h-[58dvh] flex-col overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
    <header className="flex items-center justify-between border-b border-emerald-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><MessageSquare size={21} /></div>
        <div><h3 className="text-sm font-black text-slate-800">محادثة مع المعلم</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{props.subject.subject} • {props.subject.teacherName || 'معلم المادة'}</p></div>
      </div>
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{props.items.length} رسالة</span>
    </header>

    <ParentConversation items={props.items} onReply={props.onStartReply} />

    {props.replyingTo ? (
      <TeacherMessageReply
        message={props.replyingTo}
        value={props.replyText}
        isSending={props.isSendingReply}
        onChange={props.onReplyTextChange}
        onCancel={props.onCancelReply}
        onSend={props.onSendReply}
      />
    ) : (
      <ParentMessageComposer value={props.messageText} isSending={props.isSending} onChange={props.onMessageChange} onSend={props.onSend} />
    )}
  </section>
);
