'use client';

import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';
import { extractErrorMessage } from '@/lib/api-error';
import { useMyNotifications, useMarkAllMyNotificationsRead } from '../hooks/useMyNotifications';
import { NotificationList } from './NotificationList';

export function MyNotifications() {
  const { data: notifications = [], isLoading, isError, refetch } = useMyNotifications();
  const markAllRead = useMarkAllMyNotificationsRead();

  const hasUnread = notifications.some((n) => n.status === 'UNREAD');

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 mt-1">Restez informé des événements qui vous concernent</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} disabled={!hasUnread || markAllRead.isPending}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Tout marquer comme lu
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
