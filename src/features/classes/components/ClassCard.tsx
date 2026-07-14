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
import { BookOpen, Edit, Trash2, Calendar, Layers, Users, FileText } from 'lucide-react';
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
    <Card className="bg-blue-500/10 backdrop-blur-md border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-all">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-slate-900 group-hover:text-slate-500 transition-colors">
                {classe.name}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {departmentName} · Level {classe.level}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-indigo-500/20 text-indigo-700"
              onClick={() => onEdit(classe)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-red-500/20 text-red-700"
              onClick={() => onDelete(classe)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{studentCount}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{moduleCount}</div>
            <div className="text-xs text-gray-600">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{subjectCount}</div>
            <div className="text-xs text-gray-600">Subjects</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-indigo-400/30 hover:bg-indigo-500/20 text-indigo-700"
              onClick={() => onOpenSchedule(classe)}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Attendance
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-purple-400/30 hover:bg-purple-500/20 text-purple-700"
              onClick={() => onOpenModules(classe)}
            >
              <Layers className="h-3 w-3 mr-1" />
              Modules
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-blue-400/30 hover:bg-blue-500/20 text-blue-600"
              onClick={() => onOpenStudents(classe)}
            >
              <Users className="h-3 w-3 mr-1" />
              Students ({studentCount})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-400/30 hover:bg-green-500/20 text-green-700"
            >
              <FileText className="h-3 w-3 mr-1" />
              Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
