'use client';

/**
 * Container for browsing, editing and deleting students. Server state comes
 * entirely from React Query via `useStudentsTable`; the component keeps only
 * transient view state (filters, current page, which row is being edited/deleted).
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { StudentFilters } from './StudentFilters';
import { StudentsTable } from './StudentsTable';
import { StudentFormDialog } from './StudentFormDialog';
import { useStudentsTable } from '../hooks/useStudents';
import { useUpdateStudent, useDeleteStudent } from '../hooks/useStudentMutations';
import { toStudentPayload, type CreateStudentFormValues } from '../validations';
import { STUDENTS_PAGE_SIZE } from '../constants';
import type { StudentData, StudentFilters as Filters } from '../types';

const EMPTY_FILTERS: Filters = { search: '', departmentId: '', classId: '' };

export interface StudentDirectoryProps {
  /** Pre-fills the name/email search, e.g. when arriving from the global search. */
  initialSearch?: string;
}

/** Map a student entity to the form's value shape (edit flow has no class field). */
function toFormValues(student: StudentData): CreateStudentFormValues {
  return {
    studentNumber: student.studentNumber,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phoneNumber: student.phoneNumber ?? '',
    dateOfBirth: student.dateOfBirth ?? '',
    classGroupId: '',
  };
}

export function StudentDirectory({ initialSearch }: StudentDirectoryProps = {}) {
  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    search: initialSearch ?? '',
  }));
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<StudentData | null>(null);
  const [deleting, setDeleting] = useState<StudentData | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { paged, reference, filteredClassGroups, isLoading, isError } = useStudentsTable(
    filters,
    page
  );

  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const editDefaults = useMemo(
    () => (editing ? toFormValues(editing) : null),
    [editing]
  );

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setPage(0);
  };

  const handleUpdate = async (values: CreateStudentFormValues) => {
    if (!editing) return;
    setEditError(null);
    try {
      await updateStudent.mutateAsync({ id: editing.id, payload: toStudentPayload(values) });
      toast.success('Student updated successfully!');
      setEditing(null);
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to update student');
      setEditError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteStudent.mutateAsync(deleting.id);
      toast.success('Student deleted successfully!');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete student'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
      className="shadow-lg"
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>
          Student Management
        </CardTitle>
        <div className="mt-4">
          <StudentFilters
            filters={filters}
            departments={reference.departments}
            classGroups={filteredClassGroups}
            onChange={handleFiltersChange}
          />
        </div>
      </CardHeader>

      <CardContent>
        <StudentsTable
          students={paged.rows}
          isLoading={isLoading}
          error={isError ? 'Failed to load students' : null}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </CardContent>

      <CardFooter>
        <Pagination
          page={paged.page}
          totalPages={paged.totalPages}
          totalElements={paged.totalItems}
          pageSize={STUDENTS_PAGE_SIZE}
          onPageChange={setPage}
          className="w-full"
        />
      </CardFooter>

      {/* Edit */}
      {editing && editDefaults && (
        <StudentFormDialog
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
              setEditError(null);
            }
          }}
          title="Edit Student"
          submitLabel="Save"
          defaultValues={editDefaults}
          serverError={editError}
          isSubmitting={updateStudent.isPending}
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Confirm Deletion"
        description="Are you sure you want to delete this student?"
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteStudent.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
