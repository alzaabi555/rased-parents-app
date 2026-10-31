export interface ParentIdentity {
  centralStudentId?: string; centralRasedId?: string; legacyRasedIds?: string[]; historicalRasedId?: string;
  schoolId?: string; schoolCode?: string; identityStatus?: string;
}
export interface ParentStudentResult {
  status?: string; success?: boolean; message?: string; identity?: ParentIdentity; subjects?: any[]; data?: any;
  gameResultsSummary?: any; learningSummary?: any;
}
