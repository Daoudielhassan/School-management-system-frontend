'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
  STATUS_FILTER_ALL,
  SEVERITY_FILTER_ALL,
  ACADEMIC_YEAR_FILTER_ALL,
} from '../constants';
import type { DisciplineFilters as Filters } from '../types';
import type { AcademicYear } from '@/features/academic';

export interface DisciplineFiltersProps {
  filters: Filters;
  academicYears: AcademicYear[];
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export function DisciplineFilters({ filters, academicYears, onChange, onReset }: DisciplineFiltersProps) {
  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom d'étudiant…"
              value={filters.studentName}
              onChange={(e) => onChange({ ...filters, studentName: e.target.value })}
              className="pl-10"
            />
          </div>

          <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status })}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_FILTER_ALL}>Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.severity}
            onValueChange={(severity) => onChange({ ...filters, severity })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEVERITY_FILTER_ALL}>Toutes sévérités</SelectItem>
              {SEVERITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.academicYearId}
            onValueChange={(academicYearId) => onChange({ ...filters, academicYearId })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Année scolaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ACADEMIC_YEAR_FILTER_ALL}>Toutes les années</SelectItem>
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="text-slate-500" onClick={onReset}>
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
