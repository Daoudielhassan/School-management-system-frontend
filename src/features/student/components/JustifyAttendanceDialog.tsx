'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { extractErrorMessage } from '@/lib/api-error';
import { useJustifyAttendance } from '../hooks/useMyAttendance';
import type { AttendanceResponse } from '../types';

export interface JustifyAttendanceDialogProps {
  record: AttendanceResponse | null;
  onOpenChange: (open: boolean) => void;
}

export function JustifyAttendanceDialog({ record, onOpenChange }: JustifyAttendanceDialogProps) {
  const [reason, setReason] = useState('');
  const justify = useJustifyAttendance();

  const handleSubmit = async () => {
    if (!record || !reason.trim()) return;
    try {
      await justify.mutateAsync({ id: record.id, payload: { reason: reason.trim() } });
      toast.success('Justification envoyée');
      setReason('');
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'envoi de la justification"));
    }
  };

  return (
    <Dialog
      open={!!record}
      onOpenChange={(open) => {
        if (!open) setReason('');
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Justifier une absence</DialogTitle>
          <DialogDescription>
            {record && `Le ${new Date(record.attendanceDate).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="justify-reason">Motif</Label>
          <Textarea
            id="justify-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Certificat médical, raison familiale…"
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={justify.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={justify.isPending || !reason.trim()}>
            {justify.isPending ? 'Envoi…' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
