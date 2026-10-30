import type React from 'react';

export type MasteryLevel = 'excellent' | 'good' | 'needs_review' | 'needs_followup' | string;
export interface LearningGameResult {
  id?: string; gameType?: string; gameTitle?: string; gameName?: string; title?: string;
  subject?: string; unit?: string; lesson?: string; score?: number; scorePercent?: number;
  percentage?: number; total?: number; totalQuestions?: number; correct?: number; wrong?: number;
  correctAnswers?: number; wrongAnswers?: number; attemptNumber?: number; masteryLevel?: MasteryLevel;
  reviewRecommendation?: string; wrongDetails?: any[]; playedAt?: string; savedAt?: string; createdAt?: string; date?: string;
}
export interface ParentLearningSummary {
  totalActivities: number; averageScore: number; latestResult: LearningGameResult | null;
  needsReview: Array<{subject?: string; lesson?: string; count?: number; latestScore?: number; recommendation?: string}>;
  strengths: Array<{subject?: string; lesson?: string; count?: number; latestScore?: number}>;
  recommendation: string;
}
export interface SummaryInsight {
  label: string; value: string | number; hint: string; icon: React.ReactNode;
  tone: 'blue' | 'green' | 'amber' | 'rose' | 'slate';
}
