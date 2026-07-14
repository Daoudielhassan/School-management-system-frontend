/**
 * Read-side hooks for the classes feature.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchClasses, fetchClassReferenceData } from '../api/classes.api';
import { filterClasses, computeDashboardStats } from '../lib/class-selectors';
import { CLASSES_QUERY_KEY, CLASS_REFERENCE_QUERY_KEY } from '../constants';
import type {
  ClassGroup,
  ClassReferenceData,
  ClassFilters,
  ClassDashboardStats,
} from '../types';

const EMPTY_REFERENCE: ClassReferenceData = {
  departments: [],
  modules: [],
  subjects: [],
  attendanceRecords: [],
  userStats: { totalUsers: 0, admins: 0, managers: 0, instructors: 0, students: 0, enabled: 0, disabled: 0 },
};

/** Fetch the class-groups list. */
export function useClasses() {
  const { token } = useAuth();

  return useQuery<ClassGroup[]>({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: () => fetchClasses(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** Fetch reference data (departments, modules, subjects, attendance, user stats). */
export function useClassReferenceData() {
  const { token } = useAuth();

  return useQuery<ClassReferenceData>({
    queryKey: CLASS_REFERENCE_QUERY_KEY,
    queryFn: () => fetchClassReferenceData(token ?? undefined),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export interface UseClassesScreenResult {
  filteredClasses: ClassGroup[];
  reference: ClassReferenceData;
  stats: ClassDashboardStats;
  isLoading: boolean;
  isError: boolean;
}

/**
 * High-level hook for the classes screen: composes the list + reference data,
 * applies the filters and derives the dashboard stats.
 */
export function useClassesScreen(filters: ClassFilters): UseClassesScreenResult {
  const classesQuery = useClasses();
  const referenceQuery = useClassReferenceData();

  const classes = classesQuery.data ?? [];
  const reference = referenceQuery.data ?? EMPTY_REFERENCE;

  const filteredClasses = useMemo(
    () => filterClasses(classes, filters),
    [classes, filters]
  );

  const stats = useMemo(
    () => computeDashboardStats(classes, reference),
    [classes, reference]
  );

  return {
    filteredClasses,
    reference,
    stats,
    isLoading: classesQuery.isLoading,
    isError: classesQuery.isError,
  };
}
