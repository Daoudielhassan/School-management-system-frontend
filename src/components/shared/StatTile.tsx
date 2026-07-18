'use client';

import type { ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TINTS = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
} as const;

export interface StatTileProps {
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  /** Renders as the larger, filled hero tile — use on at most one tile per row. */
  emphasis?: boolean;
  /** Icon chip color for non-emphasis tiles — use to differentiate categories (e.g. present vs absent). Defaults to blue. */
  tint?: keyof typeof TINTS;
}

/**
 * Compact stat card shared across every role's dashboard (mirrors the admin
 * dashboard's hero tile): one `emphasis` tile stands out, the rest stay flat
 * and equal so the row isn't just N identical boxes. Non-emphasis tiles can
 * take an optional `tint` to color-code categories without breaking the
 * shared layout.
 */
export function StatTile({ label, value, icon: Icon, emphasis = false, tint = 'blue' }: StatTileProps) {
  return (
    <Card
      className={`transition-all duration-300 group ${
        emphasis
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-700 shadow-lg shadow-blue-600/20'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <CardContent className={`flex items-center justify-between ${emphasis ? 'p-7' : 'p-5'}`}>
        <div>
          <p className={`text-sm font-medium mb-1.5 ${emphasis ? 'text-blue-100' : 'text-slate-500'}`}>
            {label}
          </p>
          <p className={`font-bold tracking-tight ${emphasis ? 'text-5xl text-white' : 'text-3xl text-slate-800'}`}>
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
            emphasis ? 'bg-white/15' : TINTS[tint]
          }`}
        >
          <Icon className={`h-6 w-6 ${emphasis ? 'text-white' : ''}`} />
        </div>
      </CardContent>
    </Card>
  );
}
