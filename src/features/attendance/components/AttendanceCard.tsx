'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Eye } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { ResolvedAttendanceRecord } from '../types';

export interface AttendanceCardProps {
  record: ResolvedAttendanceRecord;
  onView: (record: ResolvedAttendanceRecord) => void;
  onExcuse: (record: ResolvedAttendanceRecord) => void;
}

export function AttendanceCard({ record, onView, onExcuse }: AttendanceCardProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-md border-slate-200 hover:border-blue-400/30 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{record.studentName}</h3>
              <p className="text-xs text-blue-600">ID: {record.studentId.substring(0, 8)}…</p>
            </div>
          </div>
          <StatusBadge status={record.status} />
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Subject" value={record.subjectName} />
          <Row label="Instructor" value={record.instructorName} />
          <Row
            label="Date"
            value={`${record.attendanceDate} ${record.time !== '-' ? `at ${record.time}` : ''}`}
          />
          <Row label="Room" value={record.room} />
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-blue-400/30 hover:bg-blue-500/20 text-blue-600"
            onClick={() => onView(record)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {record.status === 'ABSENT' && (
            <Button
              size="sm"
              className="bg-green-500/20 hover:bg-green-500/30 text-green-700 border border-green-400/30"
              onClick={() => onExcuse(record)}
            >
              Excuse
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
