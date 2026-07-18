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
    <Card className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-slate-800">{record.studentName}</h3>
          </div>
          <StatusBadge status={record.status} />
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Matière" value={record.subjectName} />
          <Row label="Professeur" value={record.instructorName} />
          <Row
            label="Date"
            value={`${record.attendanceDate} ${record.time !== '-' ? `à ${record.time}` : ''}`}
          />
          <Row label="Salle" value={record.room} />
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(record)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Détails
          </Button>
          {record.status === 'ABSENT' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => onExcuse(record)}
            >
              Excuser
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-slate-800 text-right truncate">{value}</span>
    </div>
  );
}
