import type { LearningGameResult } from './learning';
export interface StudentBehavior { id?: string; type?: 'positive' | 'negative' | string; description?: string; date?: string; points?: number; [key: string]: any; }
export interface StudentGrade { id?: string; sourceGradeId?: string; category?: string; score?: number; maxScore?: number; date?: string; [key: string]: any; }
export interface AttendanceRecord { id?: string; date?: string; status?: string; [key: string]: any; }
export interface ParentSubject {
  name?: string; className?: string; subject?: string; subjectId?: string; teacherId?: string; teacherName?: string;
  schoolName?: string; schoolId?: string; schoolCode?: string; semester?: string; totalPoints?: number;
  centralStudentId?: string; centralRasedId?: string; historicalRasedId?: string; legacyRasedIds?: string[];
  behaviors?: StudentBehavior[]; grades?: StudentGrade[]; attendance?: AttendanceRecord[]; gameResults?: LearningGameResult[];
  parentMessages?: any[]; teacherReplies?: any[]; gameResultsSummary?: any; learningSummary?: any; [key: string]: any;
}
export type AnySubject = ParentSubject;
