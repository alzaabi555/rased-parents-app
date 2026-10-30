import { parentApiPost } from './parentApi';

export const sendParentMessage = (payload: Record<string, unknown>) =>
  parentApiPost<any>({ action: 'sendMessage', ...payload });

export const sendParentReply = (payload: Record<string, unknown>) =>
  parentApiPost<any>({ action: 'replyToTeacherMessage', ...payload });
