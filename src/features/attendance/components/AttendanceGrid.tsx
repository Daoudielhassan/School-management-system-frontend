'use client';

import { AttendanceCard } from './AttendanceCard';
import type { ResolvedAttendanceRecord } from '../types';

export interface AttendanceGridProps {
  records: ResolvedAttendanceRecord[];
  isLoading?: boolean;
  onView: (record: ResolvedAttendanceRecord) => void;
  onExcuse: (record: ResolvedAttendanceRecord) => void;
}

export function AttendanceGrid({ records, isLoading = false, onView, onExcuse }: AttendanceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/70 backdrop-blur-md rounded-xl h-48 border border-slate-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {records.map((record) => (
        <AttendanceCard key={record.id} record={record} onView={onView} onExcuse={onExcuse} />
      ))}
    </div>
  );
}
