import type { ManagerStatus } from './types';

export const MANAGERS_QUERY_KEY = ['managers'] as const;
export const MANAGER_REFERENCE_QUERY_KEY = ['managers', 'reference'] as const;
export const MANAGERS_PAGE_SIZE = 10;

export const MANAGER_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'HEAD_OF_DEPARTMENT', label: 'Chef de département' },
  { value: 'ACADEMIC_DIRECTOR', label: 'Directeur académique' },
  { value: 'PROGRAM_COORDINATOR', label: 'Coordinateur de programme' },
  { value: 'YEAR_COORDINATOR', label: 'Coordinateur d’année' },
  { value: 'QUALITY_ASSURANCE_MANAGER', label: 'Responsable qualité' },
  { value: 'STUDENT_AFFAIRS_MANAGER', label: 'Responsable vie étudiante' },
];

export const MANAGER_STATUS_OPTIONS: { value: ManagerStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'ON_LEAVE', label: 'En congé' },
  { value: 'SUSPENDED', label: 'Suspendu' },
  { value: 'TERMINATED', label: 'Résilié' },
];
