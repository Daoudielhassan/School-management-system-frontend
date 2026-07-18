'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { DepartmentFilters as Filters } from '../types';

export interface DepartmentFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function DepartmentFilters({ filters, onChange }: DepartmentFiltersProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-md border-slate-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search departments..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="pl-10 bg-white/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
