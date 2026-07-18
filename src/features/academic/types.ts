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

/** Payload for `POST /api/academic-years/rollover` — Admin-only, irreversible. */
export interface RolloverPayload {
  endingYearId: string;
  startingYearId: string;
}

/** Matches `RolloverResponse` — lets the confirmation dialog show the actual blast radius. */
export interface RolloverResult {
  promotedCohortsCount: number;
  graduatedCohortsCount: number;
  diplomasIssuedCount: number;
}
