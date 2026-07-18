'use client';

/**
 * Container for the discipline screen: stats, filters, cases table (server
 * paginated), create + detail/update + delete. Server state via React Query.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Gavel, RefreshCw, Plus, Bot } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { DisciplineStatsBar } from './DisciplineStatsBar';
import { DisciplineFilters } from './DisciplineFilters';
import { CaseFormDialog } from './CaseFormDialog';
import { CaseDetailDialog } from './CaseDetailDialog';
import { buildDisciplineColumns } from './discipline-columns';
import { useDisciplineCases, useDisciplineStats } from '../hooks/useDiscipline';
import { useCreateCase, useUpdateCase, useDeleteCase } from '../hooks/useDisciplineMutations';
import {
  emptyCaseForm,
  toCreateCasePayload,
  toUpdateCasePayload,
  type CaseFormValues,
  type CaseUpdateValues,
} from '../validations';
import { DISCIPLINE_QUERY_KEY, STATUS_FILTER_ALL, SEVERITY_FILTER_ALL } from '../constants';
import type { DisciplinaryCase, DisciplineFilters as Filters, StudentOption } from '../types';

const EMPTY_FILTERS: Filters = { status: STATUS_FILTER_ALL, severity: SEVERITY_FILTER_ALL };
const EMPTY_STATS = { total: 0, pending: 0, underReview: 0, resolved: 0, appealed: 0 };

export interface DisciplineManagerProps {
  /** Name-based picker options for the create form — all students for admin, own department for a manager. */
  students: StudentOption[];
}

export function DisciplineManager({ students }: DisciplineManagerProps) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<DisciplinaryCase | null>(null);
  const [deleting, setDeleting] = useState<DisciplinaryCase | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: casesPage, isLoading } = useDisciplineCases(filters, page);
  const { data: stats, isLoading: statsLoad } = useDisciplineStats();

  const createCase = useCreateCase();
  const updateCase = useUpdateCase();
  const deleteCase = useDeleteCase();

  const cases = casesPage?.content ?? [];
  const totalPages = casesPage?.totalPages ?? 1;

  const columns = useMemo(() => buildDisciplineColumns(setSelected), []);

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setPage(0);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEY });

  const handleCreate = async (values: CaseFormValues) => {
    setFormError(null);
    try {
      const student = students.find((s) => s.id === values.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : values.studentName;
      await createCase.mutateAsync(toCreateCasePayload({ ...values, studentName }));
      toast.success('Dossier créé');
      setCreateOpen(false);
    } catch (error) {
      const message = extractErrorMessage(error, 'Erreur lors de la création');
      setFormError(message);
      toast.error(message);
    }
  };

  const handleUpdate = async (values: CaseUpdateValues) => {
    if (!selected) return;
    try {
      await updateCase.mutateAsync({ id: selected.id, payload: toUpdateCasePayload(values) });
      toast.success('Dossier mis à jour');
      setSelected(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Erreur lors de la mise à jour'));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCase.mutateAsync(deleting.id);
      toast.success('Dossier supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Erreur lors de la suppression'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex-shrink-0 grid place-items-center h-11 w-11 rounded-2xl bg-red-50 ring-1 ring-inset ring-red-100">
            <Gavel className="h-[22px] w-[22px] text-red-600" />
          </div>
          <div>
            <h1
              className="text-[26px] font-semibold text-slate-900 tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-admin-display, inherit)' }}
            >
              Discipline
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Gestion des dossiers disciplinaires · les cas AUTO sont créés après 8 absences non
              justifiées (48h)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              setFormError(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Nouveau dossier
          </Button>
        </div>
      </div>

      <DisciplineStatsBar stats={stats ?? EMPTY_STATS} loading={statsLoad} />

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Bot className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Règle automatique :</strong> Tout étudiant dépassant{' '}
          <strong>8 absences non justifiées</strong> (statut ABSENT, enregistrées il y a plus de
          48h) reçoit automatiquement un dossier disciplinaire de type{' '}
          <em>Conseil disciplinaire</em>. Le planificateur s’exécute toutes les heures.
        </div>
      </div>

      <DisciplineFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={() => handleFiltersChange(EMPTY_FILTERS)}
      />

      <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Dossiers disciplinaires</CardTitle>
          <CardDescription className="text-slate-500">
            {`Page ${(casesPage?.number ?? 0) + 1} / ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={cases}
            searchKey="studentName"
            searchPlaceholder="Rechercher par nom d'étudiant…"
            isLoading={isLoading}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-slate-500">
                Page {(casesPage?.number ?? 0) + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CaseFormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setFormError(null);
        }}
        students={students}
        serverError={formError}
        isSubmitting={createCase.isPending}
        onSubmit={handleCreate}
      />

      <CaseDetailDialog
        caseItem={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        isUpdating={updateCase.isPending}
        onSubmit={handleUpdate}
        onRequestDelete={(caseItem) => {
          setSelected(null);
          setDeleting(caseItem);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Supprimer le dossier"
        description="Supprimer ce dossier définitivement ?"
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteCase.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
