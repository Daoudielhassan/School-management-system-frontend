'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Building, Users, BookOpen, Calendar } from 'lucide-react';

export interface DepartmentStatsCardsProps {
  total: number;
  selectedClassesCount: number;
  filteredCount: number;
  hasSelection: boolean;
}

export function DepartmentStatsCards({
  total,
  selectedClassesCount,
  filteredCount,
  hasSelection,
}: DepartmentStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-blue-600/20 backdrop-blur-md border-blue-400/30">
        <CardContent className="p-6 text-center">
          <Building className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-sm text-blue-600">Total Departments</div>
        </CardContent>
      </Card>
      <Card className="bg-blue-600/20 backdrop-blur-md border-blue-400/30">
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">
            {selectedClassesCount > 0 ? selectedClassesCount : '-'}
          </div>
          <div className="text-sm text-blue-600">Classes (selected dept)</div>
        </CardContent>
      </Card>
      <Card className="bg-blue-600/20 backdrop-blur-md border-blue-400/30">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{filteredCount}</div>
          <div className="text-sm text-blue-600">Filtered Results</div>
        </CardContent>
      </Card>
      <Card className="bg-blue-600/20 backdrop-blur-md border-blue-400/30">
        <CardContent className="p-6 text-center">
          <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900">{hasSelection ? '1' : '0'}</div>
          <div className="text-sm text-blue-600">Selected</div>
        </CardContent>
      </Card>
    </div>
  );
}
