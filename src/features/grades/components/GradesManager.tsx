'use client';

/**
 * Container for the grades analytics screen: stats, filters, overview/trends/
 * alerts tabs and the student detail dialog. Wired to the real
 * education-core-service `/api/grades` endpoints.
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      toast.success('Grade recorded');
      setFormOpen(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to record grade'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGrade.mutateAsync(pendingDelete.id);
      toast.success('Grade deleted');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete grade'));
    } finally {
      setPendingDelete(null);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">
              Academic Performance Tracking
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              Advanced analytics dashboard for student performance monitoring
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Grade
          </Button>
        </div>

        <GradeStatsCards stats={stats} />

        <GradeFilters filters={filters} subjects={bundle?.subjects ?? []} onChange={setFilters} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[var(--secondary)]/50 backdrop-blur-md border border-[var(--accent)]/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--primary)]/30">
              Performance Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-[var(--primary)]/30">
              Trends Analysis
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[var(--primary)]/30">
              Performance Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <GradeGrid grades={filtered} isLoading={isLoading} onView={setSelected} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30">
              <CardHeader>
                <CardTitle className="text-[var(--text)] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                  Performance Trends
                </CardTitle>
                <CardDescription className="text-[var(--text-muted)]">
                  Student performance evolution over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                    Trend Analysis Dashboard
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    Advanced performance tracking charts coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>
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
          title="Delete grade"
          description="Are you sure you want to delete this grade? This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          isConfirming={deleteGrade.isPending}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
