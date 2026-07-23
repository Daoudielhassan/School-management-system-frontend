'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RecipientPicker, type RecipientOption } from '@/components/shared/RecipientPicker';
import { extractErrorMessage } from '@/lib/api-error';
import { useSendMyMessage } from '../hooks/useMyMessages';
import { useManagerInstructors } from '../hooks/useTeachingAssignments';
import { useDepartmentStudents } from '../hooks/useDepartmentStudents';

export interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the recipient, e.g. when replying from another screen. */
  defaultReceiverId?: string;
}

export function ComposeMessageDialog({ open, onOpenChange, defaultReceiverId }: ComposeMessageDialogProps) {
  const sendMessage = useSendMyMessage();
  const { data: instructors = [] } = useManagerInstructors();
  const { students } = useDepartmentStudents();
  const [receiverId, setReceiverId] = useState(defaultReceiverId ?? '');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const recipients = useMemo<RecipientOption[]>(
    () => [
      ...instructors.map((i) => ({ id: i.userId, name: i.name, subtitle: 'Instructeur' })),
      ...students.map((s) => ({ id: s.userId, name: `${s.firstName} ${s.lastName}`, subtitle: 'Étudiant' })),
    ],
    [instructors, students]
  );

  const reset = () => {
    setReceiverId(defaultReceiverId ?? '');
    setSubject('');
    setContent('');
  };

  const handleSubmit = async () => {
    if (!receiverId.trim() || !content.trim()) return;
    try {
      await sendMessage.mutateAsync({ receiverId: receiverId.trim(), subject: subject.trim() || undefined, content: content.trim() });
      toast.success('Message envoyé');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'envoi du message"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau message</DialogTitle>
          <DialogDescription>Envoyer un message à un utilisateur.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Destinataire</Label>
            <RecipientPicker
              recipients={recipients}
              value={receiverId}
              onChange={setReceiverId}
              disabled={!!defaultReceiverId}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Objet</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Message</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sendMessage.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={sendMessage.isPending || !receiverId.trim() || !content.trim()}>
            {sendMessage.isPending ? 'Envoi…' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
