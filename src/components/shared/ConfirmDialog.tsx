'use client';

/**
 * Reusable confirmation dialog. Replaces the ad-hoc "Are you sure?" modals
 * duplicated across admin pages. Purely presentational: the caller owns the
 * open state and provides the `onConfirm` handler.
 */
import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual weight of the confirm button. */
  variant?: 'default' | 'destructive';
  /** Disables buttons and shows a pending label while the action runs. */
  isConfirming?: boolean;
  /**
   * For destructive, hard-to-reverse actions: the confirm button stays
   * disabled until the user types this exact text (e.g. the resource's
   * name) into a field. Omit for a normal yes/no confirmation.
   */
  confirmationText?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  isConfirming = false,
  confirmationText,
  onConfirm,
}: ConfirmDialogProps) {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (open) setTypedText('');
  }, [open]);

  const canConfirm = !confirmationText || typedText === confirmationText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {confirmationText && (
          <div className="space-y-1.5">
            <Label htmlFor="confirm-dialog-text">
              Tapez <span className="font-semibold">{confirmationText}</span> pour confirmer
            </Label>
            <Input
              id="confirm-dialog-text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isConfirming || !canConfirm}>
            {isConfirming ? 'Veuillez patienter…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
