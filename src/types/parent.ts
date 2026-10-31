export type TabId = 'home' | 'subjects' | 'alerts' | 'profile';
export type AlertTabId = 'all' | 'urgent';

export interface SavedProfile {
  id: string;
  name: string;
  centralStudentId?: string;
  currentRasedId?: string;
  centralRasedId?: string;
  legacyRasedIds?: string[];
  identityStatus?: string;
  parentAccountId?: string;
}
