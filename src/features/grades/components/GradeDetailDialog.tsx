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
import { performanceBg } from '../constants';
import type { StudentGrade } from '../types';

function scoreColor(percentage: number): string {
  return percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400';
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
      <DialogContent className="bg-[var(--secondary)]/95 backdrop-blur-md border-[var(--primary)]/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[var(--primary)]">Student Performance Details</DialogTitle>
          <DialogDescription className="text-[var(--text-muted)]">
            Comprehensive analysis for {grade?.studentName}
          </DialogDescription>
        </DialogHeader>
        {grade && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Student Name" value={grade.studentName} />
              <Field label="Student ID" value={grade.studentId} />
              <Field label="Subject" value={grade.subject} />
              <Field label="Instructor" value={grade.instructor} />
              <Field label="Evaluation Type" value={grade.examType} />
              <Field label="Date" value={grade.date} />
            </div>

            <div className="bg-[var(--secondary)]/10 rounded-lg p-4">
              <h4 className="text-[var(--text)] font-medium mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${scoreColor(grade.percentage)}`}>
                    {grade.grade}/{grade.maxGrade}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Score</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${scoreColor(grade.percentage)}`}>
                    {grade.percentage}%
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Percentage</div>
                </div>
                <div>
                  <Badge className={`${performanceBg(grade.performance)} border text-[var(--text)]`}>
                    {grade.performance}
                  </Badge>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Performance</div>
                </div>
              </div>
            </div>

            {grade.comment && (
              <div>
                <label className="text-sm text-[var(--text-muted)]">Comment</label>
                <p className="text-[var(--text)]">{grade.comment}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full border-red-400/30 text-red-400 hover:bg-red-500/20"
              onClick={() => onDelete(grade)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Grade
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-[var(--text-muted)]">{label}</label>
      <p className="text-[var(--text)] font-medium">{value}</p>
    </div>
  );
}
