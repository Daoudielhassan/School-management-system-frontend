import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/lib/api-error';
import {
  fetchMyInbox,
  fetchMyUnreadMessageCount,
  fetchMySentMessages,
  fetchMessageThread,
  sendMyMessage,
  markMyMessageRead,
  starMyMessage,
  archiveMyMessage,
} from '../api/messages.api';
import { MANAGER_MESSAGES_QUERY_KEY } from '../constants';
import type { MessageResponse, SendMessagePayload } from '../types';

/** `GET /api/messages/inbox/me`. */
export function useMyInbox() {
  const { token } = useAuth();

  return useQuery<MessageResponse[]>({
    queryKey: [...MANAGER_MESSAGES_QUERY_KEY, 'inbox'],
    queryFn: () => fetchMyInbox(token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

/** `GET /api/messages/unread/me/count`. */
export function useMyUnreadMessageCount() {
  const { token } = useAuth();

  return useQuery<number>({
    queryKey: [...MANAGER_MESSAGES_QUERY_KEY, 'unread-count'],
    queryFn: () => fetchMyUnreadMessageCount(token ?? undefined),
    enabled: !!token,
    staleTime: 30_000,
  });
}

/** `GET /api/messages/sent/{monUserId}`. */
export function useMySentMessages() {
  const { token, userId } = useAuth();

  return useQuery<MessageResponse[]>({
    queryKey: [...MANAGER_MESSAGES_QUERY_KEY, 'sent', userId],
    queryFn: () => fetchMySentMessages(userId as string, token ?? undefined),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

/** `GET /api/messages/thread/{parentMessageId}`. */
export function useMessageThread(parentMessageId?: string) {
  const { token } = useAuth();

  return useQuery<MessageResponse[]>({
    queryKey: [...MANAGER_MESSAGES_QUERY_KEY, 'thread', parentMessageId],
    queryFn: () => fetchMessageThread(parentMessageId as string, token ?? undefined),
    enabled: !!token && !!parentMessageId,
    staleTime: 30_000,
  });
}

function useInvalidateMyMessages() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: MANAGER_MESSAGES_QUERY_KEY });
}

/** `POST /api/messages/send` — `senderId` is resolved server-side, never sent from the client. */
export function useSendMyMessage() {
  const { token } = useAuth();
  const invalidate = useInvalidateMyMessages();

  return useMutation<MessageResponse, Error, SendMessagePayload>({
    mutationFn: (payload) => sendMyMessage(payload, token ?? undefined),
    onSuccess: invalidate,
  });
}

/** `PATCH /api/messages/{messageId}/read/{monUserId}` — `userId` injected from the auth context. */
export function useMarkMyMessageRead() {
  const { token, userId } = useAuth();
  const invalidate = useInvalidateMyMessages();

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (messageId) => {
      if (!userId) throw new Error('No authenticated user.');
      return markMyMessageRead(messageId, userId, token ?? undefined);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(extractErrorMessage(error, 'Échec du marquage comme lu')),
  });
}

/** `PATCH /api/messages/{messageId}/star/{monUserId}`. */
export function useStarMyMessage() {
  const { token, userId } = useAuth();
  const invalidate = useInvalidateMyMessages();

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (messageId) => {
      if (!userId) throw new Error('No authenticated user.');
      return starMyMessage(messageId, userId, token ?? undefined);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(extractErrorMessage(error, "Échec de l'ajout aux favoris")),
  });
}

/** `PATCH /api/messages/{messageId}/archive/{monUserId}`. */
export function useArchiveMyMessage() {
  const { token, userId } = useAuth();
  const invalidate = useInvalidateMyMessages();

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (messageId) => {
      if (!userId) throw new Error('No authenticated user.');
      return archiveMyMessage(messageId, userId, token ?? undefined);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(extractErrorMessage(error, "Échec de l'archivage")),
  });
}
