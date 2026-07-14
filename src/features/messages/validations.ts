import { z } from 'zod';

export const composeFormSchema = z.object({
  receiverId: z.string().trim().min(1, 'Select a recipient'),
  subject: z.string().trim(),
  content: z.string().trim().min(1, 'Message is required'),
});

export type ComposeFormValues = z.infer<typeof composeFormSchema>;

export const emptyComposeForm: ComposeFormValues = {
  receiverId: '',
  subject: '',
  content: '',
};
