'use client';

/**
 * Classes grid: renders a `ClassCard` per class, with loading skeletons and an
 * empty state. Per-card module/subject counts are derived here via pure
 * selectors so the container stays thin.
 */
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { modulesByDepartment, subjectsByModule, enrollmentsByClassGroup } from '../lib/class-selectors';
import type { ClassGroup, Department, Module, Subject, Enrollment } from '../types';

export interface ClassGridProps {
  classes: ClassGroup[];
  departments: Department[];
  modules: Module[];
  subjects: Subject[];
  enrollments: Enrollment[];
  isLoading?: boolean;
  hasActiveSearch?: boolean;
  onCreate: () => void;
  onEdit: (classe: ClassGroup) => void;
  onDelete: (classe: ClassGroup) => void;
  onOpenStudents: (classe: ClassGroup) => void;
  onOpenSchedule: (classe: ClassGroup) => void;
  onOpenModules: (classe: ClassGroup) => void;
}

export function ClassGrid({
  classes,
  departments,
  modules,
  subjects,
  enrollments,
  isLoading = false,
  hasActiveSearch = false,
  onCreate,
  onEdit,
  onDelete,
  onOpenStudents,
  onOpenSchedule,
  onOpenModules,
}: ClassGridProps) {
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

  if (classes.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No classes found</h3>
          <p className="text-gray-600 text-center mb-4">
            {hasActiveSearch
              ? 'Try adjusting your search terms'
              : 'Start by creating your first class'}
          </p>
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {classes.map((classe) => {
        const deptModules = modulesByDepartment(modules, classe.departmentId);
        const subjectCount = deptModules.reduce(
          (total, m) => total + subjectsByModule(subjects, m.id).length,
          0
        );
        const departmentName =
          departments.find((d) => d.id === classe.departmentId)?.name ?? 'No department';
        const studentCount = enrollmentsByClassGroup(enrollments, classe.id).length;

        return (
          <ClassCard
            key={classe.id}
            classe={classe}
            departmentName={departmentName}
            moduleCount={deptModules.length}
            subjectCount={subjectCount}
            studentCount={studentCount}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenStudents={onOpenStudents}
            onOpenSchedule={onOpenSchedule}
            onOpenModules={onOpenModules}
          />
        );
      })}
    </div>
  );
}
