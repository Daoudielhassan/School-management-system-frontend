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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/api-error';
import { useDepartmentClassGroups } from '../hooks/useDepartment';
import { useProcessRepetition } from '../hooks/useRepetition';
import type { ClassGroupLite, StudentLite } from '../types';

export interface RepetitionDialogProps {
  student: StudentLite | null;
  currentClassGroup: ClassGroupLite | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Jury phase: moves a repeating student out of their current cohort into a
 * different one of the SAME level. The target picker only ever lists the
 * manager's own department's class groups (useDepartmentClassGroups), so
 * there is nothing to trust from the client beyond the chosen id — the
 * backend re-verifies both the department and the level regardless.
 */
export function RepetitionDialog({ student, currentClassGroup, onOpenChange }: RepetitionDialogProps) {
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const processRepetition = useProcessRepetition();
  const [newClassGroupId, setNewClassGroupId] = useState('');

  const open = !!student && !!currentClassGroup;

  const targetOptions = currentClassGroup
    ? classGroups.filter((c) => c.level === currentClassGroup.level && c.id !== currentClassGroup.id)
    : [];

  const reset = () => setNewClassGroupId('');

  const handleSubmit = async () => {
    if (!student || !currentClassGroup || !newClassGroupId) return;
    try {
      await processRepetition.mutateAsync({
        studentId: student.id,
        currentClassGroupId: currentClassGroup.id,
        newClassGroupId,
      });
      toast.success('Redoublement enregistré');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'enregistrement du redoublement"));
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
          <DialogTitle>Redoublement</DialogTitle>
          <DialogDescription>
            {student ? `${student.firstName} ${student.lastName}` : ''} refait son année dans une autre classe de
            même niveau.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nouvelle classe (niveau {currentClassGroup?.level})</Label>
            <Select value={newClassGroupId} onValueChange={setNewClassGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {targetOptions.length === 0 && (
              <p className="text-xs text-slate-400">Aucune autre classe de ce niveau dans votre département.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processRepetition.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!newClassGroupId || processRepetition.isPending}>
            {processRepetition.isPending ? 'Enregistrement…' : 'Confirmer le redoublement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
