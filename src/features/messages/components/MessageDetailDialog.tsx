'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Archive, Trash2, Reply } from 'lucide-react';
import { userLabel } from '../lib/resolve-messages';
import type { MessageResponse, MessageBox } from '../types';
import type { UserData } from '@/features/users';

export function MessageDetailDialog({
  message,
  box,
  users,
  onOpenChange,
  onMarkRead,
  onStar,
  onArchive,
  onDelete,
  onReply,
}: {
  message: MessageResponse | null;
  box: MessageBox;
  users: UserData[];
  onOpenChange: (open: boolean) => void;
  onMarkRead: (message: MessageResponse) => void;
  onStar: (message: MessageResponse) => void;
  onArchive: (message: MessageResponse) => void;
  onDelete: (message: MessageResponse) => void;
  onReply: (message: MessageResponse) => void;
}) {
  useEffect(() => {
    if (message && box === 'inbox' && !message.read) {
      onMarkRead(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id]);

  const counterpartId = message ? (box === 'sent' ? message.receiverId : message.senderId) : '';
  const counterpartLabel = message ? userLabel(users, counterpartId) : '';
  // Star/archive/delete/read all resolve to PATCH|DELETE .../{receiverId}, and the
  // backend now checks that path param against both the authenticated caller and the
  // message's real receiverId — so only the receiver (inbox/starred/archived) can use them.
  const canActAsReceiver = box !== 'sent';

  return (
    <Dialog open={!!message} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détail du message</DialogTitle>
          <DialogDescription>Contenu complet et actions</DialogDescription>
        </DialogHeader>
        {message && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <Avatar className="h-12 w-12 border border-slate-200">
                <AvatarImage src="/user.png" />
                <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                  {counterpartLabel.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-slate-800 font-medium">{counterpartLabel}</h3>
                <p className="text-sm text-slate-500">{box === 'sent' ? 'À' : 'De'}</p>
                <p className="text-xs text-slate-400">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-slate-800 mb-2">
                {message.subject || '(Sans objet)'}
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onReply(message)}>
                <Reply className="mr-2 h-4 w-4" />
                Répondre
              </Button>
              {canActAsReceiver && (
                <>
                  <Button variant="outline" onClick={() => onStar(message)}>
                    <Star className={`mr-2 h-4 w-4 ${message.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    {message.starred ? 'Favori' : 'Marquer favori'}
                  </Button>
                  <Button variant="outline" onClick={() => onArchive(message)}>
                    <Archive className="mr-2 h-4 w-4" />
                    {message.archived ? 'Archivé' : 'Archiver'}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onDelete(message)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
