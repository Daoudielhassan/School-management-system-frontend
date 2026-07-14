'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Clock, Database } from 'lucide-react';
import { format } from 'date-fns';
import { formatSize } from '../lib/format-size';
import type { Backup } from '../types';

export function BackupStatsCards({ backups }: { backups: Backup[] }) {
  const totalSize = backups.reduce((acc, b) => acc + b.size, 0);
  const lastBackup =
    backups.length > 0 ? format(new Date(backups[0].createdAt), 'MMM d, HH:mm') : 'Never';

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatCard title="Total Backups" icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}>
        {backups.length}
      </StatCard>
      <StatCard title="Last Backup" icon={<Clock className="h-4 w-4 text-muted-foreground" />}>
        {lastBackup}
      </StatCard>
      <StatCard title="Total Size" icon={<Database className="h-4 w-4 text-muted-foreground" />}>
        {formatSize(totalSize)}
      </StatCard>
    </div>
  );
}

function StatCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{children}</div>
      </CardContent>
    </Card>
  );
}
