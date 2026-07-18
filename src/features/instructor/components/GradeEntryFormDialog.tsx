'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyActiveTeachingAssignments, useSubjects, useClassGroups } from '../hooks/useMyTeachingAssignments';
import { useClassGroupStudents } from '../hooks/useClassGroupStudents';
import { EVALUATION_TYPE_OPTIONS } from '../constants';
import type { GradeMutationPayload } from '../types';

const gradeEntrySchema = z.object({
  teachingAssignmentId: z.string().trim().min(1, 'Sélectionnez une affectation'),
  studentId: z.string().trim().min(1, 'Sélectionnez un étudiant'),
  evaluationType: z.enum(['EXAM', 'QUIZ', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER']),
  value: z.coerce.number().min(0, 'Doit être supérieur ou égal à 0'),
  maxValue: z.coerce.number().min(1, 'Doit être au moins 1'),
  comment: z.string().trim(),
});

type GradeEntryFormValues = z.infer<typeof gradeEntrySchema>;

const EMPTY_FORM: GradeEntryFormValues = {
  teachingAssignmentId: '',
  studentId: '',
  evaluationType: 'EXAM',
  value: 0,
  maxValue: 20,
  comment: '',
};

export interface GradeEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructorId: string;
  serverError?: string | null;
  isSubmitting?: boolean;
  onSubmit: (payload: GradeMutationPayload) => void | Promise<void>;
}

export function GradeEntryFormDialog({
  open,
  onOpenChange,
  instructorId,
  serverError,
  isSubmitting,
  onSubmit,
}: GradeEntryFormDialogProps) {
  const { data: assignments = [] } = useMyActiveTeachingAssignments();
  const { data: subjects = [] } = useSubjects();
  const { data: classGroups = [] } = useClassGroups();
  const subjectNameById = useMemo(() => new Map(subjects.map((s) => [s.id, s.name])), [subjects]);
  const classGroupNameById = useMemo(() => new Map(classGroups.map((c) => [c.id, c.name])), [classGroups]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<GradeEntryFormValues>({
    resolver: zodResolver(gradeEntrySchema),
    defaultValues: EMPTY_FORM,
  });

  const teachingAssignmentId = watch('teachingAssignmentId');
  const selectedAssignment = assignments.find((a) => a.id === teachingAssignmentId);
  const { students, isLoading: studentsLoading } = useClassGroupStudents(selectedAssignment?.classGroupId);

  const handleClose = (next: boolean) => {
    if (!next) reset(EMPTY_FORM);
    onOpenChange(next);
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const assignment = assignments.find((a) => a.id === values.teachingAssignmentId);
    if (!assignment) return;
    await onSubmit({
      studentId: values.studentId,
      subjectId: assignment.subjectId,
      instructorId,
      evaluationType: values.evaluationType,
      value: values.value,
      maxValue: values.maxValue,
      comment: values.comment || undefined,
    });
    reset(EMPTY_FORM);
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle note</DialogTitle>
          <DialogDescription>Enregistrer une note pour un étudiant de vos classes</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <div className="space-y-1.5">
            <Label>
              Matière / Classe <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="teachingAssignmentId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une affectation" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {subjectNameById.get(a.subjectId) ?? 'Matière'} — {classGroupNameById.get(a.classGroupId) ?? 'Classe'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teachingAssignmentId && (
              <p className="text-sm text-destructive">{errors.teachingAssignmentId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Étudiant <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="studentId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!teachingAssignmentId || studentsLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={teachingAssignmentId ? 'Sélectionner un étudiant' : 'Choisissez une affectation d’abord'} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.studentId && <p className="text-sm text-destructive">{errors.studentId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>
              Type d&apos;évaluation <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="evaluationType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVALUATION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="value">
                Note <span className="text-red-500">*</span>
              </Label>
              <Input id="value" type="number" step="0.01" {...register('value')} />
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxValue">
                Sur <span className="text-red-500">*</span>
              </Label>
              <Input id="maxValue" type="number" step="0.01" {...register('maxValue')} />
              {errors.maxValue && <p className="text-sm text-destructive">{errors.maxValue.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea id="comment" rows={3} {...register('comment')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer la note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
