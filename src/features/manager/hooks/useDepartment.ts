/**
 * Department overview hooks. Every query waits on `useMyManagerId()` first —
 * the department is resolved server-side from the manager, never passed by
 * the client.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useMyManagerId } from './useMyProfile';
import {
  fetchDepartmentClassGroups,
  fetchDepartmentSessions,
  fetchDepartmentAttendance,
  fetchDepartmentDiplomas,
  updateDepartmentAttendanceStatus,
} from '../api/department.api';
import {
  MANAGER_DEPARTMENT_CLASS_GROUPS_QUERY_KEY,
  MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY,
  MANAGER_DEPARTMENT_ATTENDANCE_QUERY_KEY,
  MANAGER_DEPARTMENT_DIPLOMAS_QUERY_KEY,
} from '../constants';
import type { ClassGroupLite, SessionData, AttendanceResponse, AttendanceStatus, DiplomaResponse } from '../types';

/** `GET /api/managers/{managerId}/department/class-groups`. */
export function useDepartmentClassGroups() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<ClassGroupLite[]>({
    queryKey: [...MANAGER_DEPARTMENT_CLASS_GROUPS_QUERY_KEY, managerId],
    queryFn: () => fetchDepartmentClassGroups(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 5 * 60_000,
  });
}

/** `GET /api/managers/{managerId}/department/sessions`. */
export function useDepartmentSessions() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<SessionData[]>({
    queryKey: [...MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY, managerId],
    queryFn: () => fetchDepartmentSessions(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/managers/{managerId}/department/attendance`. */
export function useDepartmentAttendance() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<AttendanceResponse[]>({
    queryKey: [...MANAGER_DEPARTMENT_ATTENDANCE_QUERY_KEY, managerId],
    queryFn: () => fetchDepartmentAttendance(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 60_000,
  });
}

/** `GET /api/managers/{managerId}/department/diplomas` — read-only, issued via the Admin rollover. */
export function useDepartmentDiplomas() {
  const { token } = useAuth();
  const managerId = useMyManagerId();

  return useQuery<DiplomaResponse[]>({
    queryKey: [...MANAGER_DEPARTMENT_DIPLOMAS_QUERY_KEY, managerId],
    queryFn: () => fetchDepartmentDiplomas(managerId as string, token ?? undefined),
    enabled: !!managerId && !!token,
    staleTime: 60_000,
  });
}

/** `PATCH /api/managers/{managerId}/attendance/{attendanceId}/status`. */
export function useUpdateDepartmentAttendanceStatus() {
  const { token } = useAuth();
  const managerId = useMyManagerId();
  const queryClient = useQueryClient();

  return useMutation<AttendanceResponse, Error, { attendanceId: string; status: AttendanceStatus }>({
    mutationFn: ({ attendanceId, status }) => {
      if (!managerId) throw new Error('Manager profile not loaded.');
      return updateDepartmentAttendanceStatus(managerId, attendanceId, status, token ?? undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_DEPARTMENT_ATTENDANCE_QUERY_KEY });
    },
  });
}
