'use client';

import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
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
      <PageHeader
        icon={Bell}
        title="Notifications"
        description="Restez informé des événements qui vous concernent"
        actions={
          <Button variant="outline" onClick={handleMarkAllRead} disabled={!hasUnread || markAllRead.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        }
      />

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
