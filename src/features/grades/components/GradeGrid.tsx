'use client';

import { GradeCard } from './GradeCard';
import type { StudentGrade } from '../types';

export interface GradeGridProps {
  grades: StudentGrade[];
  isLoading?: boolean;
  onView: (grade: StudentGrade) => void;
}

export function GradeGrid({ grades, isLoading = false, onView }: GradeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-[var(--secondary)]/50 backdrop-blur-md rounded-xl h-64 border border-[var(--accent)]/30"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {grades.map((grade) => (
        <GradeCard key={grade.id} grade={grade} onView={onView} />
      ))}
    </div>
  );
}
