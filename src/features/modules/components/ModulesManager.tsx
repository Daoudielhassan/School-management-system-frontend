'use client';

/**
 * CRUD screen for teaching modules. In Admin mode (`departments` prop
 * provided), a Département select lets the admin choose which department
 * owns the module. In Manager mode (prop omitted), the department is always
 * resolved server-side from the caller's own profile.
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Layers, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { useModules } from '../hooks/useModules';
import { useCreateModule, useUpdateModule, useDeleteModule } from '../hooks/useModuleMutations';
import { toModulePayload, type ModuleFormValues } from '../validations';
import { buildModuleColumns } from './module-columns';
import { ModuleFormDialog } from './ModuleFormDialog';
import type { TeachingModule } from '../types';
import type { Department } from '@/features/departments';

export interface ModulesManagerProps {
  /** Provide the department list to enable Admin mode (department picker + column). */
  departments?: Department[];
}

export function ModulesManager({ departments }: ModulesManagerProps = {}) {
  const { data: modules = [], isLoading } = useModules();
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();

  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; module: TeachingModule | null } | null>(null);
  const [deleting, setDeleting] = useState<TeachingModule | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      buildModuleColumns(
        (m) => {
          setFormError(null);
          setFormState({ mode: 'edit', module: m });
        },
        (m) => setDeleting(m),
        departments
      ),
    [departments]
  );

  const handleSubmit = async (values: ModuleFormValues) => {
    setFormError(null);
    try {
      if (formState?.mode === 'edit' && formState.module) {
        await updateModule.mutateAsync({ id: formState.module.id, payload: toModulePayload(values) });
        toast.success('Module mis à jour');
      } else {
        await createModule.mutateAsync(toModulePayload(values));
        toast.success('Module créé');
      }
      setFormState(null);
    } catch (error) {
      const message = extractErrorMessage(error, "Échec de l'enregistrement du module");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteModuleMutation.mutateAsync(deleting.id);
      toast.success('Module supprimé');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la suppression du module'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <Layers className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Modules</h1>
            <p className="text-sm text-slate-500">
              {departments
                ? 'Modules d’enseignement, par département / niveau / semestre'
                : 'Modules d’enseignement de votre département'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setFormError(null);
            setFormState({ mode: 'create', module: null });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les modules</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={modules}
            searchKey="name"
            searchPlaceholder="Rechercher par nom…"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <ModuleFormDialog
        open={!!formState}
        onOpenChange={(open) => !open && setFormState(null)}
        defaultValues={
          formState?.mode === 'edit' && formState.module
            ? {
                code: formState.module.code,
                name: formState.module.name,
                departmentId: formState.module.departmentId,
                level: formState.module.level,
                semesterNumber: formState.module.semesterNumber,
              }
            : undefined
        }
        serverError={formError}
        isSubmitting={createModule.isPending || updateModule.isPending}
        onSubmit={handleSubmit}
        departments={departments}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer le module"
        description="Supprimer ce module définitivement ? Les matières qui en dépendent pourraient être affectées."
        confirmLabel="Supprimer"
        variant="destructive"
        isConfirming={deleteModuleMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
