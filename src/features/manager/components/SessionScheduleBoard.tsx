'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { extractErrorMessage } from '@/lib/api-error';
import { SessionCalendar, type SessionCalendarEvent } from '@/components/shared/SessionCalendar';
import { useUpdateSession, useDeleteSession } from '@/features/sessions';
import { useDepartmentSessions } from '../hooks/useDepartment';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { useMyManagerId, useMyManagerProfile } from '../hooks/useMyProfile';
import { MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY } from '../constants';
import { CreateSessionDialog } from './CreateSessionDialog';
import { QueryErrorState } from './QueryErrorState';
import type { SessionData } from '../types';

/**
 * Manager's department schedule: sessions can be dragged to a new day/slot or
 * clicked to cancel — every change round-trips through `PUT /api/sessions/{id}`
 * and reverts in place if the request fails. No resize: a session always runs
 * a full fixed slot (see `SESSION_SLOTS`), so duration isn't draggable — the
 * calendar's `businessHours` constraint keeps drags snapped to a valid slot.
 */
export function SessionScheduleBoard() {
  const queryClient = useQueryClient();
  const managerId = useMyManagerId();
  const { data: profile } = useMyManagerProfile();
  const { data: sessions = [], isLoading, isError, refetch } = useDepartmentSessions();
  const details = useSessionDetails(sessions);

  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [selected, setSelected] = useState<SessionData | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ startsAt: string; endsAt: string } | null>(null);

  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const events: SessionCalendarEvent[] = useMemo(
    () =>
      sessions.map((s) => {
        const detail = s.teachingAssignmentId ? details[s.teachingAssignmentId] : undefined;
        return {
          id: s.id,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          title: detail?.subjectName ?? 'Séance',
          subtitle: detail?.instructorName,
          room: s.room,
          cancelled: s.status === 'CANCELLED',
          colorKey: s.teachingAssignmentId ?? s.id,
        };
      }),
    [sessions, details]
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MANAGER_DEPARTMENT_SESSIONS_QUERY_KEY });

  const reschedule = async (id: string, startsAt: string, endsAt: string, revert: () => void) => {
    const session = sessionById.get(id);
    if (!session?.teachingAssignmentId) {
      revert();
      return;
    }
    try {
      await updateSession.mutateAsync({
        id,
        payload: {
          managerId: session.managerId ?? managerId ?? '',
          departmentId: session.departmentId ?? profile?.departmentId ?? '',
          teachingAssignmentId: session.teachingAssignmentId,
          startsAt,
          endsAt,
          room: session.room ?? undefined,
        },
      });
      invalidate();
      toast.success('Séance déplacée');
    } catch (error) {
      revert();
      toast.error(extractErrorMessage(error, 'Échec du déplacement de la séance'));
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    try {
      await deleteSession.mutateAsync(selected.id);
      invalidate();
      toast.success('Séance annulée');
      setSelected(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Échec de l'annulation de la séance"));
    }
  };

  const selectedDetail = selected?.teachingAssignmentId ? details[selected.teachingAssignmentId] : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-400">Glissez une séance vers un autre jour ou créneau pour la reprogrammer.</p>
        <Button
          size="sm"
          onClick={() => {
            setCreateDefaults(null);
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nouvelle séance
        </Button>
      </div>

      {isError ? (
        <QueryErrorState message="Impossible de charger les sessions." onRetry={refetch} />
      ) : (
        <SessionCalendar
          events={events}
          isLoading={isLoading}
          editable
          onEventClick={(id) => setSelected(sessionById.get(id) ?? null)}
          onEventDrop={reschedule}
          onSlotSelect={(startsAt, endsAt) => {
            setCreateDefaults({ startsAt, endsAt });
            setCreateOpen(true);
          }}
        />
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDetail?.subjectName ?? 'Séance'}</DialogTitle>
            <DialogDescription>
              {selected &&
                `${format(new Date(selected.startsAt), 'dd/MM/yyyy HH:mm')} – ${format(new Date(selected.endsAt), 'HH:mm')}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Instructeur</span>
              <span className="text-slate-800 font-medium">{selectedDetail?.instructorName ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Salle</span>
              <span className="text-slate-800 font-medium">{selected?.room ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Statut</span>
              <Badge variant="outline">{selected?.status ?? 'SCHEDULED'}</Badge>
            </div>
          </div>
          <DialogFooter>
            {selected?.status !== 'CANCELLED' && (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleCancel}
                disabled={deleteSession.isPending}
              >
                {deleteSession.isPending ? 'Annulation…' : 'Annuler la séance'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateSessionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStartsAt={createDefaults?.startsAt}
        defaultEndsAt={createDefaults?.endsAt}
      />
    </div>
  );
}
