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
    <Card className="bg-blue-900/20 backdrop-blur-md border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-400/50">
              <AvatarImage src="/user.png" />
              <AvatarFallback className="bg-blue-600 text-white">
                {counterpartLabel.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                {counterpartLabel}
              </h3>
              <p className="text-xs text-blue-300">{box === 'sent' ? 'To' : 'From'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageStatusIcon read={message.read} />
            {message.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
            {message.archived && (
              <Badge className="border bg-gray-500/20 border-gray-400/50 text-gray-200">Archived</Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-white line-clamp-1">{message.subject || '(No subject)'}</h4>
          <p className="text-sm text-gray-300 line-clamp-2">{message.content}</p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-500/20">
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <Clock className="h-3 w-3" />
            {new Date(message.createdAt).toLocaleDateString()}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-blue-400/30 hover:bg-blue-500/20 text-blue-300"
            onClick={() => onOpen(message)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
