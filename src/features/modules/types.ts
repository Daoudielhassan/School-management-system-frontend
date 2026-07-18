/**
 * Domain + view types for the teaching modules feature.
 */

export interface TeachingModule {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  level: number;
  semesterNumber: number;
  createdAt: string;
}

/** Payload for create / update of a teaching module. departmentId is only
 * read for an ADMIN caller — for a MANAGER it is always resolved server-side. */
export interface ModuleMutationPayload {
  code: string;
  name: string;
  departmentId?: string;
  level: number;
  semesterNumber: number;
}
