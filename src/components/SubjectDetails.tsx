import React, { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { GlassLayout } from './GlassLayout';
import type { ParentConversationMessage } from '../types/messages';
import { getSubjectGameResults, safeList } from '../utils/parentViewUtils';
import { SubjectTabs } from './subjects/SubjectTabs';
import type { SubjectTabId } from './subjects/SubjectTabs';
import { SubjectOverviewTab } from './subjects/tabs/SubjectOverviewTab';
import { SubjectGradesTab } from './subjects/tabs/SubjectGradesTab';
import { SubjectBehaviorTab } from './subjects/tabs/SubjectBehaviorTab';
import { SubjectGamesTab } from './subjects/tabs/SubjectGamesTab';
import { SubjectMessagesTab } from './subjects/tabs/SubjectMessagesTab';

export interface SubjectMessagesBindings {
  items: ParentConversationMessage[];
  messageText: string;
  replyText: string;
  replyingTo: ParentConversationMessage | null;
  isSending: boolean;
  isSendingReply: boolean;
  setMessageText: (value: string) => void;
  setReplyText: (value: string) => void;
  setReplyingTo: (message: ParentConversationMessage | null) => void;
  send: () => void;
  sendReply: () => void;
}

interface SubjectDetailsProps {
  subjectData: any;
  onBack: () => void;
  messages: SubjectMessagesBindings;
}

export const SubjectDetails: React.FC<SubjectDetailsProps> = ({ subjectData, onBack, messages }) => {
  const [activeTab, setActiveTab] = useState<SubjectTabId>('overview');
  const behaviors = safeList<any>(subjectData.behaviors);
  const positive = behaviors.filter(item => item.type === 'positive');
  const negative = behaviors.filter(item => item.type === 'negative');
  const grades = safeList<any>(subjectData.grades);
  const games = getSubjectGameResults(subjectData);
  const recommendation = negative.length
    ? 'توجد ملاحظة تحتاج متابعة. يُفضّل قراءة التنبيه والتواصل مع المعلم عند الحاجة.'
    : games.some(game => game.masteryLevel === 'needs_review' || game.masteryLevel === 'needs_followup')
      ? 'توجد نتائج ألعاب تشير إلى حاجة لمراجعة قصيرة في هذه المادة.'
      : positive.length
        ? 'الأداء في المادة مطمئن. استمر في تعزيز الإنجازات الإيجابية.'
        : 'تابع تحديثات المادة بصورة دورية.';

  const counts = useMemo(() => ({
    grades: grades.length,
    behavior: behaviors.length,
    games: games.length,
    messages: messages.items.length,
  }), [behaviors.length, games.length, grades.length, messages.items.length]);

  return (
    <GlassLayout
      title={subjectData.subject || 'تفاصيل المادة'}
      subtitle={subjectData.teacherName || subjectData.schoolName || 'المادة الدراسية'}
      icon={<BookOpen size={23} />}
      showBack
      onBack={onBack}
    >
      <SubjectTabs activeTab={activeTab} counts={counts} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <SubjectOverviewTab
          subject={subjectData}
          positiveCount={positive.length}
          negativeCount={negative.length}
          gamesCount={games.length}
          messagesCount={messages.items.length}
          recommendation={recommendation}
          onOpenMessages={() => setActiveTab('messages')}
        />
      )}
      {activeTab === 'grades' && <SubjectGradesTab grades={grades} />}
      {activeTab === 'behavior' && <SubjectBehaviorTab behaviors={behaviors} />}
      {activeTab === 'games' && <SubjectGamesTab games={games} />}
      {activeTab === 'messages' && (
        <SubjectMessagesTab
          subject={subjectData}
          items={messages.items}
          messageText={messages.messageText}
          replyText={messages.replyText}
          replyingTo={messages.replyingTo}
          isSending={messages.isSending}
          isSendingReply={messages.isSendingReply}
          onMessageChange={messages.setMessageText}
          onReplyTextChange={messages.setReplyText}
          onStartReply={message => { messages.setReplyingTo(message); messages.setReplyText(''); }}
          onCancelReply={() => { messages.setReplyingTo(null); messages.setReplyText(''); }}
          onSend={messages.send}
          onSendReply={messages.sendReply}
        />
      )}
    </GlassLayout>
  );
};
