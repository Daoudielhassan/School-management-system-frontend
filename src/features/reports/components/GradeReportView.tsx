'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Hash, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import type { GradeReport } from '../types';

export function GradeReportView({ report }: { report: GradeReport }) {
  const cards = [
    { icon: Hash, value: report.count, label: 'Graded Items' },
    { icon: TrendingUp, value: `${report.averagePercent}%`, label: 'Average' },
    { icon: ArrowDown, value: `${report.minPercent}%`, label: 'Lowest' },
    { icon: ArrowUp, value: `${report.maxPercent}%`, label: 'Highest' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, value, label }) => (
          <Card key={label} className="bg-gray-900/50 backdrop-blur-md border-gray-700/30">
            <CardContent className="p-4 text-center">
              <Icon className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {report.bySubject && report.bySubject.length > 0 && (
        <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30">
          <CardContent className="p-4">
            <h4 className="text-white font-medium mb-3">By Subject</h4>
            <div className="space-y-2">
              {report.bySubject.map((s) => (
                <div key={s.subjectId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{s.subjectId}</span>
                  <span className="text-white">
                    {s.averagePercent}% ({s.count} grades)
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
