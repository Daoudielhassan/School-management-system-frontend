'use client';

/**
 * Container that wires the "add student" UI (manual form + bulk upload) to the
 * mutation hooks. Holds only transient view state (dialog open, server error,
 * temporary-password display); all server state lives in React Query.
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
import { StudentFormDialog } from './StudentFormDialog';
import { BulkUploadCard } from './BulkUploadCard';
import { BulkUploadResultsPanel } from './BulkUploadResultsPanel';
import { useStudentReferenceData } from '../hooks/useStudents';
import { useCreateStudent, useUploadStudents } from '../hooks/useStudentMutations';
import { emptyCreateStudentForm, toStudentPayload } from '../validations';
import type { CreateStudentFormValues } from '../validations';
import type { BulkUploadResult } from '../types';

interface TempPasswordState {
  open: boolean;
  name: string;
  password: string;
}

const CLOSED_TEMP_PASSWORD: TempPasswordState = { open: false, name: '', password: '' };

export function AddStudentPanel() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<TempPasswordState>(CLOSED_TEMP_PASSWORD);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);

  const { data: reference } = useStudentReferenceData();
  const createStudent = useCreateStudent();
  const uploadStudents = useUploadStudents();

  const handleCreate = async (values: CreateStudentFormValues) => {
    setServerError(null);
    try {
      const { student, enrollmentFailed } = await createStudent.mutateAsync({
        payload: toStudentPayload(values),
        classGroupId: values.classGroupId || undefined,
      });

      setIsFormOpen(false);

      if (enrollmentFailed) {
        toast.warn('Student created but enrollment failed.');
      }
      if (student.temporaryPassword) {
        setTempPassword({
          open: true,
          name: `${student.firstName} ${student.lastName}`,
          password: student.temporaryPassword,
        });
      } else {
        toast.success('Student added successfully!');
      }
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to add student');
      setServerError(message);
      toast.error(message);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadStudents.mutateAsync(file);
      setUploadResult(result);
      if (result.failureCount === 0) {
        toast.success(`${result.successCount} student(s) created successfully!`);
      } else {
        toast.warn(`${result.successCount} created, ${result.failureCount} failed — see details below.`);
      }
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to upload students');
      toast.error(`Upload failed: ${message}`);
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

      <StudentFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setServerError(null);
        }}
        title="Add Student"
        description="Fill out the form below to add a new student."
        submitLabel="Add Student"
        defaultValues={emptyCreateStudentForm}
        classGroups={reference?.classGroups ?? []}
        serverError={serverError}
        isSubmitting={createStudent.isPending}
        onSubmit={handleCreate}
      />

      <Card
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        className="shadow-md rounded-lg overflow-hidden"
      >
        <CardHeader
          style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
          className="p-6"
        >
          <CardTitle className="text-2xl font-bold">Student Management</CardTitle>
          <CardDescription style={{ color: 'var(--background)' }}>
            Add new students individually or in bulk
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <UserPlus size={18} />
                <span>Add Manually</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload size={18} />
                <span>Bulk Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <div className="flex justify-center">
                <Button
                  className="w-full max-w-md flex items-center gap-2"
                  onClick={() => setIsFormOpen(true)}
                >
                  <UserPlus size={18} />
                  Add Student Manually
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <BulkUploadCard isUploading={uploadStudents.isPending} onUpload={handleUpload} />
              {uploadResult && <BulkUploadResultsPanel result={uploadResult} />}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <p className="text-sm text-gray-500">
            Need help? Contact the IT department at{' '}
            <a href="mailto:it.club@aiac.ma" className="text-blue-600 hover:underline">
              it.club@aiac.ma
            </a>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
