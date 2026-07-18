'use client';

import { TrendingUp, TrendingDown, Target, Award, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { performanceSolid, performanceBg } from '../constants';
import type { StudentGrade } from '../types';

function TrendIcon({ trend, performance }: { trend: string; performance: string }) {
  const color =
    performance === 'excellent' || performance === 'good'
      ? 'text-emerald-600'
      : performance === 'average'
        ? 'text-amber-600'
        : 'text-red-600';
  if (trend === 'up') return <TrendingUp className={`h-4 w-4 ${color}`} />;
  if (trend === 'down') return <TrendingDown className={`h-4 w-4 ${color}`} />;
  return <Target className={`h-4 w-4 ${color}`} />;
}

function scoreColor(percentage: number): string {
  return percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600';
}

export function GradeCard({
  grade,
  onView,
}: {
  grade: StudentGrade;
  onView: (grade: StudentGrade) => void;
}) {
  return (
    <Card className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${performanceBg(grade.performance)}`}>
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">
              {grade.studentName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon trend={grade.trend} performance={grade.performance} />
            <Badge variant="secondary">{grade.performance}</Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Matière" value={grade.subject} />
          <div className="flex justify-between">
            <span className="text-slate-500">Note</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${scoreColor(grade.percentage)}`}>
                {grade.grade}/{grade.maxGrade}
              </span>
              <span className="text-xs text-slate-400">({grade.percentage}%)</span>
            </div>
          </div>
          <Row label="Type" value={grade.examType} />
          <Row label="Date" value={grade.date} />
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${performanceSolid(grade.performance)} transition-all duration-500`}
              style={{ width: `${grade.percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button size="sm" variant="outline" className="w-full" onClick={() => onView(grade)}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Détails
          </Button>
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
