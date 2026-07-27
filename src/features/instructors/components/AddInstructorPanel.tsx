'use client';

/**
 * Container that wires the "add instructor" UI (manual form + bulk upload) to
 * the mutation hooks. Holds only transient view state (dialog open, server
 * error, temporary-password display); all server state lives in React Query.
 */
import { useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus, Upload } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TemporaryPasswordDialog } from '@/components/shared/TemporaryPasswordDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { InstructorFormDialog } from './InstructorFormDialog';
import { BulkUploadCard } from './BulkUploadCard';
import { BulkUploadResultsPanel } from './BulkUploadResultsPanel';
import { useCreateInstructor, useUploadInstructors } from '../hooks/useInstructorMutations';
import { emptyInstructorForm, toInstructorPayload } from '../validations';
import type { InstructorFormValues } from '../validations';
import type { BulkUploadResult } from '../types';

interface TempPasswordState {
  open: boolean;
  name: string;
  password: string;
}

const CLOSED_TEMP_PASSWORD: TempPasswordState = { open: false, name: '', password: '' };

export function AddInstructorPanel() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<TempPasswordState>(CLOSED_TEMP_PASSWORD);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);

  const createInstructor = useCreateInstructor();
  const uploadInstructors = useUploadInstructors();

  const handleCreate = async (values: InstructorFormValues) => {
    setServerError(null);
    try {
      const payload = toInstructorPayload(values);
      const instructor = await createInstructor.mutateAsync({ name: payload.name, email: payload.email });

      setIsFormOpen(false);
      setTempPassword({ open: true, name: instructor.name, password: instructor.temporaryPassword });
    } catch (error) {
      const message = extractErrorMessage(error, "Échec de l'ajout du professeur");
      setServerError(message);
      toast.error(message);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadInstructors.mutateAsync(file);
      setUploadResult(result);
      if (result.failureCount === 0) {
        toast.success(`${result.successCount} professeur(s) créé(s)`);
      } else {
        toast.warn(`${result.successCount} créé(s), ${result.failureCount} échec(s) — voir le détail ci-dessous`);
      }
    } catch (error) {
      const message = extractErrorMessage(error, "Échec de l'import des professeurs");
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

      <InstructorFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setServerError(null);
        }}
        title="Ajouter un professeur"
        description="Renseignez le formulaire ci-dessous pour ajouter un nouveau professeur."
        submitLabel="Ajouter"
        defaultValues={emptyInstructorForm}
        serverError={serverError}
        isSubmitting={createInstructor.isPending}
        onSubmit={handleCreate}
      />

      <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Ajouter des professeurs</CardTitle>
          <CardDescription className="text-slate-500">
            Individuellement ou en masse via un fichier CSV/Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <UserPlus size={18} />
                <span>Ajout manuel</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload size={18} />
                <span>Import en masse</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <div className="flex justify-center">
                <Button
                  className="w-full max-w-md flex items-center gap-2"
                  onClick={() => setIsFormOpen(true)}
                >
                  <UserPlus size={18} />
                  Ajouter un professeur
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <BulkUploadCard isUploading={uploadInstructors.isPending} onUpload={handleUpload} />
              {uploadResult && <BulkUploadResultsPanel result={uploadResult} />}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-500">
            Besoin d&apos;aide ? Contactez le service informatique à l&apos;adresse{' '}
            <a href="mailto:it.club@aiac.ma" className="text-blue-600 hover:underline">
              it.club@aiac.ma
            </a>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
