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
      <DialogContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/30 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-blue-300">Message Details</DialogTitle>
          <DialogDescription className="text-gray-300">
            Full message content and actions
          </DialogDescription>
        </DialogHeader>
        {message && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-900/20 rounded-lg">
              <Avatar className="h-12 w-12 border-2 border-blue-400/50">
                <AvatarImage src="/user.png" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {counterpartLabel.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-white font-medium">{counterpartLabel}</h3>
                <p className="text-sm text-blue-300">{box === 'sent' ? 'To' : 'From'}</p>
                <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-2">
                {message.subject || '(No subject)'}
              </h4>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20"
                onClick={() => onReply(message)}
              >
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </Button>
              {canActAsReceiver && (
                <>
                  <Button
                    variant="outline"
                    className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20"
                    onClick={() => onStar(message)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {message.starred ? 'Starred' : 'Star'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-400/30 text-gray-300 hover:bg-gray-500/20"
                    onClick={() => onArchive(message)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    {message.archived ? 'Archived' : 'Archive'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-400/30 text-red-300 hover:bg-red-500/20"
                    onClick={() => onDelete(message)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
