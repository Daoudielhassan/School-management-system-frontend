/**
 * Types for the academic-years feature.
 */
export interface AcademicYear {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  /** ACTIVE | UPCOMING | ARCHIVED (computed by backend from dates). */
  status: string;
}

export interface CreateAcademicYearPayload {
  code: string;
  startDate: string;
  endDate: string;
}
