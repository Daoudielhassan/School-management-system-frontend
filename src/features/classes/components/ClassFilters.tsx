'use client';

/**
 * Search + department filter bar for the classes grid. Presentational.
 */
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
import { DEPARTMENT_FILTER_ALL } from '../constants';
import type { Department, ClassFilters as Filters } from '../types';

export interface ClassFiltersProps {
  filters: Filters;
  departments: Department[];
  onChange: (filters: Filters) => void;
}

export function ClassFilters({ filters, departments, onChange }: ClassFiltersProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-md border-slate-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
            <Input
              placeholder="Search classes..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-10 bg-white/70 border-slate-200 text-gray-900 placeholder-gray-600 focus:border-blue-400"
            />
          </div>
          <Select
            value={filters.departmentId}
            onValueChange={(value) => onChange({ ...filters, departmentId: value })}
          >
            <SelectTrigger className="w-48 bg-white/70 border-slate-200 text-gray-900">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEPARTMENT_FILTER_ALL}>All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
