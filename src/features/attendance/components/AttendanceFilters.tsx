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
import { ATTENDANCE_STATUSES, STATUS_FILTER_ALL, statusLabel } from '../constants';
import type { AttendanceFilters as Filters } from '../types';

export interface AttendanceFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function AttendanceFilters({ filters, onChange }: AttendanceFiltersProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-md border-slate-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search by student, subject, or instructor..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-10 bg-white/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(status) => onChange({ ...filters, status })}
          >
            <SelectTrigger className="w-48 bg-white/70 border-slate-200 text-slate-900">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_FILTER_ALL}>All Status</SelectItem>
              {ATTENDANCE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
