'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { format } from 'date-fns';
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
import { useDepartmentClassGroups, useDepartmentSessions } from '../hooks/useDepartment';
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

const DURATION_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '1 h', minutes: 60 },
  { label: '1 h 30', minutes: 90 },
  { label: '2 h', minutes: 120 },
] as const;

const DEFAULT_DURATION_MINUTES = 90;

/** `Date` -> `datetime-local` input value, in local time (not UTC — avoids date/hour shifting). */
function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
  const createSession = useCreateSession();
  const roomListId = useId();

  const [teachingAssignmentId, setTeachingAssignmentId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState<number | 'custom'>(DEFAULT_DURATION_MINUTES);
  const [customEndsAt, setCustomEndsAt] = useState('');
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

  const computedEndsAt = useMemo(() => {
    if (duration === 'custom') return customEndsAt;
    if (!startsAt) return '';
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) return '';
    return toDatetimeLocal(new Date(start.getTime() + duration * 60_000));
  }, [startsAt, duration, customEndsAt]);

  // Skip a click when the class only has one active assignment.
  useEffect(() => {
    if (activeAssignments.length === 1 && !teachingAssignmentId) {
      setTeachingAssignmentId(activeAssignments[0].id);
    }
  }, [activeAssignments, teachingAssignmentId]);

  useEffect(() => {
    if (!open || !defaultStartsAt || !defaultEndsAt) return;
    setStartsAt(defaultStartsAt.slice(0, 16));
    const diffMinutes = Math.round(
      (new Date(defaultEndsAt).getTime() - new Date(defaultStartsAt).getTime()) / 60_000
    );
    const preset = DURATION_PRESETS.find((p) => p.minutes === diffMinutes);
    if (preset) {
      setDuration(preset.minutes);
    } else {
      setDuration('custom');
      setCustomEndsAt(defaultEndsAt.slice(0, 16));
    }
  }, [open, defaultStartsAt, defaultEndsAt]);

  const reset = () => {
    setClassGroupId('');
    setTeachingAssignmentId('');
    setStartsAt('');
    setDuration(DEFAULT_DURATION_MINUTES);
    setCustomEndsAt('');
    setRoom('');
  };

  const canSubmit =
    classGroupId && teachingAssignmentId && startsAt && computedEndsAt && computedEndsAt > startsAt;

  const handleSubmit = async () => {
    if (!canSubmit || !profile) return;
    try {
      await createSession.mutateAsync({
        managerId,
        departmentId: profile.departmentId,
        teachingAssignmentId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(computedEndsAt).toISOString(),
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

          <div className="space-y-1.5">
            <Label>Début</Label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Durée</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => setDuration(p.minutes)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all active:scale-95 ${
                    duration === p.minutes
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDuration('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all active:scale-95 ${
                  duration === 'custom'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                Personnalisé
              </button>
            </div>
            {duration === 'custom' ? (
              <Input
                type="datetime-local"
                className="mt-2"
                value={customEndsAt}
                onChange={(e) => setCustomEndsAt(e.target.value)}
              />
            ) : (
              computedEndsAt && (
                <p className="text-xs text-slate-400 mt-1">
                  Se termine à {format(new Date(computedEndsAt), 'HH:mm')}
                </p>
              )
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
