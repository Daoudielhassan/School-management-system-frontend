'use client';

/**
 * Container for the academic-years screen: list + create + set-active.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarRange } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { extractErrorMessage } from '@/lib/api-error';
import { AcademicYearFormDialog } from './AcademicYearFormDialog';
import { RolloverConfirmDialog } from './RolloverConfirmDialog';
import { buildAcademicYearColumns } from './academic-year-columns';
import {
  useAcademicYears,
  useCreateAcademicYear,
  useSetActiveAcademicYear,
} from '../hooks/useAcademicYears';
import { toAcademicYearPayload, type AcademicYearFormValues } from '../validations';

export function AcademicYearsManager() {
  const [createOpen, setCreateOpen] = useState(false);
  const [rolloverOpen, setRolloverOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: years = [], isLoading } = useAcademicYears();
  const createYear = useCreateAcademicYear();
  const setActive = useSetActiveAcademicYear();

  const columns = useMemo(
    () =>
      buildAcademicYearColumns((id) => {
        setActive.mutate(id, {
          onSuccess: () => toast.success('Active academic year updated'),
          onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update active year')),
        });
      }, setActive.isPending),
    [setActive]
  );

  const handleCreate = async (values: AcademicYearFormValues) => {
    setFormError(null);
    try {
      await createYear.mutateAsync(toAcademicYearPayload(values));
      toast.success('Année académique créée');
      setCreateOpen(false);
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to create academic year');
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={CalendarRange}
        title="Années académiques"
        description="Gérez le calendrier académique et les semestres"
        actions={
          <>
            <Button variant="destructive" onClick={() => setRolloverOpen(true)}>
              <RotateCw className="mr-2 h-4 w-4" />
              Bascule annuelle
            </Button>
            <Button
              onClick={() => {
                setFormError(null);
                setCreateOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle année
            </Button>
          </>
        }
      />

      <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Toutes les années académiques</CardTitle>
          <CardDescription>Historique des années académiques configurées dans le système.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={years} isLoading={isLoading} paginated />
        </CardContent>
      </Card>

      <AcademicYearFormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setFormError(null);
        }}
        serverError={formError}
        isSubmitting={createYear.isPending}
        onSubmit={handleCreate}
      />

      <RolloverConfirmDialog open={rolloverOpen} onOpenChange={setRolloverOpen} years={years} />
    </div>
  );
}
