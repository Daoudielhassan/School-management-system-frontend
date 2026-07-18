import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/lib/api-error';
import {
  fetchMyNotifications,
  fetchMyUnreadNotificationCount,
  markMyNotificationRead,
  dismissMyNotification,
  markAllMyNotificationsRead,
} from '../api/notifications.api';
import { STUDENT_NOTIFICATIONS_QUERY_KEY } from '../constants';
import type { NotificationResponse } from '../types';

/** `GET /api/notifications/user/me`. */
export function useMyNotifications() {
  const { token } = useAuth();

  return useQuery<NotificationResponse[]>({
    queryKey: STUDENT_NOTIFICATIONS_QUERY_KEY,
    queryFn: () => fetchMyNotifications(token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

/** `GET /api/notifications/user/me/unread/count`. */
export function useMyUnreadNotificationCount() {
  const { token } = useAuth();

  return useQuery<number>({
    queryKey: [...STUDENT_NOTIFICATIONS_QUERY_KEY, 'unread-count'],
    queryFn: () => fetchMyUnreadNotificationCount(token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

function useInvalidateMyNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: STUDENT_NOTIFICATIONS_QUERY_KEY });
}

/** `PATCH /api/notifications/{id}/read`. */
export function useMarkMyNotificationRead() {
  const { token } = useAuth();
  const invalidate = useInvalidateMyNotifications();

  return useMutation<NotificationResponse, Error, string>({
    mutationFn: (id) => markMyNotificationRead(id, token ?? undefined),
    onSuccess: invalidate,
    onError: (error) => toast.error(extractErrorMessage(error, 'Échec du marquage comme lu')),
  });
}

/** `PATCH /api/notifications/{id}/dismiss`. */
export function useDismissMyNotification() {
  const { token } = useAuth();
  const invalidate = useInvalidateMyNotifications();

  return useMutation<NotificationResponse, Error, string>({
    mutationFn: (id) => dismissMyNotification(id, token ?? undefined),
    onSuccess: invalidate,
    onError: (error) => toast.error(extractErrorMessage(error, 'Échec de la mise à jour')),
  });
}

/** `PATCH /api/notifications/user/{monUserId}/read-all` — `userId` injected from the auth context. */
export function useMarkAllMyNotificationsRead() {
  const { token, userId } = useAuth();
  const invalidate = useInvalidateMyNotifications();

  return useMutation<void, Error, void>({
    mutationFn: () => {
      if (!userId) throw new Error('No authenticated user.');
      return markAllMyNotificationsRead(userId, token ?? undefined);
    },
    onSuccess: invalidate,
  });
}
