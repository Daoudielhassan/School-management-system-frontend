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
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
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
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id.slice(0, 8);
  const instructorName = (id: string) => instructors.find((i) => i.id === id)?.name ?? id.slice(0, 8);

  const reset = () => {
    setTeachingAssignmentId('');
    setStartsAt('');
    setEndsAt('');
    setRoom('');
  };

  const canSubmit = teachingAssignmentId && startsAt && endsAt;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createSession.mutateAsync({
        departmentId,
        teachingAssignmentId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
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
