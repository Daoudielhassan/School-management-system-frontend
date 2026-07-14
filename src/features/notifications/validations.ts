import { z } from 'zod';
import { TYPE_OPTIONS, CHANNEL_OPTIONS } from './constants';
import type { NotificationRequest } from './types';

export const sendNotificationFormSchema = z.object({
  userId: z.string().trim().min(1, 'Select a recipient'),
  title: z.string().trim().min(1, 'Title is required'),
  message: z.string().trim().min(1, 'Message is required'),
  type: z.string().trim(),
  channel: z.string().trim(),
});

export type SendNotificationFormValues = z.infer<typeof sendNotificationFormSchema>;

export const emptySendNotificationForm: SendNotificationFormValues = {
  userId: '',
  title: '',
  message: '',
  type: TYPE_OPTIONS[0].value,
  channel: CHANNEL_OPTIONS[0].value,
};

export function toNotificationRequest(values: SendNotificationFormValues): NotificationRequest {
  return {
    userId: values.userId,
    title: values.title,
    message: values.message,
    type: values.type || undefined,
    channel: values.channel || undefined,
  };
}
