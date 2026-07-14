import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchUserNotifications,
  fetchUnreadNotificationCount,
  sendNotification,
  markNotificationRead,
  dismissNotification,
} from '../api/notifications.api';
import { NOTIFICATIONS_QUERY_KEY } from '../constants';
import type { NotificationResponse, NotificationRequest } from '../types';

export function useUserNotifications(userId?: string) {
  const { token } = useAuth();

  return useQuery<NotificationResponse[]>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId],
    queryFn: () => fetchUserNotifications(userId as string, token ?? undefined),
    enabled: Boolean(userId && token),
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount(userId?: string) {
  const { token } = useAuth();

  return useQuery<number>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId, 'unread-count'],
    queryFn: () => fetchUnreadNotificationCount(userId as string, token ?? undefined),
    enabled: Boolean(userId && token),
    staleTime: 30_000,
  });
}

export function useSendNotification() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<NotificationResponse, Error, NotificationRequest>({
    mutationFn: (payload) => sendNotification(payload, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useMarkNotificationRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<NotificationResponse, Error, string>({
    mutationFn: (id) => markNotificationRead(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useDismissNotification() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<NotificationResponse, Error, string>({
    mutationFn: (id) => dismissNotification(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
