'use client';

/**
 * Container for the academic-years screen: list + create + set-active.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { extractErrorMessage } from '@/lib/api-error';
import { AcademicYearFormDialog } from './AcademicYearFormDialog';
import { buildAcademicYearColumns } from './academic-year-columns';
import {
  useAcademicYears,
  useCreateAcademicYear,
  useSetActiveAcademicYear,
} from '../hooks/useAcademicYears';
import { toAcademicYearPayload, type AcademicYearFormValues } from '../validations';

export function AcademicYearsManager() {
  const [createOpen, setCreateOpen] = useState(false);
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
      toast.success('Academic year created successfully');
      setCreateOpen(false);
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to create academic year');
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Years</h1>
          <p className="text-muted-foreground">Manage academic calendar and semesters.</p>
        </div>
        <Button
          onClick={() => {
            setFormError(null);
            setCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Academic Year
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Academic Years</CardTitle>
          <CardDescription>History of all academic years configured in the system.</CardDescription>
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
    </div>
  );
}
