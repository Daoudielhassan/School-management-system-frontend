/**
 * Messages API layer — communication-hub-service (`/api/messages/**`, §3.2).
 */
import { apiGet, apiPatch, apiPost, apiDelete, API_ENDPOINTS } from '@/config/api';
import type { MessageResponse, MessageRequest, MessageBox } from '../types';

const BOX_URL: Record<MessageBox, (userId: string) => string> = {
  inbox: API_ENDPOINTS.MESSAGES.INBOX,
  sent: API_ENDPOINTS.MESSAGES.SENT,
  starred: API_ENDPOINTS.MESSAGES.STARRED,
  archived: API_ENDPOINTS.MESSAGES.ARCHIVED,
};

export function fetchMessageBox(
  box: MessageBox,
  userId: string,
  token?: string
): Promise<MessageResponse[]> {
  return apiGet<MessageResponse[]>(BOX_URL[box](userId), token);
}

export function fetchUnreadMessageCount(userId: string, token?: string): Promise<number> {
  return apiGet<number>(API_ENDPOINTS.MESSAGES.UNREAD_COUNT(userId), token);
}

export function sendMessage(payload: MessageRequest, token?: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>(API_ENDPOINTS.MESSAGES.SEND, payload, token);
}

export function markMessageRead(
  messageId: string,
  receiverId: string,
  token?: string
): Promise<MessageResponse> {
  return apiPatch<MessageResponse>(API_ENDPOINTS.MESSAGES.READ(messageId, receiverId), {}, token);
}

export function starMessage(
  messageId: string,
  receiverId: string,
  token?: string
): Promise<MessageResponse> {
  return apiPatch<MessageResponse>(API_ENDPOINTS.MESSAGES.STAR(messageId, receiverId), {}, token);
}

export function archiveMessage(
  messageId: string,
  receiverId: string,
  token?: string
): Promise<MessageResponse> {
  return apiPatch<MessageResponse>(API_ENDPOINTS.MESSAGES.ARCHIVE(messageId, receiverId), {}, token);
}

export function deleteMessage(messageId: string, receiverId: string, token?: string): Promise<void> {
  return apiDelete<void>(API_ENDPOINTS.MESSAGES.DELETE(messageId, receiverId), token);
}
