'use client';

import { useState } from 'react';
import { Copy, CheckCheck, ShieldAlert, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TemporaryPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  /** Display name of the newly created user (e.g. "Jean Dupont") */
  userName: string;
  temporaryPassword: string;
}

/**
 * Shown once after an admin creates a student / instructor / manager.
 * Displays the one-time temporary password and lets the admin copy it.
 * The password is NOT stored anywhere after this dialog is closed.
 */
export function TemporaryPasswordDialog({
  open,
  onClose,
  userName,
  temporaryPassword,
}: TemporaryPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for environments without Clipboard API
      const el = document.createElement('textarea');
      el.value = temporaryPassword;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md"
        // Prevent closing by clicking outside — admin must acknowledge
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-amber-100 p-2 rounded-full">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Compte créé avec succès</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-1 text-sm">
              <p>
                Le compte de <span className="font-semibold text-foreground">{userName}</span> a été créé.
              </p>
              <p className="text-amber-700 font-medium">
                ⚠️ Ce mot de passe temporaire ne sera plus affiché après fermeture de cette fenêtre.
                Transmettez-le à l'utilisateur maintenant.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Mot de passe temporaire
          </p>

          {/* Password display box */}
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3 border border-border">
            <code className="flex-1 text-base font-mono tracking-widest select-all break-all">
              {temporaryPassword}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={handleCopy}
              title="Copier le mot de passe"
            >
              {copied ? (
                <CheckCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            L'utilisateur devra modifier ce mot de passe dès sa première connexion.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="gap-2">
            <X className="h-4 w-4" />
            J'ai noté le mot de passe, fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
