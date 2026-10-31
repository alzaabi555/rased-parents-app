export interface SubjectContextLike {
  centralStudentId?: unknown;
  subjectId?: unknown;
  subject?: unknown;
  classId?: unknown;
  className?: unknown;
  semester?: unknown;
  schoolCode?: unknown;
  teacherId?: unknown;
  teacherName?: unknown;
}

const normalizeContextPart = (value: unknown) =>
  String(value ?? '').replace(/\s+/g, ' ').trim().toUpperCase();

/**
 * A single student has one active teacher per subject.
 * TeacherID is retained for ownership and messaging, while the stable subject
 * context is based on student, subject, class, semester, and school.
 */
export const getSubjectContextKey = (subject?: SubjectContextLike | null) => {
  if (!subject) return '';
  return [
    normalizeContextPart(subject.centralStudentId),
    normalizeContextPart(subject.subjectId || subject.subject),
    normalizeContextPart(subject.classId || subject.className),
    normalizeContextPart(subject.semester),
    normalizeContextPart(subject.schoolCode),
  ].join('|');
};

export const isSameSubjectContext = (
  left?: SubjectContextLike | null,
  right?: SubjectContextLike | null,
) => {
  const leftKey = getSubjectContextKey(left);
  const rightKey = getSubjectContextKey(right);
  return Boolean(leftKey && rightKey && leftKey === rightKey);
};

export const validateSingleTeacherSubject = (subject?: SubjectContextLike | null) => {
  const missing: string[] = [];
  if (!normalizeContextPart(subject?.centralStudentId)) missing.push('CentralStudentID');
  if (!normalizeContextPart(subject?.subjectId || subject?.subject)) missing.push('SubjectID');
  if (!normalizeContextPart(subject?.classId || subject?.className)) missing.push('ClassID');
  if (!normalizeContextPart(subject?.semester)) missing.push('Semester');
  if (!normalizeContextPart(subject?.schoolCode)) missing.push('SchoolCode');
  if (!normalizeContextPart(subject?.teacherId)) missing.push('TeacherID');
  return { valid: missing.length === 0, missing };
};

export const dedupeSubjectContexts = <T extends SubjectContextLike>(subjects: T[]) => {
  const unique = new Map<string, T>();
  const conflicts: Array<{ key: string; existingTeacherId: string; incomingTeacherId: string }> = [];

  subjects.forEach(subject => {
    const key = getSubjectContextKey(subject);
    if (!key || !unique.has(key)) {
      unique.set(key || `UNRESOLVED-${unique.size}`, subject);
      return;
    }

    const existing = unique.get(key)!;
    const existingTeacherId = normalizeContextPart(existing.teacherId);
    const incomingTeacherId = normalizeContextPart(subject.teacherId);
    if (existingTeacherId && incomingTeacherId && existingTeacherId !== incomingTeacherId) {
      conflicts.push({ key, existingTeacherId, incomingTeacherId });
      return;
    }

    // Keep the newest complete cloud object while preserving one subject card.
    unique.set(key, { ...existing, ...subject });
  });

  return { subjects: Array.from(unique.values()), conflicts };
};
