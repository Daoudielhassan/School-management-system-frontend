'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useMyInbox, useMySentMessages } from '../hooks/useMyMessages';
import { MessageList } from './MessageList';
import { ComposeMessageDialog } from './ComposeMessageDialog';
import { MessageThreadDialog } from './MessageThreadDialog';
import type { MessageResponse } from '../types';

export function MyMessages() {
  const { data: inbox = [], isLoading: inboxLoading, isError: inboxError, refetch: refetchInbox } = useMyInbox();
  const {
    data: sent = [],
    isLoading: sentLoading,
    isError: sentError,
    refetch: refetchSent,
  } = useMySentMessages();
  const [composeOpen, setComposeOpen] = useState(false);
  const [openMessage, setOpenMessage] = useState<MessageResponse | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Messages</h1>
          <p className="text-slate-500 mt-1">Échangez avec les étudiants, managers et l&apos;administration</p>
        </div>
        <Button onClick={() => setComposeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau message
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="inbox">
            <TabsList>
              <TabsTrigger value="inbox">Boîte de réception</TabsTrigger>
              <TabsTrigger value="sent">Envoyés</TabsTrigger>
            </TabsList>

            <TabsContent value="inbox">
              <MessageList
                messages={inbox}
                isLoading={inboxLoading}
                isError={inboxError}
                onRetry={refetchInbox}
                onOpen={setOpenMessage}
              />
            </TabsContent>

            <TabsContent value="sent">
              <MessageList
                messages={sent}
                isLoading={sentLoading}
                isError={sentError}
                onRetry={refetchSent}
                onOpen={setOpenMessage}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ComposeMessageDialog open={composeOpen} onOpenChange={setComposeOpen} />

      <MessageThreadDialog
        message={openMessage}
        onOpenChange={(open) => {
          if (!open) setOpenMessage(null);
        }}
      />
    </div>
  );
}
