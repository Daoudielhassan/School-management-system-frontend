'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Hash, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import type { GradeReport } from '../types';

export function GradeReportView({ report }: { report: GradeReport }) {
  const cards = [
    { icon: Hash, value: report.count, label: 'Notes' },
    { icon: TrendingUp, value: `${report.averagePercent}%`, label: 'Moyenne' },
    { icon: ArrowDown, value: `${report.minPercent}%`, label: 'Minimum' },
    { icon: ArrowUp, value: `${report.maxPercent}%`, label: 'Maximum' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, value, label }) => (
          <Card key={label} className="border-slate-200 shadow-sm shadow-slate-200/50">
            <CardContent className="p-4 text-center">
              <Icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800 tabular-nums">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {report.bySubject && report.bySubject.length > 0 && (
        <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
          <CardContent className="p-4">
            <h4 className="text-slate-900 font-medium mb-3">Par sujet</h4>
            <div className="space-y-2">
              {report.bySubject.map((s) => (
                <div key={s.subjectId} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                  <span className="text-slate-500">{s.subjectId}</span>
                  <span className="text-slate-800 font-medium">
                    {s.averagePercent}% ({s.count} notes)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
