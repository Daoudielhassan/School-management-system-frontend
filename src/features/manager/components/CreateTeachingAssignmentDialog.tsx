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
import {
  useManagerSubjects,
  useManagerInstructors,
  useManagerAcademicYears,
  useCreateTeachingAssignment,
} from '../hooks/useTeachingAssignments';

export interface CreateTeachingAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClassGroupId?: string;
}

export function CreateTeachingAssignmentDialog({
  open,
  onOpenChange,
  defaultClassGroupId,
}: CreateTeachingAssignmentDialogProps) {
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const { data: subjects = [] } = useManagerSubjects();
  const { data: instructors = [] } = useManagerInstructors();
  const { data: academicYears = [] } = useManagerAcademicYears();
  const createAssignment = useCreateTeachingAssignment();

  const [classGroupId, setClassGroupId] = useState(defaultClassGroupId ?? '');
  const [subjectId, setSubjectId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');

  const reset = () => {
    setClassGroupId(defaultClassGroupId ?? '');
    setSubjectId('');
    setInstructorId('');
    setAcademicYearId('');
  };

  const canSubmit = classGroupId && subjectId && instructorId && academicYearId;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createAssignment.mutateAsync({ classGroupId, subjectId, instructorId, academicYearId });
      toast.success('Affectation créée');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de la création de l'affectation"));
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
          <DialogTitle>Nouvelle affectation</DialogTitle>
          <DialogDescription>Assigner un instructeur à une matière pour une classe.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Classe</Label>
            <Select value={classGroupId} onValueChange={setClassGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classGroups.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Matière</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Instructeur</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un instructeur" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Année académique</Label>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une année" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createAssignment.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || createAssignment.isPending}>
            {createAssignment.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
