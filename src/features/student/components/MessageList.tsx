'use client';

import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Star, Archive, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStarMyMessage, useArchiveMyMessage } from '../hooks/useMyMessages';
import type { MessageResponse } from '../types';

export interface MessageListProps {
  messages: MessageResponse[];
  isLoading?: boolean;
  onOpen: (message: MessageResponse) => void;
}

export function MessageList({ messages, isLoading, onOpen }: MessageListProps) {
  const starMessage = useStarMyMessage();
  const archiveMessage = useArchiveMyMessage();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucun message</div>;
  }

  const sorted = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="divide-y divide-slate-100">
      {sorted.map((message) => (
        <button
          key={message.id}
          onClick={() => onOpen(message)}
          className={cn(
            'w-full flex items-start gap-3 py-3 px-2 text-left rounded-lg hover:bg-slate-50 transition-colors',
            !message.read && 'bg-blue-50/40'
          )}
        >
          <div className="pt-1.5">
            <Circle className={cn('h-2 w-2', message.read ? 'text-transparent' : 'fill-blue-500 text-blue-500')} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={cn('text-sm truncate', message.read ? 'text-slate-600' : 'font-semibold text-slate-900')}>
                {message.subject || '(Sans objet)'}
              </p>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {format(new Date(message.createdAt), 'dd/MM HH:mm')}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{message.content}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                starMessage.mutate(message.id);
              }}
            >
              <Star className={cn('h-4 w-4', message.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                archiveMessage.mutate(message.id);
              }}
            >
              <Archive className={cn('h-4 w-4', message.archived ? 'text-blue-500' : 'text-slate-300')} />
            </Button>
          </div>
        </button>
      ))}
    </div>
  );
}
