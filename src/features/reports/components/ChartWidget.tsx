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
  return (
    <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-blue-400/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
              <span className="text-white font-medium">
                {item.value}
                {valueSuffix}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
