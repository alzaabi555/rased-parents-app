export const STORAGE_KEYS = {
  parentAccountId: 'rased_parent_account_id',
  parentSecretCode: 'rased_parent_secret_code',
  activeCentralStudentId: 'rased_parent_active_central_student_id',
  savedProfiles: 'rased_saved_profiles',
  studentData: (centralStudentId: string) => `rased_parent_student_data_${centralStudentId}`,
  legacyData: (rasedId: string) => `rased_data_${rasedId}`,
  conversation: (rasedId: string, schoolName: string, subject: string) => `rased_parent_conversation_${rasedId}_${schoolName}_${subject}`,
} as const;
