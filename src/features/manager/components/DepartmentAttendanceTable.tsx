'use client';

import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo } from 'react';
import { extractErrorMessage } from '@/lib/api-error';
import { QueryErrorState } from './QueryErrorState';
import { attendanceStatusStyle } from '../lib/format';
import { useUpdateDepartmentAttendanceStatus } from '../hooks/useDepartment';
import type { AttendanceResponse, AttendanceStatus, ClassGroupLite } from '../types';

const STATUS_OPTIONS: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export interface DepartmentAttendanceTableProps {
  records: AttendanceResponse[];
  classGroups?: ClassGroupLite[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function DepartmentAttendanceTable({
  records,
  classGroups = [],
  isLoading,
  isError,
  onRetry,
}: DepartmentAttendanceTableProps) {
  const updateStatus = useUpdateDepartmentAttendanceStatus();
  const classGroupName = useMemo(() => {
    const byId = new Map(classGroups.map((c) => [c.id, c.name]));
    return (id: string) => byId.get(id) ?? 'Classe inconnue';
  }, [classGroups]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <QueryErrorState message="Impossible de charger les présences." onRetry={onRetry} />;
  }

  if (records.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucun enregistrement de présence</div>;
  }

  const sorted = [...records].sort(
    (a, b) => new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime()
  );

  const handleChange = async (attendanceId: string, status: AttendanceStatus) => {
    try {
      await updateStatus.mutateAsync({ attendanceId, status });
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour du statut'));
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Modifier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((record) => {
          const style = attendanceStatusStyle(record.status);
          return (
            <TableRow key={record.id}>
              <TableCell className="text-slate-600">
                {format(new Date(record.attendanceDate), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="text-slate-600">{classGroupName(record.classGroupId)}</TableCell>
              <TableCell>
                <Badge className={style.className} variant="outline">
                  {style.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={record.status}
                  onValueChange={(value) => handleChange(record.id, value as AttendanceStatus)}
                >
                  <SelectTrigger className="w-32 ml-auto h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {attendanceStatusStyle(status).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
