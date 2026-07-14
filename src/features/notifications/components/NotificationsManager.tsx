'use client';

/**
 * Container: send-notification form (left) + a chosen user's inbox (right).
 * Wired to the real communication-hub `/api/notifications` endpoints, which
 * are per-user only — there is no broadcast/scheduling concept server-side.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { extractErrorMessage } from '@/lib/api-error';
import { useUsers } from '@/features/users';
import { SendNotificationForm } from './SendNotificationForm';
import { buildNotificationColumns } from './notification-columns';
import {
  useUserNotifications,
  useUnreadNotificationCount,
  useSendNotification,
  useMarkNotificationRead,
  useDismissNotification,
} from '../hooks/useNotifications';
import { toNotificationRequest, type SendNotificationFormValues } from '../validations';

export function NotificationsManager() {
  const [resetSignal, setResetSignal] = useState(0);
  const [viewUserId, setViewUserId] = useState('');

  const { data: users = [] } = useUsers();
  const { data: notifications = [], isLoading } = useUserNotifications(viewUserId || undefined);
  const { data: unreadCount } = useUnreadNotificationCount(viewUserId || undefined);

  const sendNotification = useSendNotification();
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();

  const columns = useMemo(
    () =>
      buildNotificationColumns(
        (n) => markRead.mutate(n.id),
        (n) => dismiss.mutate(n.id)
      ),
    [markRead, dismiss]
  );

  const handleSend = async (values: SendNotificationFormValues) => {
    try {
      await sendNotification.mutateAsync(toNotificationRequest(values));
      toast.success('Notification sent');
      setResetSignal((n) => n + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to send notification'));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Send a notification to a user and review their inbox.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>Create a new notification for a specific user.</CardDescription>
          </CardHeader>
          <CardContent>
            <SendNotificationForm
              users={users}
              isSubmitting={sendNotification.isPending}
              resetSignal={resetSignal}
              onSubmit={handleSend}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Inbox
                </CardTitle>
                <CardDescription>Notifications for the selected user.</CardDescription>
              </div>
              {viewUserId && unreadCount !== undefined && unreadCount > 0 && (
                <Badge>{unreadCount} unread</Badge>
              )}
            </div>
            <Select value={viewUserId} onValueChange={setViewUserId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a user to view their inbox" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstname} {u.lastname} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {viewUserId ? (
              <DataTable columns={columns} data={notifications} isLoading={isLoading} paginated />
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Select a user above to view their notifications.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
