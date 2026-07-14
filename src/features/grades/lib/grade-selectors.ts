/**
 * Pure selectors for the grades feature: resolve foreign keys to display
 * names, derive performance/trend, compute stats, and filter.
 */
import { SUBJECT_FILTER_ALL, PERFORMANCE_FILTER_ALL, performanceFromPercentage } from '../constants';
import type { GradeBundle, GradeResponse, StudentGrade, GradeStats, GradeFilters, GradeTrend } from '../types';

/** Resolve every raw grade to display strings, deriving performance + trend. */
export function resolveGrades(bundle: GradeBundle): StudentGrade[] {
  const students = new Map(bundle.students.map((s) => [s.id, s]));
  const subjects = new Map(bundle.subjects.map((s) => [s.id, s]));
  const instructors = new Map(bundle.instructors.map((i) => [i.id, i]));

  // Group by student+subject, sorted chronologically, to derive a trend
  // against the previous grade — the backend has no trend concept itself.
  const history = new Map<string, GradeResponse[]>();
  for (const g of bundle.grades) {
    const key = `${g.studentId}:${g.subjectId}`;
    const list = history.get(key) ?? [];
    list.push(g);
    history.set(key, list);
  }
  for (const list of history.values()) {
    list.sort((a, b) => a.gradedAt.localeCompare(b.gradedAt));
  }

  const percentageOf = (g: GradeResponse) => (g.maxValue > 0 ? (g.value / g.maxValue) * 100 : 0);

  return bundle.grades.map((g) => {
    const student = students.get(g.studentId);
    const subject = subjects.get(g.subjectId);
    const instructor = instructors.get(g.instructorId);
    const percentage = Math.round(percentageOf(g) * 10) / 10;

    const key = `${g.studentId}:${g.subjectId}`;
    const ordered = history.get(key) ?? [];
    const idx = ordered.findIndex((h) => h.id === g.id);
    const previous = idx > 0 ? ordered[idx - 1] : undefined;

    const trend: GradeTrend = !previous
      ? 'stable'
      : percentageOf(g) > percentageOf(previous)
        ? 'up'
        : percentageOf(g) < percentageOf(previous)
          ? 'down'
          : 'stable';

    return {
      id: g.id,
      studentId: g.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : g.studentId.substring(0, 8),
      subjectId: g.subjectId,
      subject: subject?.name ?? g.subjectId.substring(0, 8),
      instructorId: g.instructorId,
      instructor: instructor?.name ?? g.instructorId.substring(0, 8),
      grade: g.value,
      maxGrade: g.maxValue,
      percentage,
      performance: performanceFromPercentage(percentage),
      trend,
      examType: g.evaluationType,
      comment: g.comment,
      date: g.gradedAt,
    };
  });
}

export function computeGradeStats(grades: StudentGrade[]): GradeStats {
  const total = grades.length;
  const averagePercentage =
    total > 0 ? Math.round((grades.reduce((sum, g) => sum + g.percentage, 0) / total) * 10) / 10 : 0;

  return {
    totalStudents: new Set(grades.map((g) => g.studentId)).size,
    averagePercentage,
    excellentCount: grades.filter((g) => g.performance === 'excellent').length,
    weakCount: grades.filter((g) => g.performance === 'weak').length,
    passingRate: total > 0 ? Math.round((grades.filter((g) => g.percentage >= 50).length / total) * 1000) / 10 : 0,
  };
}

export function filterGrades(grades: StudentGrade[], filters: GradeFilters): StudentGrade[] {
  const q = filters.search.toLowerCase();
  return grades.filter((g) => {
    const matchesSearch =
      !q ||
      g.studentName.toLowerCase().includes(q) ||
      g.subject.toLowerCase().includes(q) ||
      g.studentId.toLowerCase().includes(q);
    const matchesSubject = filters.subject === SUBJECT_FILTER_ALL || g.subjectId === filters.subject;
    const matchesPerformance =
      filters.performance === PERFORMANCE_FILTER_ALL || g.performance === filters.performance;
    return matchesSearch && matchesSubject && matchesPerformance;
  });
}
