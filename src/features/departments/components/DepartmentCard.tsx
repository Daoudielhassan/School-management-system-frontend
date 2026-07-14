'use client';

/**
 * Presentational department card. Clicking it toggles selection, which expands
 * the card to reveal that department's classes (fed by the container).
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, BookOpen, Edit, Trash2 } from 'lucide-react';
import type { Department, DepartmentClass } from '../types';

export interface DepartmentCardProps {
  department: Department;
  isSelected: boolean;
  classes: DepartmentClass[];
  onToggle: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function DepartmentCard({
  department,
  isSelected,
  classes,
  onToggle,
  onEdit,
  onDelete,
}: DepartmentCardProps) {
  return (
    <Card
      className="bg-blue-500/10 backdrop-blur-md border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-blue-500/20"
      onClick={() => onToggle(department)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-all">
              <Building className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-slate-900 group-hover:text-blue-600 transition-colors">
                {department.name}
              </CardTitle>
              <CardDescription className="text-slate-500">Code: {department.code}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-blue-500/20 text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(department);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-red-500/20 text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(department);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isSelected && (
          <div className="mt-4 pt-4 border-t border-blue-400/20">
            <h4 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Classes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white/70 rounded-lg p-3 border border-slate-200 hover:border-blue-400/30 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 font-medium">{cls.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-indigo-400/30 text-indigo-700">
                        L{cls.level}
                      </Badge>
                      <Badge variant="outline" className="border-blue-400/30 text-blue-600">
                        {cls.code}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
