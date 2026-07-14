export type MessageBox = 'inbox' | 'sent' | 'starred' | 'archived';

/** Matches `MessageResponse` from communication-hub-service (§3.2). */
export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  parentMessageId: string | null;
  subject: string | null;
  content: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
  createdAt: string;
}

/** Matches `MessageRequest` sent to `POST /api/messages/send`. */
export interface MessageRequest {
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  parentMessageId?: string;
}

export interface MessageFilters {
  search: string;
}
