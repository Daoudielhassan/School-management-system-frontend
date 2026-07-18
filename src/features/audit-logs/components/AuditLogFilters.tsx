'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AUDIT_ACTION_OPTIONS } from '../constants';

export interface AuditLogFilterValues {
  action: string;
  resource: string;
  userId: string;
  from: string;
  to: string;
}

export interface AuditLogFiltersProps {
  filters: AuditLogFilterValues;
  onChange: (filters: AuditLogFilterValues) => void;
  onReset: () => void;
}

export function AuditLogFilters({ filters, onChange, onReset }: AuditLogFiltersProps) {
  const set = (patch: Partial<AuditLogFilterValues>) => onChange({ ...filters, ...patch });

  return (
    <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-500">Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select value={filters.action} onValueChange={(action) => set({ action })}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {AUDIT_ACTION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Ressource (ex. /api/sessions)"
            value={filters.resource}
            onChange={(e) => set({ resource: e.target.value })}
          />
          <Input
            placeholder="ID utilisateur"
            value={filters.userId}
            onChange={(e) => set({ userId: e.target.value })}
          />
          <Input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} />
          <Input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} />

          <Button variant="ghost" onClick={onReset} className="text-slate-500">
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
