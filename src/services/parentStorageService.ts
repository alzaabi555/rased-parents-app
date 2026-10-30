import { STORAGE_KEYS } from '../constants/storageKeys';
import type { CachedStudentPayload, ParentIdentity, SavedProfile } from '../types/services';

const safeJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

export const getSavedProfiles = (): SavedProfile[] =>
  safeJson<SavedProfile[]>(localStorage.getItem(STORAGE_KEYS.savedProfiles), []);

export const setSavedProfiles = (profiles: SavedProfile[]) =>
  localStorage.setItem(STORAGE_KEYS.savedProfiles, JSON.stringify(profiles));

export const upsertSavedProfile = (profiles: SavedProfile[], next: SavedProfile, loginCode: string) => {
  const index = profiles.findIndex(profile =>
    (!!next.centralStudentId && profile.centralStudentId === next.centralStudentId) ||
    profile.id === loginCode || profile.currentRasedId === loginCode ||
    profile.legacyRasedIds?.includes(loginCode)
  );
  const updated = [...profiles];
  if (index >= 0) updated[index] = { ...updated[index], ...next };
  else updated.push(next);
  setSavedProfiles(updated);
  return updated;
};

export const readStudentCache = (loginCode: string): any[] => {
  const legacy = safeJson<any[]>(localStorage.getItem(STORAGE_KEYS.legacyData(loginCode)), []);
  if (legacy.length) return legacy;
  const centralId = localStorage.getItem(STORAGE_KEYS.activeCentralStudentId);
  if (!centralId) return [];
  return safeJson<CachedStudentPayload>(localStorage.getItem(STORAGE_KEYS.studentData(centralId)), { identity: {}, subjects: [] }).subjects;
};

export const saveStudentCache = (loginCode: string, identity: ParentIdentity, subjects: any[]) => {
  const centralId = String(identity.centralStudentId || '').trim();
  const centralRasedId = String(identity.centralRasedId || '').trim();
  if (centralId) {
    localStorage.setItem(STORAGE_KEYS.studentData(centralId), JSON.stringify({ identity, subjects }));
    localStorage.setItem(STORAGE_KEYS.activeCentralStudentId, centralId);
  }
  localStorage.setItem(STORAGE_KEYS.legacyData(loginCode), JSON.stringify(subjects));
  if (centralRasedId && centralRasedId !== loginCode) {
    localStorage.setItem(STORAGE_KEYS.legacyData(centralRasedId), JSON.stringify(subjects));
  }
};

export const getSavedSessionCode = () => localStorage.getItem(STORAGE_KEYS.parentSecretCode);
export const saveSessionCode = (code: string) => localStorage.setItem(STORAGE_KEYS.parentSecretCode, code);
export const clearSessionCode = () => localStorage.removeItem(STORAGE_KEYS.parentSecretCode);
