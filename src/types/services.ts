import type { SavedProfile } from './parent';

export interface ParentIdentity {
  centralStudentId?: string;
  centralRasedId?: string;
  legacyRasedIds?: string[];
  historicalRasedId?: string;
  schoolId?: string;
  schoolCode?: string;
  identityStatus?: string;
}

export interface ParentStudentResponse {
  status?: string;
  success?: boolean;
  version?: string;
  message?: string;
  identity?: ParentIdentity;
  login?: { requestedCode?: string; matchedBy?: string; historicalRasedId?: string };
  subjects?: any[];
  data?: any;
  gameResultsSummary?: any;
  learningSummary?: any;
}

export interface LinkParentStudentResult {
  success?: boolean;
  status?: string;
  message?: string;
  added?: number;
  updated?: number;
  parentAccountId?: string;
  centralStudentId?: string;
  linkId?: string;
}

export interface CachedStudentPayload {
  identity: ParentIdentity;
  subjects: any[];
}

export type { SavedProfile };
