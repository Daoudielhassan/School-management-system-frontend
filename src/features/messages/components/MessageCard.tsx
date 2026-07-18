'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Eye, Star } from 'lucide-react';
import { MessageStatusIcon } from './message-icons';
import { userLabel } from '../lib/resolve-messages';
import type { MessageResponse, MessageBox } from '../types';
import type { UserData } from '@/features/users';

export function MessageCard({
  message,
  box,
  users,
  onOpen,
}: {
  message: MessageResponse;
  box: MessageBox;
  users: UserData[];
  onOpen: (message: MessageResponse) => void;
}) {
  const counterpartId = box === 'sent' ? message.receiverId : message.senderId;
  const counterpartLabel = userLabel(users, counterpartId);

  return (
    <Card
      className={`border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group ${
        !message.read && box !== 'sent' ? 'bg-blue-50/40' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src="/user.png" />
              <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                {counterpartLabel.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">
                {counterpartLabel}
              </h3>
              <p className="text-xs text-slate-400">{box === 'sent' ? 'À' : 'De'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageStatusIcon read={message.read} />
            {message.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            {message.archived && <Badge variant="outline">Archivé</Badge>}
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-medium text-slate-800 line-clamp-1">{message.subject || '(Sans objet)'}</h4>
          <p className="text-sm text-slate-500 line-clamp-2">{message.content}</p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {new Date(message.createdAt).toLocaleDateString()}
          </div>
          <Button size="sm" variant="outline" onClick={() => onOpen(message)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Ouvrir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
