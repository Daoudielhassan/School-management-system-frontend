/** Matches `NotificationResponse` from communication-hub-service (§3.3). */
export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  status: string;
  createdAt: string;
  readAt: string | null;
}

/** Payload for `POST /api/notifications`. `type`/`channel` default server-side. */
export interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type?: string;
  channel?: string;
}
