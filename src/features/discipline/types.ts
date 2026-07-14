/**
 * Domain + view types for the discipline feature.
 */

export type CaseSeverity = 'minor' | 'moderate' | 'severe' | 'critical';
export type CaseStatus = 'pending' | 'under_review' | 'resolved' | 'appealed';

export interface DisciplinaryCase {
  id: string;
  studentId: string;
  studentName: string;
  violation: string;
  description: string;
  severity: CaseSeverity;
  status: CaseStatus;
  source: 'MANUAL' | 'AUTO';
  reportedBy: string;
  actionTaken: string;
  resolutionNotes: string;
  dateReported: string;
  lastUpdated: string;
}

export interface DisciplineStats {
  total: number;
  pending: number;
  underReview: number;
  resolved: number;
  appealed: number;
}

export interface DisciplinePage {
  content: DisciplinaryCase[];
  totalPages: number;
  number: number;
}

export interface DisciplineFilters {
  status: string;
  severity: string;
}

/** Payload to create a case. */
export interface CreateCasePayload {
  studentId: string;
  studentName: string;
  violation: string;
  description: string;
  severity: string;
  reportedBy: string;
}

/** Payload to update a case's resolution. */
export interface UpdateCasePayload {
  status: string;
  actionTaken: string;
  resolutionNotes: string;
}
