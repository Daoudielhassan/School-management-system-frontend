'use client';

import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarkMyNotificationRead, useDismissMyNotification } from '../hooks/useMyNotifications';
import type { NotificationResponse } from '../types';

export function NotificationList({
  notifications,
  isLoading,
}: {
  notifications: NotificationResponse[];
  isLoading?: boolean;
}) {
  const markRead = useMarkMyNotificationRead();
  const dismiss = useDismissMyNotification();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucune notification</div>;
  }

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="divide-y divide-slate-100">
      {sorted.map((n) => {
        const isUnread = n.status === 'UNREAD';
        return (
          <div
            key={n.id}
            className={cn('flex items-start gap-3 py-3 px-2 rounded-lg', isUnread && 'bg-blue-50/40')}
          >
            <div className="pt-1.5">
              <Circle className={cn('h-2 w-2', isUnread ? 'fill-blue-500 text-blue-500' : 'text-transparent')} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn('text-sm', isUnread ? 'font-semibold text-slate-900' : 'text-slate-600')}>
                  {n.title}
                </p>
                <Badge variant="outline" className="text-[10px]">
                  {n.type}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-1">{format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {isUnread && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Marquer comme lu"
                  onClick={() => markRead.mutate(n.id)}
                >
                  <Check className="h-4 w-4 text-slate-400" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Ignorer"
                onClick={() => dismiss.mutate(n.id)}
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
