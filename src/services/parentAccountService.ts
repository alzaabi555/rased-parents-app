import { STORAGE_KEYS } from '../constants/storageKeys';
import { parentApiPost } from './parentApi';
import type { LinkParentStudentResult } from '../types/services';

export const getOrCreateParentAccountId = (): string => {
  const existing = localStorage.getItem(STORAGE_KEYS.parentAccountId);
  if (existing?.startsWith('PAR-')) return existing;
  const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const id = `PAR-${uuid}`.toUpperCase();
  localStorage.setItem(STORAGE_KEYS.parentAccountId, id);
  return id;
};

export const linkParentStudent = async (studentCode: string, displayName: string) => {
  const parentAccountId = getOrCreateParentAccountId();
  const result = await parentApiPost<LinkParentStudentResult>({
    action: 'linkParentStudent', parentAccountId, deviceAccountKey: parentAccountId,
    displayName: 'ولي الأمر', relationshipType: 'guardian', studentCode, studentName: displayName,
  });
  if (result.status === 'error' || result.success === false) {
    throw new Error(result.message || 'تعذر ربط الابن بحساب ولي الأمر');
  }
  return { ...result, parentAccountId };
};
