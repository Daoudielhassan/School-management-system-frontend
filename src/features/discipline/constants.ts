/**
 * Static configuration for the discipline feature.
 */
export const DISCIPLINE_QUERY_KEY = ['discipline'] as const;
export const DISCIPLINE_PAGE_SIZE = 20;

export const STATUS_FILTER_ALL = 'all';
export const SEVERITY_FILTER_ALL = 'all';
export const ACADEMIC_YEAR_FILTER_ALL = 'all';

export const SEVERITY_OPTIONS = [
  { value: 'minor', label: 'Mineure' },
  { value: 'moderate', label: 'Modérée' },
  { value: 'severe', label: 'Sévère' },
  { value: 'critical', label: 'Critique' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'under_review', label: 'En révision' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'appealed', label: 'En appel' },
] as const;

export const VIOLATION_OPTIONS = [
  'Absences répétées',
  'Fraude académique',
  'Comportement perturbateur',
  'Violation du règlement intérieur',
  'Autre',
] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  minor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  moderate: 'bg-orange-100 text-orange-800 border-orange-300',
  severe: 'bg-red-100 text-red-800 border-red-300',
  critical: 'bg-purple-100 text-purple-800 border-purple-300',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  under_review: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  appealed: 'bg-pink-100 text-pink-800 border-pink-300',
};
