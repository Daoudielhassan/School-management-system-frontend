'use client';

/**
 * Container for the communication center. Wired to the real communication-hub
 * messaging endpoints (1:1 messages only — the backend has no broadcast).
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { useUsers } from '@/features/users';
import { MessageStatsCards } from './MessageStatsCards';
import { MessageFilters } from './MessageFilters';
import { MessageCard } from './MessageCard';
import { ComposeMessageDialog } from './ComposeMessageDialog';
import { MessageDetailDialog } from './MessageDetailDialog';
import {
  useMessagesScreen,
  useUnreadMessageCount,
  useSendMessage,
  useMarkMessageRead,
  useStarMessage,
  useArchiveMessage,
  useDeleteMessage,
} from '../hooks/useMessages';
import { emptyComposeForm, type ComposeFormValues } from '../validations';
import { BOX_OPTIONS } from '../constants';
import type { MessageResponse, MessageBox, MessageFilters as Filters } from '../types';

const EMPTY_FILTERS: Filters = { search: '' };

export function MessagesManager() {
  const { userId } = useAuth();
  const [box, setBox] = useState<MessageBox>('inbox');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<MessageResponse | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyDefaults, setReplyDefaults] = useState<ComposeFormValues | undefined>(undefined);
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
  const [resetSignal, setResetSignal] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<MessageResponse | null>(null);

  const { filtered, isLoading } = useMessagesScreen(box, filters);
  const { data: unreadCount } = useUnreadMessageCount();
  const { data: users = [] } = useUsers();

  const sendMessage = useSendMessage();
  const markRead = useMarkMessageRead();
  const starMessage = useStarMessage();
  const archiveMessage = useArchiveMessage();
  const deleteMessage = useDeleteMessage();

  const openCompose = () => {
    setReplyDefaults(undefined);
    setReplyToId(undefined);
    setComposeOpen(true);
  };

  const openReply = (message: MessageResponse) => {
    const to = box === 'sent' ? message.receiverId : message.senderId;
    setReplyDefaults({
      receiverId: to,
      subject: message.subject ? `Re: ${message.subject}` : '',
      content: '',
    });
    setReplyToId(message.id);
    setSelected(null);
    setComposeOpen(true);
  };

  const handleSend = async (values: ComposeFormValues) => {
    try {
      await sendMessage.mutateAsync({
        senderId: userId as string,
        receiverId: values.receiverId,
        subject: values.subject || undefined,
        content: values.content,
        parentMessageId: replyToId,
      });
      toast.success('Message sent');
      setComposeOpen(false);
      setResetSignal((n) => n + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to send message'));
    }
  };

  const handleMarkRead = (message: MessageResponse) => {
    markRead.mutate({ messageId: message.id, receiverId: message.receiverId });
  };

  const handleStar = (message: MessageResponse) => {
    starMessage.mutate({ messageId: message.id, receiverId: message.receiverId });
  };

  const handleArchive = (message: MessageResponse) => {
    archiveMessage.mutate({ messageId: message.id, receiverId: message.receiverId });
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMessage.mutateAsync({
        messageId: pendingDelete.id,
        receiverId: pendingDelete.receiverId,
      });
      toast.success('Message deleted');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete message'));
    } finally {
      setPendingDelete(null);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-blue-700">
              Communication Center
            </h1>
            <p className="text-slate-600 mt-2">Private messaging between users</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            onClick={openCompose}
          >
            <Plus className="mr-2 h-4 w-4" />
            Compose Message
          </Button>
        </div>

        <MessageStatsCards messages={filtered} unreadCount={unreadCount} />

        <MessageFilters filters={filters} onChange={setFilters} />

        <Tabs value={box} onValueChange={(v) => setBox(v as MessageBox)} className="space-y-4">
          <TabsList className="bg-blue-900/20 backdrop-blur-md border border-blue-500/30">
            {BOX_OPTIONS.map((o) => (
              <TabsTrigger key={o.value} value={o.value} className="data-[state=active]:bg-blue-500/30">
                {o.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={box} className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-blue-900/20 backdrop-blur-md rounded-xl h-48 border border-blue-500/30"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="bg-blue-900/20 backdrop-blur-md border-blue-500/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-blue-400/50 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No messages found</h3>
                  <p className="text-gray-300 text-center mb-4">
                    {filters.search ? 'Try adjusting your search terms' : 'Nothing here yet'}
                  </p>
                  <Button
                    onClick={openCompose}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Compose Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    box={box}
                    users={users}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ComposeMessageDialog
          open={composeOpen}
          onOpenChange={setComposeOpen}
          users={users}
          defaultValues={replyDefaults ?? emptyComposeForm}
          isSubmitting={sendMessage.isPending}
          resetSignal={resetSignal}
          onSubmit={handleSend}
        />

        <MessageDetailDialog
          message={selected}
          box={box}
          users={users}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          onMarkRead={handleMarkRead}
          onStar={handleStar}
          onArchive={handleArchive}
          onDelete={setPendingDelete}
          onReply={openReply}
        />

        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          title="Delete message"
          description="Are you sure you want to delete this message? This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          isConfirming={deleteMessage.isPending}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
