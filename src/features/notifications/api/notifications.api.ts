/**
 * Notifications API layer — communication-hub-service `/api/notifications` (§3.3).
 * Per-user only: the backend has no broadcast/scheduling concept.
 */
import { apiGet, apiPatch, apiPost, API_ENDPOINTS } from '@/config/api';
import type { NotificationResponse, NotificationRequest } from '../types';

export function fetchUserNotifications(userId: string, token?: string): Promise<NotificationResponse[]> {
  return apiGet<NotificationResponse[]>(API_ENDPOINTS.NOTIFICATIONS.BY_USER(userId), token);
}

export function fetchUnreadNotificationCount(userId: string, token?: string): Promise<number> {
  return apiGet<number>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT(userId), token);
}

export function sendNotification(
  payload: NotificationRequest,
  token?: string
): Promise<NotificationResponse> {
  return apiPost<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.BASE, payload, token);
}

export function markNotificationRead(id: string, token?: string): Promise<NotificationResponse> {
  return apiPatch<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.READ(id), {}, token);
}

export function dismissNotification(id: string, token?: string): Promise<NotificationResponse> {
  return apiPatch<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.DISMISS(id), {}, token);
}
