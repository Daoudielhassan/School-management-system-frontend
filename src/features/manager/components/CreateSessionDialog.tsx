'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/api-error';
import { useCreateSession } from '@/features/sessions';
import { useDepartmentClassGroups } from '../hooks/useDepartment';
import { useTeachingAssignments, useManagerSubjects, useManagerInstructors } from '../hooks/useTeachingAssignments';
import { useMyManagerProfile, useMyManagerId } from '../hooks/useMyProfile';
import { MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY } from '../constants';

export interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the start/end inputs, e.g. when opened from a calendar slot click. ISO strings. */
  defaultStartsAt?: string;
  defaultEndsAt?: string;
}

export function CreateSessionDialog({ open, onOpenChange, defaultStartsAt, defaultEndsAt }: CreateSessionDialogProps) {
  const queryClient = useQueryClient();
  const managerId = useMyManagerId();
  const { data: profile } = useMyManagerProfile();
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const [classGroupId, setClassGroupId] = useState('');
  const { data: assignments = [] } = useTeachingAssignments(classGroupId || undefined);
  const { data: subjects = [] } = useManagerSubjects();
  const { data: instructors = [] } = useManagerInstructors();
  const createSession = useCreateSession();

  const [teachingAssignmentId, setTeachingAssignmentId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [room, setRoom] = useState('');

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Matière inconnue';
  const instructorName = (id: string) => instructors.find((i) => i.id === id)?.name ?? 'Instructeur inconnu';

  useEffect(() => {
    if (open && defaultStartsAt && defaultEndsAt) {
      setStartsAt(defaultStartsAt.slice(0, 16));
      setEndsAt(defaultEndsAt.slice(0, 16));
    }
  }, [open, defaultStartsAt, defaultEndsAt]);

  const reset = () => {
    setClassGroupId('');
    setTeachingAssignmentId('');
    setStartsAt('');
    setEndsAt('');
    setRoom('');
  };

  const canSubmit = classGroupId && teachingAssignmentId && startsAt && endsAt;

  const handleSubmit = async () => {
    if (!canSubmit || !profile) return;
    try {
      await createSession.mutateAsync({
        managerId,
        departmentId: profile.departmentId,
        teachingAssignmentId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        room: room || undefined,
      });
      queryClient.invalidateQueries({ queryKey: MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY });
      toast.success('Séance créée');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la création de la séance'));
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
          <DialogTitle>Nouvelle séance</DialogTitle>
          <DialogDescription>Planifier une séance pour une affectation active de votre département.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Classe</Label>
            <Select
              value={classGroupId}
              onValueChange={(value) => {
                setClassGroupId(value);
                setTeachingAssignmentId('');
              }}
            >
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
            <Label>Affectation (matière / instructeur)</Label>
            <Select value={teachingAssignmentId} onValueChange={setTeachingAssignmentId} disabled={!classGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une affectation active" />
              </SelectTrigger>
              <SelectContent>
                {activeAssignments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {subjectName(a.subjectId)} — {instructorName(a.instructorId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {classGroupId && activeAssignments.length === 0 && (
              <p className="text-xs text-slate-400">Aucune affectation active pour cette classe.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Début</Label>
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Fin</Label>
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Salle</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Ex: A101" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createSession.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || createSession.isPending}>
            {createSession.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
