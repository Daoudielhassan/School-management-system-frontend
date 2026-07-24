import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchConfigs, updateConfig } from '../api/config.api';
import { CONFIG_QUERY_KEY } from '../constants';
import type { SystemConfig } from '../types';

export function useConfigs() {
  const { token } = useAuth();

  return useQuery<SystemConfig[]>({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => fetchConfigs(token ?? undefined),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/** Configs grouped by category (for the tabbed view). */
export function useGroupedConfigs() {
  const { data = [], isLoading } = useConfigs();

  const grouped = useMemo(() => {
    const acc: Record<string, SystemConfig[]> = {};
    for (const config of data) {
      const category = config.category || 'general';
      (acc[category] ??= []).push(config);
    }
    return acc;
  }, [data]);

  return { grouped, categories: Object.keys(grouped), isLoading };
}

export interface UpdateConfigInput {
  key: string;
  value: string;
}

export function useUpdateConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SystemConfig, Error, UpdateConfigInput>({
    mutationFn: ({ key, value }) => updateConfig(key, value, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY }),
  });
}
