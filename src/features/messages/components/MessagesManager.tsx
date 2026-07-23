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
import { PageHeader } from '@/components/shared/PageHeader';
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
      toast.success('Message envoyé');
      setComposeOpen(false);
      setResetSignal((n) => n + 1);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'envoi du message"));
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
      toast.success('Message supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la suppression du message'));
    } finally {
      setPendingDelete(null);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6">
        <PageHeader
          icon={MessageSquare}
          title="Centre de communication"
          description="Messagerie privée entre utilisateurs"
          actions={
            <Button className="shadow-sm shadow-blue-600/20" onClick={openCompose}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau message
            </Button>
          }
        />

        <MessageStatsCards messages={filtered} unreadCount={unreadCount} />

        <MessageFilters filters={filters} onChange={setFilters} />

        <Tabs value={box} onValueChange={(v) => setBox(v as MessageBox)} className="space-y-4">
          <TabsList>
            {BOX_OPTIONS.map((o) => (
              <TabsTrigger key={o.value} value={o.value}>
                {o.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={box} className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-48" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="border-slate-200 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14">
                  <div className="p-3 rounded-2xl bg-blue-50 mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">Aucun message</h3>
                  <p className="text-slate-500 text-center mb-4">
                    {filters.search ? 'Essayez d\'ajuster votre recherche' : 'Rien ici pour le moment'}
                  </p>
                  <Button onClick={openCompose}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau message
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
          title="Supprimer le message"
          description="Voulez-vous vraiment supprimer ce message ? Cette action est irréversible."
          confirmLabel="Supprimer"
          variant="destructive"
          isConfirming={deleteMessage.isPending}
          onConfirm={handleDeleteConfirm}
        />
    </div>
  );
}
