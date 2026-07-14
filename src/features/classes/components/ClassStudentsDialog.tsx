'use client';

/**
 * Students-in-class dialog. Fetches enrolled students via `useClassStudents`
 * (only while open) and paginates them client-side.
 */
import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/Pagination';
import { Mail, Phone } from 'lucide-react';
import { useClassStudents } from '../hooks/useClassStudents';
import { CLASS_STUDENTS_PAGE_SIZE } from '../constants';
import type { ClassGroup } from '../types';

export interface ClassStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classe: ClassGroup | null;
}

export function ClassStudentsDialog({ open, onOpenChange, classe }: ClassStudentsDialogProps) {
  const [page, setPage] = useState(0);
  const { data: students = [], isLoading } = useClassStudents(open && classe ? classe.id : null);

  // Reset pagination whenever the dialog opens on a different class.
  useEffect(() => {
    setPage(0);
  }, [classe?.id, open]);

  const totalPages = Math.max(1, Math.ceil(students.length / CLASS_STUDENTS_PAGE_SIZE));
  const pageRows = useMemo(
    () => students.slice(page * CLASS_STUDENTS_PAGE_SIZE, (page + 1) * CLASS_STUDENTS_PAGE_SIZE),
    [students, page]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-200 max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Students in {classe?.name}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage students enrolled in this class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
              <span className="ml-2 text-gray-600">Loading students...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-gray-600">Student</TableHead>
                    <TableHead className="text-gray-600">Email</TableHead>
                    <TableHead className="text-gray-600">Phone</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.length > 0 ? (
                    pageRows.map((student) => (
                      <TableRow key={student.id} className="border-white/5 hover:bg-white/70">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-500/20 text-blue-600">
                                {student.firstName.charAt(0)}
                                {student.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-gray-600">ID: {student.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-blue-400" />
                            <span className="text-gray-600">{student.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-blue-400" />
                            <span className="text-gray-600">{student.phoneNumber ?? '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={student.status === 'active' ? 'default' : 'secondary'}
                            className={
                              student.status === 'active'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                            }
                          >
                            {student.status ?? 'unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                        No students found in this class
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalElements={students.length}
                  pageSize={CLASS_STUDENTS_PAGE_SIZE}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
