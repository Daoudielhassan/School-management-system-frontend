/**
 * Notifications API layer — communication-hub-service. Reads go through the
 * JWT-scoped `/me` routes; `read-all` still needs the caller's own id
 * (`{monUserId}`), injected by the hooks from `useAuth()`.
 */
import { apiGet, apiPatch, API_ENDPOINTS } from '@/config/api';
import type { NotificationResponse } from '../types';

/** `GET /api/notifications/user/me`. */
export function fetchMyNotifications(token?: string): Promise<NotificationResponse[]> {
  return apiGet<NotificationResponse[]>(API_ENDPOINTS.NOTIFICATIONS.BY_USER_ME, token);
}

/** `GET /api/notifications/user/me/unread/count` — raw number, no envelope. */
export function fetchMyUnreadNotificationCount(token?: string): Promise<number> {
  return apiGet<number>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT_ME, token);
}

/** `PATCH /api/notifications/{id}/read`. */
export function markMyNotificationRead(id: string, token?: string): Promise<NotificationResponse> {
  return apiPatch<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.READ(id), {}, token);
}

/** `PATCH /api/notifications/{id}/dismiss`. */
export function dismissMyNotification(id: string, token?: string): Promise<NotificationResponse> {
  return apiPatch<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.DISMISS(id), {}, token);
}

/** `PATCH /api/notifications/user/{monUserId}/read-all`. */
export function markAllMyNotificationsRead(userId: string, token?: string): Promise<void> {
  return apiPatch<void>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL(userId), {}, token);
}
