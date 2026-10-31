import type { ParentLearningSummary } from './learning';

export interface ParentBehavior {
  type?: string; description?: string; date?: string; [key: string]: unknown;
}
export interface ParentGrade {
  category?: string; score?: number | string; date?: string; [key: string]: unknown;
}
export interface ParentCloudMessage {
  message?: string; messageType?: string; teacherReply?: string; date?: string; replyDate?: string;
  sender?: string; direction?: string; status?: string; [key: string]: unknown;
}
export interface ParentSubjectView {
  name?: string; className?: string; subject?: string; schoolName?: string; lastUpdate?: string;
  totalPoints?: number; centralRasedId?: string; rasedId?: string; behaviors?: ParentBehavior[];
  grades?: ParentGrade[]; parentMessages?: ParentCloudMessage[]; teacherReplies?: unknown[];
  [key: string]: unknown;
}
export interface ParentSummaryView {
  status: string; totalPoints: number; positiveCount: number; negativeCount: number; gradesCount: number;
  repliesCount: number; parentMessagesCount: number; gamesCount: number; latestUpdate?: string;
  recommendation: string; learningSummary: ParentLearningSummary;
}
export interface ParentAlertView {
  kind: 'alert' | 'grade' | 'teacher_message' | 'reply' | 'game'; subject?: string; date?: string;
  description?: string; title?: string; [key: string]: unknown;
}
