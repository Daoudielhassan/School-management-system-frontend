'use client';

/**
 * Closure-phase dialog (Admin-only, irreversible): select the ending/starting
 * academic years, confirm explicitly, then show the actual blast radius
 * (cohorts promoted/graduated, diplomas issued) rather than a bare "OK" —
 * this action can silently touch dozens of cohorts and enrollments.
 */
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { extractErrorMessage } from '@/lib/api-error';
import { useRolloverAcademicYear } from '../hooks/useAcademicYears';
import type { AcademicYear, RolloverResult } from '../types';

export interface RolloverConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  years: AcademicYear[];
}

type Step = 'select' | 'confirm' | 'result';

export function RolloverConfirmDialog({ open, onOpenChange, years }: RolloverConfirmDialogProps) {
  const rollover = useRolloverAcademicYear();
  const [step, setStep] = useState<Step>('select');
  const [result, setResult] = useState<RolloverResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeYear = useMemo(() => years.find((y) => y.status === 'ACTIVE'), [years]);
  const [endingYearId, setEndingYearId] = useState('');
  const [startingYearId, setStartingYearId] = useState('');

  const effectiveEndingYearId = endingYearId || activeYear?.id || '';
  const startingOptions = years.filter((y) => y.id !== effectiveEndingYearId);
  const canContinue = !!effectiveEndingYearId && !!startingYearId;

  const reset = () => {
    setStep('select');
    setResult(null);
    setError(null);
    setEndingYearId('');
    setStartingYearId('');
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      const summary = await rollover.mutateAsync({
        endingYearId: effectiveEndingYearId,
        startingYearId,
      });
      setResult(summary);
      setStep('result');
    } catch (err) {
      setError(extractErrorMessage(err, "Échec de la bascule de l'année académique"));
      setStep('select');
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
        {step === 'result' && result ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Bascule terminée
              </DialogTitle>
              <DialogDescription>Voici précisément ce qui a changé.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Cohortes promues</span>
                <span className="font-semibold">{result.promotedCohortsCount}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Cohortes diplômées (niveau 3)</span>
                <span className="font-semibold">{result.graduatedCohortsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diplômes délivrés</span>
                <span className="font-semibold">{result.diplomasIssuedCount}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Fermer</Button>
            </DialogFooter>
          </>
        ) : step === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Cette action est irréversible
              </DialogTitle>
              <DialogDescription>
                Chaque cohorte ACTIVE sera promue au niveau suivant. Chaque cohorte de niveau 3 sera
                clôturée et ses étudiants activement inscrits seront diplômés. Cette opération
                s'exécute pour tout l'établissement, immédiatement, en une seule transaction.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('select')} disabled={rollover.isPending}>
                Retour
              </Button>
              <Button variant="destructive" onClick={handleConfirm} disabled={rollover.isPending}>
                {rollover.isPending ? 'Bascule en cours…' : "Oui, basculer l'année académique"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Bascule d&apos;année académique</DialogTitle>
              <DialogDescription>
                Clôturer l'année qui se termine et ouvrir la suivante. C'est la phase de clôture —
                assurez-vous que chaque étudiant redoublant a déjà été traité par les managers (phase
                jury) au préalable.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1.5">
                <Label>Année se terminant</Label>
                <Select value={effectiveEndingYearId} onValueChange={setEndingYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'année à clôturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.code} {y.status === 'ACTIVE' ? '(actuelle)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>

              <div className="space-y-1.5">
                <Label>Année à ouvrir</Label>
                <Select value={startingYearId} onValueChange={setStartingYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'année à ouvrir" />
                  </SelectTrigger>
                  <SelectContent>
                    {startingOptions.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={() => setStep('confirm')} disabled={!canContinue}>
                Continuer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
