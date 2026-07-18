/**
 * Messages API layer — communication-hub-service. Reads go through the
 * JWT-scoped `/me` routes; actions on a specific message still need the
 * caller's own id (`{monUserId}`), injected by the hooks from `useAuth()`.
 */
import { apiGet, apiPatch, apiPost, API_ENDPOINTS } from '@/config/api';
import type { MessageResponse, SendMessagePayload } from '../types';

/** `GET /api/messages/inbox/me`. */
export function fetchMyInbox(token?: string): Promise<MessageResponse[]> {
  return apiGet<MessageResponse[]>(API_ENDPOINTS.MESSAGES.INBOX_ME, token);
}

/** `GET /api/messages/unread/me/count` — raw number, no envelope. */
export function fetchMyUnreadMessageCount(token?: string): Promise<number> {
  return apiGet<number>(API_ENDPOINTS.MESSAGES.UNREAD_COUNT_ME, token);
}

/** `GET /api/messages/sent/{monUserId}`. */
export function fetchMySentMessages(userId: string, token?: string): Promise<MessageResponse[]> {
  return apiGet<MessageResponse[]>(API_ENDPOINTS.MESSAGES.SENT(userId), token);
}

/** `GET /api/messages/thread/{parentMessageId}`. */
export function fetchMessageThread(
  parentMessageId: string,
  token?: string
): Promise<MessageResponse[]> {
  return apiGet<MessageResponse[]>(API_ENDPOINTS.MESSAGES.THREAD(parentMessageId), token);
}

/** `POST /api/messages/send` — `senderId` is resolved server-side from the JWT, never sent. */
export function sendMyMessage(payload: SendMessagePayload, token?: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>(API_ENDPOINTS.MESSAGES.SEND, payload, token);
}

/** `PATCH /api/messages/{messageId}/read/{monUserId}`. */
export function markMyMessageRead(
  messageId: string,
  userId: string,
  token?: string
): Promise<MessageResponse> {
  return apiPatch<MessageResponse>(API_ENDPOINTS.MESSAGES.READ(messageId, userId), {}, token);
}

/** `PATCH /api/messages/{messageId}/star/{monUserId}`. */
export function starMyMessage(
  messageId: string,
  userId: string,
  token?: string
): Promise<MessageResponse> {
  return apiPatch<MessageResponse>(API_ENDPOINTS.MESSAGES.STAR(messageId, userId), {}, token);
}

/** `PATCH /api/messages/{messageId}/archive/{monUserId}`. */
export function archiveMyMessage(
  messageId: string,
  userId: string,
  token?: string
): Promise<MessageResponse> {
  return apiPatch<MessageResponse>(API_ENDPOINTS.MESSAGES.ARCHIVE(messageId, userId), {}, token);
}
