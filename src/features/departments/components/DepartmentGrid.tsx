'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { DepartmentCard } from './DepartmentCard';
import type { Department, DepartmentClass } from '../types';

export interface DepartmentGridProps {
  departments: Department[];
  selectedId: string | null;
  selectedClasses: DepartmentClass[];
  isLoading?: boolean;
  hasActiveSearch?: boolean;
  onCreate: () => void;
  onToggle: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function DepartmentGrid({
  departments,
  selectedId,
  selectedClasses,
  isLoading = false,
  hasActiveSearch = false,
  onCreate,
  onToggle,
  onEdit,
  onDelete,
}: DepartmentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/70 backdrop-blur-md rounded-xl h-64 border border-slate-200"
          />
        ))}
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building className="h-12 w-12 text-blue-400/50 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No departments found</h3>
          <p className="text-slate-500 text-center mb-4">
            {hasActiveSearch
              ? 'Try adjusting your search terms'
              : 'Start by creating your first department'}
          </p>
          <Button
            onClick={onCreate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {departments.map((department) => (
        <DepartmentCard
          key={department.id}
          department={department}
          isSelected={selectedId === department.id}
          classes={selectedId === department.id ? selectedClasses : []}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
