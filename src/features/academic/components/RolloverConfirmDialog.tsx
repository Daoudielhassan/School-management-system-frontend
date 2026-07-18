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
      setError(extractErrorMessage(err, 'Failed to roll over the academic year'));
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
                Rollover complete
              </DialogTitle>
              <DialogDescription>Here is exactly what changed.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Cohorts promoted</span>
                <span className="font-semibold">{result.promotedCohortsCount}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Cohorts graduated (level 3)</span>
                <span className="font-semibold">{result.graduatedCohortsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diplomas issued</span>
                <span className="font-semibold">{result.diplomasIssuedCount}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : step === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                This cannot be undone
              </DialogTitle>
              <DialogDescription>
                Every ACTIVE cohort will be promoted to its next level. Every level-3 cohort will be
                closed out and its actively enrolled students will be graduated and diplomed. This
                runs institution-wide, immediately, in one transaction.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('select')} disabled={rollover.isPending}>
                Back
              </Button>
              <Button variant="destructive" onClick={handleConfirm} disabled={rollover.isPending}>
                {rollover.isPending ? 'Rolling over…' : 'Yes, roll over the academic year'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Academic Year Rollover</DialogTitle>
              <DialogDescription>
                Close out the ending year and open the next one. This is the Closure phase — make sure
                every repeating student has already been processed by managers (Jury phase) first.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1.5">
                <Label>Ending year</Label>
                <Select value={effectiveEndingYearId} onValueChange={setEndingYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the year being closed" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.code} {y.status === 'ACTIVE' ? '(current)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>

              <div className="space-y-1.5">
                <Label>Starting year</Label>
                <Select value={startingYearId} onValueChange={setStartingYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the year being opened" />
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
                Cancel
              </Button>
              <Button onClick={() => setStep('confirm')} disabled={!canContinue}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
