'use client';

/**
 * Presentational class card. Emits action intents; performs no data access.
 *
 * NOTE: `studentCount` defaults to 0 to preserve the original page behaviour
 * (per-class student counts were never wired). Pass a real count once the
 * enrollment data is threaded through — see ClassesManager TODO.
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Trash2, Calendar, Layers, Users } from 'lucide-react';
import type { ClassGroup } from '../types';

export interface ClassCardProps {
  classe: ClassGroup;
  departmentName: string;
  moduleCount: number;
  subjectCount: number;
  studentCount?: number;
  onEdit: (classe: ClassGroup) => void;
  onDelete: (classe: ClassGroup) => void;
  onOpenStudents: (classe: ClassGroup) => void;
  onOpenSchedule: (classe: ClassGroup) => void;
  onOpenModules: (classe: ClassGroup) => void;
}

export function ClassCard({
  classe,
  departmentName,
  moduleCount,
  subjectCount,
  studentCount = 0,
  onEdit,
  onDelete,
  onOpenStudents,
  onOpenSchedule,
  onOpenModules,
}: ClassCardProps) {
  return (
    <Card className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900 group-hover:text-blue-700 transition-colors">
                {classe.name}
              </CardTitle>
              <CardDescription className="text-slate-500">
                {departmentName} · Niveau {classe.level}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600" onClick={() => onEdit(classe)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onDelete(classe)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center rounded-lg bg-slate-50 py-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">{studentCount}</div>
            <div className="text-xs text-slate-500">Étudiants</div>
          </div>
          <div className="text-center rounded-lg bg-slate-50 py-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">{moduleCount}</div>
            <div className="text-xs text-slate-500">Modules</div>
          </div>
          <div className="text-center rounded-lg bg-slate-50 py-3">
            <div className="text-2xl font-bold text-slate-800 tabular-nums">{subjectCount}</div>
            <div className="text-xs text-slate-500">Matières</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenSchedule(classe)}>
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Présences
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenModules(classe)}>
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Modules
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenStudents(classe)}>
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Étudiants
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
