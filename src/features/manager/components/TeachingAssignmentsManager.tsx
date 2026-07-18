'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useDepartmentClassGroups } from '../hooks/useDepartment';
import { useTeachingAssignments } from '../hooks/useTeachingAssignments';
import { TeachingAssignmentsList } from './TeachingAssignmentsList';
import { CreateTeachingAssignmentDialog } from './CreateTeachingAssignmentDialog';

export function TeachingAssignmentsManager() {
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const [classGroupId, setClassGroupId] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: assignments = [], isLoading, isError, refetch } = useTeachingAssignments(classGroupId || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Affectations</h1>
          <p className="text-slate-500 mt-1">Qui enseigne quoi, à quelle classe</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle affectation
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Select value={classGroupId} onValueChange={setClassGroupId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              {classGroups.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {classGroupId ? (
            <TeachingAssignmentsList
              assignments={assignments}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            />
          ) : (
            <p className="text-center text-slate-400 py-12">Sélectionnez une classe pour voir ses affectations.</p>
          )}
        </CardContent>
      </Card>

      <CreateTeachingAssignmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultClassGroupId={classGroupId || undefined}
      />
    </div>
  );
}
