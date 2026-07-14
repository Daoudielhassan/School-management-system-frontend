import type { MessageBox } from './types';

export const MESSAGES_QUERY_KEY = ['messages'] as const;

export const BOX_OPTIONS: { value: MessageBox; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'sent', label: 'Sent' },
  { value: 'starred', label: 'Starred' },
  { value: 'archived', label: 'Archived' },
];
