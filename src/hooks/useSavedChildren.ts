import { useCallback, useState } from 'react';
import type { SavedProfile } from '../types/parent';
import { getSavedProfiles, setSavedProfiles, upsertSavedProfile } from '../services/parentStorageService';

export const useSavedChildren = () => {
  const [savedProfiles, setProfiles] = useState<SavedProfile[]>(() => getSavedProfiles());
  const saveProfile = useCallback((profile: SavedProfile, loginCode: string) => {
    const updated = upsertSavedProfile(getSavedProfiles(), profile, loginCode);
    setProfiles(updated);
    return updated;
  }, []);
  const removeProfile = useCallback((id: string) => {
    const updated = getSavedProfiles().filter(profile => profile.id !== id && profile.centralStudentId !== id && profile.currentRasedId !== id);
    setSavedProfiles(updated);
    setProfiles(updated);
    return updated;
  }, []);
  return { savedProfiles, saveProfile, removeProfile };
};
