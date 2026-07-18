'use client';

/**
 * Container that wires the "add manager" UI to the create mutation. Holds
 * only transient view state (dialog open, server error, temporary-password
 * display); all server state lives in React Query. No bulk-upload flow — the
 * backend doesn't expose one for managers (unlike students).
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemporaryPasswordDialog } from '@/components/shared/TemporaryPasswordDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { ManagerFormDialog } from './ManagerFormDialog';
import { useManagerDepartments } from '../hooks/useManagers';
import { useCreateManager } from '../hooks/useManagerMutations';
import { emptyManagerForm, toManagerCreatePayload } from '../validations';
import type { ManagerFormValues } from '../validations';

interface TempPasswordState {
  open: boolean;
  name: string;
  password: string;
}

const CLOSED_TEMP_PASSWORD: TempPasswordState = { open: false, name: '', password: '' };

export function AddManagerPanel() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<TempPasswordState>(CLOSED_TEMP_PASSWORD);

  const { data: departments = [] } = useManagerDepartments();
  const createManager = useCreateManager();

  const handleCreate = async (values: ManagerFormValues) => {
    setServerError(null);
    try {
      const manager = await createManager.mutateAsync(toManagerCreatePayload(values));
      setIsFormOpen(false);
      setTempPassword({
        open: true,
        name: `${manager.firstName} ${manager.lastName}`,
        password: manager.temporaryPassword,
      });
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to add manager');
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <TemporaryPasswordDialog
        open={tempPassword.open}
        onClose={() => setTempPassword(CLOSED_TEMP_PASSWORD)}
        userName={tempPassword.name}
        temporaryPassword={tempPassword.password}
      />

      <ManagerFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setServerError(null);
        }}
        title="Add Manager"
        description="Fill out the form below to add a new manager."
        submitLabel="Add Manager"
        mode="create"
        defaultValues={emptyManagerForm}
        departments={departments}
        serverError={serverError}
        isSubmitting={createManager.isPending}
        onSubmit={handleCreate}
      />

      <Card
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        className="shadow-md rounded-lg overflow-hidden"
      >
        <CardHeader style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }} className="p-6">
          <CardTitle className="text-2xl font-bold">Manager Management</CardTitle>
          <CardDescription style={{ color: 'var(--background)' }}>
            Provision new manager accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Button className="w-full max-w-md flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
              <UserPlus size={18} />
              Add Manager
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
