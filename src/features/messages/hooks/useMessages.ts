import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchMessageBox,
  fetchUnreadMessageCount,
  sendMessage,
  markMessageRead,
  starMessage,
  archiveMessage,
  deleteMessage,
} from '../api/messages.api';
import { MESSAGES_QUERY_KEY } from '../constants';
import type { MessageResponse, MessageRequest, MessageBox, MessageFilters } from '../types';

export function useMessageBox(box: MessageBox) {
  const { token, userId } = useAuth();

  return useQuery<MessageResponse[]>({
    queryKey: [...MESSAGES_QUERY_KEY, box, userId],
    queryFn: () => fetchMessageBox(box, userId as string, token ?? undefined),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useUnreadMessageCount() {
  const { token, userId } = useAuth();

  return useQuery<number>({
    queryKey: [...MESSAGES_QUERY_KEY, 'unread-count', userId],
    queryFn: () => fetchUnreadMessageCount(userId as string, token ?? undefined),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

function useInvalidateMessages() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
}

export function useSendMessage() {
  const { token } = useAuth();
  const invalidate = useInvalidateMessages();

  return useMutation<MessageResponse, Error, MessageRequest>({
    mutationFn: (payload) => sendMessage(payload, token ?? undefined),
    onSuccess: invalidate,
  });
}

export function useMarkMessageRead() {
  const { token } = useAuth();
  const invalidate = useInvalidateMessages();

  return useMutation<MessageResponse, Error, { messageId: string; receiverId: string }>({
    mutationFn: ({ messageId, receiverId }) => markMessageRead(messageId, receiverId, token ?? undefined),
    onSuccess: invalidate,
  });
}

export function useStarMessage() {
  const { token } = useAuth();
  const invalidate = useInvalidateMessages();

  return useMutation<MessageResponse, Error, { messageId: string; receiverId: string }>({
    mutationFn: ({ messageId, receiverId }) => starMessage(messageId, receiverId, token ?? undefined),
    onSuccess: invalidate,
  });
}

export function useArchiveMessage() {
  const { token } = useAuth();
  const invalidate = useInvalidateMessages();

  return useMutation<MessageResponse, Error, { messageId: string; receiverId: string }>({
    mutationFn: ({ messageId, receiverId }) => archiveMessage(messageId, receiverId, token ?? undefined),
    onSuccess: invalidate,
  });
}

export function useDeleteMessage() {
  const { token } = useAuth();
  const invalidate = useInvalidateMessages();

  return useMutation<void, Error, { messageId: string; receiverId: string }>({
    mutationFn: ({ messageId, receiverId }) => deleteMessage(messageId, receiverId, token ?? undefined),
    onSuccess: invalidate,
  });
}

export function useMessagesScreen(box: MessageBox, filters: MessageFilters) {
  const { data = [], isLoading } = useMessageBox(box);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    if (!q) return data;
    return data.filter(
      (m) => (m.subject ?? '').toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
    );
  }, [data, filters]);

  return { filtered, isLoading };
}
