import { GOOGLE_WEB_APP_URL } from '../constants/api';
import type { ParentStudentResponse } from '../types/services';

const parseResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('استجابة الخادم غير صالحة');
  }
};

export const parentApiGet = async <T>(params: Record<string, string>): Promise<T> => {
  const query = new URLSearchParams({ ...params, t: String(Date.now()) });
  const response = await fetch(`${GOOGLE_WEB_APP_URL}?${query.toString()}`, {
    method: 'GET', redirect: 'follow', cache: 'no-store',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseResponse<T>(response);
};

export const parentApiPost = async <T>(payload: Record<string, unknown>): Promise<T> => {
  const response = await fetch(GOOGLE_WEB_APP_URL, {
    method: 'POST', redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseResponse<T>(response);
};

export const fetchParentStudent = (code: string) =>
  parentApiGet<ParentStudentResponse>({ code: code.trim().toUpperCase() });
