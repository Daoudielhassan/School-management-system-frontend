/**
 * Domain + view types for the subjects feature.
 */

export interface Subject {
  id: string;
  code: string;
  name: string;
  teachingModuleId: string;
  createdAt: string;
}

/** Payload for create / update of a subject. */
export interface SubjectMutationPayload {
  code: string;
  name: string;
  teachingModuleId: string;
}
