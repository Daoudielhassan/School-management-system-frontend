export type GradePerformance = 'excellent' | 'good' | 'average' | 'weak';
export type GradeTrend = 'up' | 'down' | 'stable';

/** Matches `GradeResponse` from education-core-service (§2.10). */
export interface GradeResponse {
  id: string;
  studentId: string;
  subjectId: string;
  instructorId: string;
  /** Set server-side from the active academic year when the grade is recorded — never client-supplied. */
  academicYearId: string;
  value: number;
  maxValue: number;
  evaluationType: string;
  comment: string | null;
  gradedAt: string;
  createdAt: string;
}

/** Payload for `POST /api/grades`. */
export interface GradeMutationPayload {
  studentId: string;
  subjectId: string;
  instructorId: string;
  value: number;
  maxValue: number;
  evaluationType: string;
  comment?: string;
}

export interface StudentLite {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SubjectLite {
  id: string;
  name: string;
}

export interface InstructorLite {
  id: string;
  name: string;
}

/** Raw bundle returned by the API layer (grades + lookup lists). */
export interface GradeBundle {
  grades: GradeResponse[];
  students: StudentLite[];
  subjects: SubjectLite[];
  instructors: InstructorLite[];
}

/** A grade resolved to display strings, with client-derived performance/trend. */
export interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subject: string;
  instructorId: string;
  instructor: string;
  academicYearId: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  performance: GradePerformance;
  trend: GradeTrend;
  examType: string;
  comment: string | null;
  date: string;
}

/** Computed client-side from the resolved grades — no backend aggregate exists. */
export interface GradeStats {
  totalStudents: number;
  averagePercentage: number;
  excellentCount: number;
  weakCount: number;
  passingRate: number;
}

export interface GradeFilters {
  search: string;
  subject: string;
  performance: string;
  academicYear: string;
}
