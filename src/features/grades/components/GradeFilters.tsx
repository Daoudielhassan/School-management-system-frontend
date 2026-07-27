'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import {
  PERFORMANCE_OPTIONS,
  SUBJECT_FILTER_ALL,
  PERFORMANCE_FILTER_ALL,
  ACADEMIC_YEAR_FILTER_ALL,
} from '../constants';
import type { GradeFilters as Filters, SubjectLite } from '../types';
import type { AcademicYear } from '@/features/academic';

export interface GradeFiltersProps {
  filters: Filters;
  subjects: SubjectLite[];
  academicYears: AcademicYear[];
  onChange: (filters: Filters) => void;
}

export function GradeFilters({ filters, subjects, academicYears, onChange }: GradeFiltersProps) {
  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par étudiant ou matière…"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select value={filters.subject} onValueChange={(subject) => onChange({ ...filters, subject })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SUBJECT_FILTER_ALL}>Toutes les matières</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.performance}
            onValueChange={(performance) => onChange({ ...filters, performance })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Performance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PERFORMANCE_FILTER_ALL}>Toutes performances</SelectItem>
              {PERFORMANCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.academicYear}
            onValueChange={(academicYear) => onChange({ ...filters, academicYear })}
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
        </div>
      </CardContent>
    </Card>
  );
}
