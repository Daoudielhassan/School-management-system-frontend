'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import type { StudentGrade } from '../types';

function scoreColor(percentage: number): string {
  return percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600';
}

export function GradeDetailDialog({
  grade,
  onOpenChange,
  onDelete,
}: {
  grade: StudentGrade | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (grade: StudentGrade) => void;
}) {
  return (
    <Dialog open={!!grade} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détail de la note</DialogTitle>
          <DialogDescription>Analyse complète pour {grade?.studentName}</DialogDescription>
        </DialogHeader>
        {grade && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Étudiant" value={grade.studentName} />
              <Field label="Matière" value={grade.subject} />
              <Field label="Professeur" value={grade.instructor} />
              <Field label="Type d'évaluation" value={grade.examType} />
              <Field label="Date" value={grade.date} />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h4 className="text-slate-800 font-medium mb-3">Résultat</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${scoreColor(grade.percentage)}`}>
                    {grade.grade}/{grade.maxGrade}
                  </div>
                  <div className="text-xs text-slate-500">Note</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${scoreColor(grade.percentage)}`}>
                    {grade.percentage}%
                  </div>
                  <div className="text-xs text-slate-500">Pourcentage</div>
                </div>
                <div>
                  <Badge variant="secondary">{grade.performance}</Badge>
                  <div className="text-xs text-slate-500 mt-1">Performance</div>
                </div>
              </div>
            </div>

            {grade.comment && (
              <div className="space-y-1">
                <label className="text-sm text-slate-500">Commentaire</label>
                <p className="text-slate-800">{grade.comment}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onDelete(grade)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la note
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-500">{label}</label>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  );
}
