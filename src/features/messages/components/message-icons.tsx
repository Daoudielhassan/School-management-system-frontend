'use client';

import { MessageSquare, Eye } from 'lucide-react';

export function MessageStatusIcon({ read }: { read: boolean }) {
  return read ? (
    <Eye className="h-4 w-4 text-blue-400" />
  ) : (
    <MessageSquare className="h-4 w-4 text-cyan-400" />
  );
}
