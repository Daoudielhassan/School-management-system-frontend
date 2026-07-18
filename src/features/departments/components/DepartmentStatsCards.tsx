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
  const tiles = [
    { icon: Building, value: total, label: 'Départements' },
    { icon: Users, value: selectedClassesCount > 0 ? selectedClassesCount : '—', label: 'Classes (dép. sélectionné)' },
    { icon: BookOpen, value: filteredCount, label: 'Résultats filtrés' },
    { icon: Calendar, value: hasSelection ? '1' : '0', label: 'Sélectionné' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {tiles.map(({ icon: Icon, value, label }) => (
        <Card key={label} className="border-slate-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 tabular-nums">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
