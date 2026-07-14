'use client';

import { TrendingUp, TrendingDown, Target, Award, Eye, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { performanceSolid, performanceBg } from '../constants';
import type { StudentGrade } from '../types';

function TrendIcon({ trend, performance }: { trend: string; performance: string }) {
  const color =
    performance === 'excellent' || performance === 'good'
      ? 'text-green-400'
      : performance === 'average'
        ? 'text-yellow-400'
        : 'text-red-400';
  if (trend === 'up') return <TrendingUp className={`h-4 w-4 ${color}`} />;
  if (trend === 'down') return <TrendingDown className={`h-4 w-4 ${color}`} />;
  return <Target className={`h-4 w-4 ${color}`} />;
}

function scoreColor(percentage: number): string {
  return percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400';
}

export function GradeCard({
  grade,
  onView,
}: {
  grade: StudentGrade;
  onView: (grade: StudentGrade) => void;
}) {
  return (
    <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group hover:shadow-lg hover:shadow-[var(--primary)]/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${performanceBg(grade.performance)}`}>
              <Award className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                {grade.studentName}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{grade.studentId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon trend={grade.trend} performance={grade.performance} />
            <Badge className={`border ${performanceBg(grade.performance)} text-[var(--text)]`}>
              {grade.performance}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Subject" value={grade.subject} />
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Score:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${scoreColor(grade.percentage)}`}>
                {grade.grade}/{grade.maxGrade}
              </span>
              <span className="text-xs text-[var(--text-muted)]">({grade.percentage}%)</span>
            </div>
          </div>
          <Row label="Type" value={grade.examType} />
          <Row label="Date" value={grade.date} />
        </div>

        <div className="mt-4">
          <div className="w-full bg-[var(--background-light)] rounded-full h-2">
            <div
              className={`h-2 rounded-full ${performanceSolid(grade.performance)} transition-all duration-500`}
              style={{ width: `${grade.percentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 text-[var(--accent)]"
            onClick={() => onView(grade)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            className="bg-[var(--secondary)]/50 hover:bg-[var(--secondary)]/60 text-[var(--text)] border border-[var(--accent)]/30"
          >
            <Zap className="h-3 w-3 mr-1" />
            Analyze
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-muted)]">{label}:</span>
      <span className="text-[var(--text)]">{value}</span>
    </div>
  );
}
