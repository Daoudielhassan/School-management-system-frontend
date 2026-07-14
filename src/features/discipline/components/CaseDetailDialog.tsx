'use client';

/**
 * Case detail + resolution update dialog. Shows read-only case info and lets an
 * admin change status / action taken / resolution notes (React Hook Form + Zod).
 * Delete is delegated to the container (which confirms via ConfirmDialog).
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Bot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { caseUpdateSchema, type CaseUpdateValues } from '../validations';
import { STATUS_OPTIONS, SEVERITY_COLORS } from '../constants';
import type { DisciplinaryCase } from '../types';

export interface CaseDetailDialogProps {
  caseItem: DisciplinaryCase | null;
  onOpenChange: (open: boolean) => void;
  isUpdating?: boolean;
  onSubmit: (values: CaseUpdateValues) => void | Promise<void>;
  onRequestDelete: (caseItem: DisciplinaryCase) => void;
}

export function CaseDetailDialog({
  caseItem,
  onOpenChange,
  isUpdating = false,
  onSubmit,
  onRequestDelete,
}: CaseDetailDialogProps) {
  const { register, handleSubmit, control, reset } = useForm<CaseUpdateValues>({
    resolver: zodResolver(caseUpdateSchema),
    defaultValues: { status: 'pending', actionTaken: '', resolutionNotes: '' },
  });

  useEffect(() => {
    if (caseItem) {
      reset({
        status: caseItem.status,
        actionTaken: caseItem.actionTaken,
        resolutionNotes: caseItem.resolutionNotes,
      });
    }
  }, [caseItem, reset]);

  return (
    <Dialog open={!!caseItem} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {caseItem?.source === 'AUTO' && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                <Bot className="h-3 w-3 mr-1 inline" />
                AUTO
              </Badge>
            )}
            Dossier — {caseItem?.studentName}
          </DialogTitle>
          <DialogDescription>{caseItem?.violation}</DialogDescription>
        </DialogHeader>

        {caseItem && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Description :</span> {caseItem.description}
              </p>
              <p>
                <span className="text-muted-foreground">Signalé par :</span> {caseItem.reportedBy}
              </p>
              <p>
                <span className="text-muted-foreground">Date :</span>{' '}
                {format(new Date(caseItem.dateReported), 'dd MMM yyyy HH:mm')}
              </p>
              <p>
                <span className="text-muted-foreground">Sévérité :</span>{' '}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_COLORS[caseItem.severity]}`}
                >
                  {caseItem.severity}
                </span>
              </p>
            </div>

            <div>
              <Label>Nouveau statut</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Mesure prise</Label>
              <Textarea
                rows={2}
                placeholder="Avertissement, exclusion, conseil disciplinaire…"
                {...register('actionTaken')}
              />
            </div>

            <div>
              <Label>Notes de résolution</Label>
              <Textarea
                rows={2}
                placeholder="Conclusion du dossier…"
                {...register('resolutionNotes')}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => onRequestDelete(caseItem)}
              >
                Supprimer
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Mise à jour…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
