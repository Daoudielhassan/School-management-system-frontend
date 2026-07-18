/**
 * Read-side hooks for the attendance feature.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchAttendanceBundle } from '../api/attendance.api';
import { resolveRecords, computeStats, filterRecords } from '../lib/attendance-selectors';
import { ATTENDANCE_QUERY_KEY } from '../constants';
import type {
  AttendanceBundle,
  AttendanceQuery,
  AttendanceFilters,
  ResolvedAttendanceRecord,
  AttendanceStats,
} from '../types';

const EMPTY_BUNDLE: AttendanceBundle = {
  records: [],
  students: [],
  sessions: [],
  subjects: [],
  instructors: [],
  teachingAssignments: [],
};

/** Fetch the raw attendance bundle (records + lookups). */
export function useAttendanceBundle(query: AttendanceQuery = {}) {
  const { token } = useAuth();

  return useQuery<AttendanceBundle>({
    queryKey: [...ATTENDANCE_QUERY_KEY, query.sessionId ?? null, query.studentId ?? null],
    queryFn: () => fetchAttendanceBundle(query, token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export interface UseAttendanceScreenResult {
  records: ResolvedAttendanceRecord[];
  filteredRecords: ResolvedAttendanceRecord[];
  stats: AttendanceStats;
  isLoading: boolean;
  isError: boolean;
}

/**
 * High-level hook for the attendance screen: resolves records to display names,
 * computes stats and applies the client-side filters.
 */
export function useAttendanceScreen(
  filters: AttendanceFilters,
  query: AttendanceQuery = {}
): UseAttendanceScreenResult {
  const { data, isLoading, isError } = useAttendanceBundle(query);
  const bundle = data ?? EMPTY_BUNDLE;

  const records = useMemo(() => resolveRecords(bundle), [bundle]);
  const stats = useMemo(() => computeStats(records), [records]);
  const filteredRecords = useMemo(
    () => filterRecords(records, filters),
    [records, filters]
  );

  return { records, filteredRecords, stats, isLoading, isError };
}
