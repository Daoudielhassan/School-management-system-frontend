'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QueryErrorState } from './QueryErrorState';
import { ClassStudentsDialog } from './ClassStudentsDialog';
import { classGroupStatusStyle } from '../lib/format';
import type { ClassGroupLite } from '../types';

export interface DepartmentClassGroupsTableProps {
  classGroups: ClassGroupLite[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function DepartmentClassGroupsTable({
  classGroups,
  isLoading,
  isError,
  onRetry,
}: DepartmentClassGroupsTableProps) {
  const [selected, setSelected] = useState<ClassGroupLite | null>(null);

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
    return <QueryErrorState message="Impossible de charger les classes." onRetry={onRetry} />;
  }

  if (classGroups.length === 0) {
    return <div className="text-center py-12 text-slate-400">Aucune classe dans ce département</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Étudiants</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classGroups.map((c) => {
            const style = classGroupStatusStyle(c.status);
            return (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-slate-700">{c.code}</TableCell>
                <TableCell className="text-slate-600">{c.name}</TableCell>
                <TableCell className="text-slate-600">{c.level}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={style.className}>
                    {style.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                    <Users className="h-4 w-4 mr-1.5" />
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ClassStudentsDialog classGroup={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}
