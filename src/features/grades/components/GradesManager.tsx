'use client';

/**
 * Container for the grades analytics screen: stats, filters, overview/trends/
 * alerts tabs and the student detail dialog. Wired to the real
 * education-core-service `/api/grades` endpoints.
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { GradeStatsCards } from './GradeStatsCards';
import { GradeFilters } from './GradeFilters';
import { GradeGrid } from './GradeGrid';
import { GradeDetailDialog } from './GradeDetailDialog';
import { GradeFormDialog } from './GradeFormDialog';
import { useGradesScreen, useGradeBundle, useCreateGrade, useDeleteGrade } from '../hooks/useGrades';
import { toGradeMutationPayload, type GradeFormValues } from '../validations';
import { SUBJECT_FILTER_ALL, PERFORMANCE_FILTER_ALL } from '../constants';
import type { GradeFilters as Filters, StudentGrade } from '../types';

const EMPTY_FILTERS: Filters = {
  search: '',
  subject: SUBJECT_FILTER_ALL,
  performance: PERFORMANCE_FILTER_ALL,
};

export function GradesManager() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<StudentGrade | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StudentGrade | null>(null);

  const { filtered, stats, isLoading } = useGradesScreen(filters);
  const { data: bundle } = useGradeBundle();
  const createGrade = useCreateGrade();
  const deleteGrade = useDeleteGrade();

  const weakGrades = filtered.filter((g) => g.performance === 'weak');

  const handleCreate = async (values: GradeFormValues) => {
    try {
      await createGrade.mutateAsync(toGradeMutationPayload(values));
      toast.success('Note enregistrée');
      setFormOpen(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to record grade'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGrade.mutateAsync(pendingDelete.id);
      toast.success('Note supprimée');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete grade'));
    } finally {
      setPendingDelete(null);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6">
        <PageHeader
          icon={Award}
          title="Notes"
          description="Suivi des performances académiques des étudiants"
          actions={
            <Button className="shadow-sm shadow-blue-600/20" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer une note
            </Button>
          }
        />

        <GradeStatsCards stats={stats} />

        <GradeFilters filters={filters} subjects={bundle?.subjects ?? []} onChange={setFilters} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="alerts">
              Alertes{weakGrades.length > 0 ? ` (${weakGrades.length})` : ''}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <GradeGrid grades={filtered} isLoading={isLoading} onView={setSelected} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <GradeGrid grades={weakGrades} onView={setSelected} />
          </TabsContent>
        </Tabs>

        <GradeFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          students={bundle?.students ?? []}
          subjects={bundle?.subjects ?? []}
          instructors={bundle?.instructors ?? []}
          isSubmitting={createGrade.isPending}
          onSubmit={handleCreate}
        />

        <GradeDetailDialog
          grade={selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          onDelete={setPendingDelete}
        />

        <ConfirmDialog
          open={!!pendingDelete}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          title="Supprimer la note"
          description="Voulez-vous vraiment supprimer cette note ? Cette action est irréversible."
          confirmLabel="Supprimer"
          variant="destructive"
          isConfirming={deleteGrade.isPending}
          onConfirm={handleDeleteConfirm}
        />
    </div>
  );
}
