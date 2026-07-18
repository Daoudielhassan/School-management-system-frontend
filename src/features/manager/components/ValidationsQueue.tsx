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
import { ClipboardCheck, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePendingValidations, useValidationStats } from '../hooks/useValidations';
import { useDepartmentClassGroups } from '../hooks/useDepartment';
import { useManagerSubjects } from '../hooks/useTeachingAssignments';
import { ValidationStatsCards } from './ValidationStatsCards';
import { ValidationsTable } from './ValidationsTable';
import { ValidationDecisionDialog, type PendingDecision } from './ValidationDecisionDialog';

const ALL = '__all__';

export function ValidationsQueue() {
  const [classGroupId, setClassGroupId] = useState(ALL);
  const [subjectId, setSubjectId] = useState(ALL);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);

  const filters = {
    classGroupId: classGroupId === ALL ? undefined : classGroupId,
    subjectId: subjectId === ALL ? undefined : subjectId,
  };
  const { data: items = [], isLoading, isError, refetch } = usePendingValidations(filters);
  const { data: stats } = useValidationStats();
  const { data: classGroups = [] } = useDepartmentClassGroups();
  const { data: subjects = [] } = useManagerSubjects();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.attendanceId))));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Validations"
        description="Approuvez ou rejetez les justificatifs d'absence"
      />

      {stats && <ValidationStatsCards stats={stats} />}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={classGroupId} onValueChange={setClassGroupId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes les classes</SelectItem>
                {classGroups.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Toutes les matières" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes les matières</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-500">{selected.size} sélectionné(s)</span>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() =>
                    setPendingDecision({ attendanceIds: Array.from(selected), decision: 'VALIDATED' })
                  }
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    setPendingDecision({ attendanceIds: Array.from(selected), decision: 'REJECTED' })
                  }
                >
                  <X className="mr-1 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>

          <ValidationsTable
            items={items}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDecide={(attendanceId, decision) => setPendingDecision({ attendanceIds: [attendanceId], decision })}
          />
        </CardContent>
      </Card>

      <ValidationDecisionDialog
        pending={pendingDecision}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDecision(null);
            setSelected(new Set());
          }
        }}
      />
    </div>
  );
}
