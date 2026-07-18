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
      className={`border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isSelected ? 'border-blue-300 ring-1 ring-blue-100' : 'hover:border-blue-300'
      }`}
      onClick={() => onToggle(department)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 group-hover:scale-105 transition-transform">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900 group-hover:text-blue-700 transition-colors">
                {department.name}
              </CardTitle>
              <CardDescription className="text-slate-500">Code : {department.code}</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-blue-600"
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
              className="text-red-600 hover:bg-red-50"
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
          <div className="mt-1 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Classes
            </h4>
            {classes.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune classe dans ce département.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-800 font-medium">{cls.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">L{cls.level}</Badge>
                        <Badge variant="outline">{cls.code}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
