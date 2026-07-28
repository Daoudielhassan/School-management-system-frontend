'use client';

import { useEffect, useId, useMemo, useState } from 'react';
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
import { useCreateHalfDaySession, HALF_DAYS, type HalfDayId } from '@/features/sessions';
import { useDepartmentClassGroups, useDepartmentSessions } from '../hooks/useDepartment';
import { useTeachingAssignments, useManagerSubjects, useManagerInstructors } from '../hooks/useTeachingAssignments';
import { useMyManagerProfile, useMyManagerId } from '../hooks/useMyProfile';
import { MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY } from '../constants';

export interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the date/half-day, e.g. when opened from a calendar slot click. ISO strings. */
  defaultStartsAt?: string;
  defaultEndsAt?: string;
}

/** `Date` -> `YYYY-MM-DD`, in local time (not UTC — avoids date shifting). */
function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function CreateSessionDialog({ open, onOpenChange, defaultStartsAt, defaultEndsAt }: CreateSessionDialogProps) {
  const queryClient = useQueryClient();
  const managerId = useMyManagerId();
  const { data: profile } = useMyManagerProfile();
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const { data: departmentSessions = [] } = useDepartmentSessions();
  const [classGroupId, setClassGroupId] = useState('');
  const { data: assignments = [] } = useTeachingAssignments(classGroupId || undefined);
  const { data: subjects = [] } = useManagerSubjects();
  const { data: instructors = [] } = useManagerInstructors();
  const createHalfDaySession = useCreateHalfDaySession();
  const roomListId = useId();

  const [teachingAssignmentId, setTeachingAssignmentId] = useState('');
  const [date, setDate] = useState('');
  const [halfDayId, setHalfDayId] = useState<HalfDayId | ''>('');
  const [room, setRoom] = useState('');

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Matière inconnue';
  const instructorName = (id: string) => instructors.find((i) => i.id === id)?.name ?? 'Instructeur inconnu';

  const roomSuggestions = useMemo(() => {
    const rooms = new Set<string>();
    departmentSessions.forEach((s) => {
      if (s.room) rooms.add(s.room);
    });
    return Array.from(rooms).sort();
  }, [departmentSessions]);

  // Skip a click when the class only has one active assignment.
  useEffect(() => {
    if (activeAssignments.length === 1 && !teachingAssignmentId) {
      setTeachingAssignmentId(activeAssignments[0].id);
    }
  }, [activeAssignments, teachingAssignmentId]);

  useEffect(() => {
    if (!open || !defaultStartsAt) return;
    const start = new Date(defaultStartsAt);
    setDate(toDateInputValue(start));
    // Whichever half-day the clicked time falls closest into.
    setHalfDayId(start.getHours() < 13 ? 'MORNING' : 'AFTERNOON');
  }, [open, defaultStartsAt, defaultEndsAt]);

  const reset = () => {
    setClassGroupId('');
    setTeachingAssignmentId('');
    setDate('');
    setHalfDayId('');
    setRoom('');
  };

  const canSubmit = classGroupId && teachingAssignmentId && date && halfDayId;

  const handleSubmit = async () => {
    if (!canSubmit || !profile) return;
    try {
      await createHalfDaySession.mutateAsync({
        managerId,
        departmentId: profile.departmentId,
        teachingAssignmentId,
        date,
        half: halfDayId,
        room: room || undefined,
      });
      queryClient.invalidateQueries({ queryKey: MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY });
      toast.success('Séances créées');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la création des séances'));
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
          <DialogTitle>Nouvelles séances</DialogTitle>
          <DialogDescription>
            Planifier les 2 séances d&apos;une demi-journée pour une affectation active de votre département.
          </DialogDescription>
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

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Demi-journée</Label>
            <div className="flex flex-wrap gap-2">
              {HALF_DAYS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHalfDayId(h.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all active:scale-95 ${
                    halfDayId === h.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
            {halfDayId && (
              <p className="text-xs text-slate-400 mt-1">
                Crée 2 séances : {HALF_DAYS.find((h) => h.id === halfDayId)?.hint}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Salle</Label>
            <Input list={roomListId} value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Ex: A101" />
            <datalist id={roomListId}>
              {roomSuggestions.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createHalfDaySession.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || createHalfDaySession.isPending}>
            {createHalfDaySession.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
