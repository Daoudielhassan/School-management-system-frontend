/**
 * Domain + view types for the departments feature.
 */

export interface Department {
  id: string;
  code: string;
  name: string;
}

export interface DepartmentClass {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
  level: number;
}

/** Payload for create / update of a department. */
export interface DepartmentMutationPayload {
  code: string;
  name: string;
}

export interface DepartmentFilters {
  search: string;
}
