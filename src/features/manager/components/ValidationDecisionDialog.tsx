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
import { useValidateAttendance, useBulkValidateAttendance } from '../hooks/useValidations';
import type { ValidationDecision } from '../types';

export interface PendingDecision {
  attendanceIds: string[];
  decision: ValidationDecision;
}

export interface ValidationDecisionDialogProps {
  pending: PendingDecision | null;
  onOpenChange: (open: boolean) => void;
}

export function ValidationDecisionDialog({ pending, onOpenChange }: ValidationDecisionDialogProps) {
  const [comment, setComment] = useState('');
  const validateOne = useValidateAttendance();
  const validateBulk = useBulkValidateAttendance();
  const isPending = validateOne.isPending || validateBulk.isPending;

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      if (pending.attendanceIds.length === 1) {
        await validateOne.mutateAsync({
          attendanceId: pending.attendanceIds[0],
          decision: pending.decision,
          managerComment: comment.trim() || undefined,
        });
      } else {
        await validateBulk.mutateAsync({
          attendanceIds: pending.attendanceIds,
          decision: pending.decision,
          managerComment: comment.trim() || undefined,
        });
      }
      toast.success(pending.decision === 'VALIDATED' ? 'Justificatif(s) approuvé(s)' : 'Justificatif(s) rejeté(s)');
      setComment('');
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la validation'));
    }
  };

  if (!pending) return null;

  const isApprove = pending.decision === 'VALIDATED';
  const count = pending.attendanceIds.length;

  return (
    <Dialog
      open={!!pending}
      onOpenChange={(open) => {
        if (!open) setComment('');
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isApprove ? 'Approuver' : 'Rejeter'} {count > 1 ? `${count} justificatifs` : 'le justificatif'}</DialogTitle>
          <DialogDescription>
            {isApprove
              ? "L'absence sera marquée comme excusée."
              : 'Le justificatif sera rejeté ; le statut de présence reste inchangé.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="manager-comment">Commentaire (optionnel)</Label>
          <Textarea
            id="manager-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Justificatif conforme…"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Envoi…' : isApprove ? 'Approuver' : 'Rejeter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
