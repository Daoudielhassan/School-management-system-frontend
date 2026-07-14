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
import { PERFORMANCE_OPTIONS, SUBJECT_FILTER_ALL, PERFORMANCE_FILTER_ALL } from '../constants';
import type { GradeFilters as Filters, SubjectLite } from '../types';

export interface GradeFiltersProps {
  filters: Filters;
  subjects: SubjectLite[];
  onChange: (filters: Filters) => void;
}

export function GradeFilters({ filters, subjects, onChange }: GradeFiltersProps) {
  return (
    <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--primary)]" />
            <Input
              placeholder="Search by student, subject, or ID..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-10 bg-[var(--secondary)]/50 border-[var(--accent)]/30 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)]"
            />
          </div>
          <Select value={filters.subject} onValueChange={(subject) => onChange({ ...filters, subject })}>
            <SelectTrigger className="w-48 bg-[var(--secondary)]/50 border-[var(--accent)]/30 text-[var(--text)]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SUBJECT_FILTER_ALL}>All Subjects</SelectItem>
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
            <SelectTrigger className="w-48 bg-[var(--secondary)]/50 border-[var(--accent)]/30 text-[var(--text)]">
              <SelectValue placeholder="Filter by performance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PERFORMANCE_FILTER_ALL}>All Performance</SelectItem>
              {PERFORMANCE_OPTIONS.map((o) => (
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
