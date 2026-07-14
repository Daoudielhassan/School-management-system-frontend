'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import { useMessageThread, useSendMyMessage, useMarkMyMessageRead } from '../hooks/useMyMessages';
import type { MessageResponse } from '../types';

export interface MessageThreadDialogProps {
  message: MessageResponse | null;
  onOpenChange: (open: boolean) => void;
}

export function MessageThreadDialog({ message, onOpenChange }: MessageThreadDialogProps) {
  const { userId } = useAuth();
  const rootId = message ? message.parentMessageId ?? message.id : undefined;
  const { data: thread = [], isLoading } = useMessageThread(rootId);
  const sendMessage = useSendMyMessage();
  const markRead = useMarkMyMessageRead();
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (message && !message.read) {
      markRead.mutate(message.id);
    }
    // Marks the opened message read exactly once per message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id]);

  if (!message) return null;

  const root = thread.find((m) => m.parentMessageId === null) ?? message;
  const otherPartyId = root.senderId === userId ? root.receiverId : root.senderId;

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await sendMessage.mutateAsync({
        receiverId: otherPartyId,
        subject: root.subject ? `Re: ${root.subject}` : undefined,
        content: reply.trim(),
        parentMessageId: root.id,
      });
      setReply('');
      toast.success('Réponse envoyée');
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'envoi de la réponse"));
    }
  };

  return (
    <Dialog open={!!message} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{root.subject || '(Sans objet)'}</DialogTitle>
          <DialogDescription>Conversation</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(thread.length > 0 ? thread : [message])
              .slice()
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((m) => {
                const isMine = m.senderId === userId;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                      isMine ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                    )}
                  >
                    <p>{m.content}</p>
                    <p className={cn('text-[10px] mt-1', isMine ? 'text-blue-100' : 'text-slate-400')}>
                      {format(new Date(m.createdAt), 'dd/MM HH:mm')}
                    </p>
                  </div>
                );
              })}
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Répondre…"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button onClick={handleReply} disabled={sendMessage.isPending || !reply.trim()}>
            {sendMessage.isPending ? 'Envoi…' : 'Répondre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
