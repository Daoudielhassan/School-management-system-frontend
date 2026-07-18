'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartData } from '../types';

export interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  icon: React.ElementType;
  /** Appended after each value, e.g. '%' or ' records'. Defaults to none. */
  valueSuffix?: string;
}

export function ChartWidget({ title, data, icon: Icon, valueSuffix = '' }: ChartWidgetProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 text-sm">{item.name}</span>
                </div>
                <span className="text-slate-900 font-medium tabular-nums">
                  {item.value}
                  {valueSuffix}
                </span>
              </div>
              {/* Simple proportional bar — gives the breakdown real visual weight */}
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
