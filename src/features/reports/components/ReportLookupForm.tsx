'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { REPORT_KIND_OPTIONS, ATTENDANCE_SCOPE_OPTIONS, GRADE_SCOPE_OPTIONS } from '../constants';
import type { ReportKind, AttendanceScope, GradeScope, SubjectLite } from '../types';
import type { StudentData } from '@/features/students';
import type { ClassGroup } from '@/features/classes';

export interface ReportLookupFormProps {
  kind: ReportKind;
  scope: AttendanceScope | GradeScope;
  entityId: string;
  students: StudentData[];
  classes: ClassGroup[];
  subjects: SubjectLite[];
  onKindChange: (kind: ReportKind) => void;
  onScopeChange: (scope: AttendanceScope | GradeScope) => void;
  onEntityChange: (entityId: string) => void;
}

export function ReportLookupForm({
  kind,
  scope,
  entityId,
  students,
  classes,
  subjects,
  onKindChange,
  onScopeChange,
  onEntityChange,
}: ReportLookupFormProps) {
  const scopeOptions = kind === 'attendance' ? ATTENDANCE_SCOPE_OPTIONS : GRADE_SCOPE_OPTIONS;

  const entityOptions =
    scope === 'student'
      ? students.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
      : scope === 'class-group'
        ? classes.map((c) => ({ value: c.id, label: c.name }))
        : subjects.map((s) => ({ value: s.id, label: s.name }));

  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-600">Rapport</Label>
          <Select
            value={kind}
            onValueChange={(v) => {
              onKindChange(v as ReportKind);
              onScopeChange('student');
              onEntityChange('');
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_KIND_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-600">Portée</Label>
          <Select
            value={scope}
            onValueChange={(v) => {
              onScopeChange(v as AttendanceScope | GradeScope);
              onEntityChange('');
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scopeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-600">
            {scope === 'student' ? 'Étudiant' : scope === 'class-group' ? 'Classe' : 'Sujet'}
          </Label>
          <Select value={entityId} onValueChange={onEntityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner…" />
            </SelectTrigger>
            <SelectContent>
              {entityOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
