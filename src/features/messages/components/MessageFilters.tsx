'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { MessageFilters as Filters } from '../types';

export function MessageFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  return (
    <Card className="bg-white/80 backdrop-blur-md border-blue-200 shadow-lg">
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
          <Input
            placeholder="Search messages by subject or content..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-10 bg-white border-blue-200 text-slate-800 placeholder-slate-500 focus:border-blue-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}
