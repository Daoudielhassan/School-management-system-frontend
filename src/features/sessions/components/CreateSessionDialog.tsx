'use client';

/**
 * Admin session creation — department and class are already chosen by the
 * caller (the schedule filters); this dialog only needs a teaching
 * assignment for that class plus date/time/room. `departmentId` is passed
 * through as-is (trusted for ADMIN, who bypasses the manager-department
 * check server-side); no `managerId` is sent.
 */
import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS, apiGet } from '@/config/api';
import { extractErrorMessage } from '@/lib/api-error';
import { useCreateSession } from '../hooks/useSessions';
import { SESSION_SLOTS, type SessionSlotId } from '../constants';
import type { TeachingAssignment } from '@/types/education';

interface SubjectLite {
  id: string;
  name: string;
}

interface InstructorLite {
  id: string;
  name: string;
}

export interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  classGroupId: string;
  /** Called after a session is successfully created (e.g. to refresh a plain-fetch schedule view). */
  onCreated?: () => void;
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  departmentId,
  classGroupId,
  onCreated,
}: CreateSessionDialogProps) {
  const { token } = useAuth();
  const createSession = useCreateSession();

  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [subjects, setSubjects] = useState<SubjectLite[]>([]);
  const [instructors, setInstructors] = useState<InstructorLite[]>([]);

  const [teachingAssignmentId, setTeachingAssignmentId] = useState('');
  const [date, setDate] = useState('');
  const [slotId, setSlotId] = useState<SessionSlotId | ''>('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (!open || !token || !classGroupId) return;
    Promise.all([
      apiGet<TeachingAssignment[]>(API_ENDPOINTS.TEACHING_ASSIGNMENTS.FILTER({ classGroupId }), token),
      apiGet<SubjectLite[]>(API_ENDPOINTS.SUBJECTS.BASE, token),
      apiGet<InstructorLite[]>(API_ENDPOINTS.INSTRUCTORS.BASE, token),
    ])
      .then(([a, s, i]) => {
        setAssignments(Array.isArray(a) ? a : []);
        setSubjects(Array.isArray(s) ? s : []);
        setInstructors(Array.isArray(i) ? i : []);
      })
      .catch(() => {
        setAssignments([]);
        setSubjects([]);
        setInstructors([]);
      });
  }, [open, token, classGroupId]);

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Matière inconnue';
  const instructorName = (id: string) => instructors.find((i) => i.id === id)?.name ?? 'Instructeur inconnu';

  const reset = () => {
    setTeachingAssignmentId('');
    setDate('');
    setSlotId('');
    setRoom('');
  };

  const canSubmit = teachingAssignmentId && date && slotId;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const slot = SESSION_SLOTS.find((s) => s.id === slotId);
    if (!slot) return;
    try {
      await createSession.mutateAsync({
        departmentId,
        teachingAssignmentId,
        // Sent as a plain local wall-clock string, matching the backend's
        // LocalDateTime (no zone) — `.toISOString()` would convert to UTC
        // and fail Jackson's LocalDateTime parsing (it rejects the "Z"
        // suffix) and/or the backend's exact-slot-time validation.
        startsAt: `${date}T${slot.start}:00`,
        endsAt: `${date}T${slot.end}:00`,
        room: room || undefined,
      });
      toast.success('Séance créée');
      reset();
      onOpenChange(false);
      onCreated?.();
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
          <DialogDescription>Planifier une séance pour une affectation active de cette classe.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Affectation (matière / instructeur)</Label>
            <Select value={teachingAssignmentId} onValueChange={setTeachingAssignmentId}>
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
            {activeAssignments.length === 0 && (
              <p className="text-xs text-slate-400">Aucune affectation active pour cette classe.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Créneau</Label>
            <div className="flex flex-wrap gap-2">
              {SESSION_SLOTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlotId(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all active:scale-95 ${
                    slotId === s.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {s.label} ({s.start}–{s.end})
                </button>
              ))}
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
