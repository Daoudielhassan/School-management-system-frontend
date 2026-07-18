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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Étudiants — {classe?.name}</DialogTitle>
          <DialogDescription>Étudiants inscrits dans cette classe</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-2 text-slate-500">Chargement…</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.length > 0 ? (
                    pageRows.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-50 text-blue-700 text-xs font-semibold">
                                {student.firstName.charAt(0)}
                                {student.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-slate-800">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-600">{student.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-600">{student.phoneNumber ?? '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status ?? 'inconnu'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                        Aucun étudiant dans cette classe
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
