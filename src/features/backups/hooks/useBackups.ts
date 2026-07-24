import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchBackups, createBackup, restoreBackup } from '../api/backups.api';
import { BACKUPS_QUERY_KEY } from '../constants';
import type { Backup } from '../types';

export function useBackups() {
  const { token } = useAuth();

  return useQuery<Backup[]>({
    queryKey: BACKUPS_QUERY_KEY,
    queryFn: () => fetchBackups(token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateBackup() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Backup, Error, void>({
    mutationFn: () => createBackup(token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BACKUPS_QUERY_KEY }),
  });
}

export function useRestoreBackup() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => restoreBackup(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BACKUPS_QUERY_KEY }),
  });
}
