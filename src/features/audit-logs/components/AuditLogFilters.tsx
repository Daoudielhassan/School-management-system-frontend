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

const inputStyle = {
  backgroundColor: 'var(--bg-secondary)',
  borderColor: 'var(--border-light)',
  color: 'var(--text-primary)',
};

export function AuditLogFilters({ filters, onChange, onReset }: AuditLogFiltersProps) {
  const set = (patch: Partial<AuditLogFilterValues>) => onChange({ ...filters, ...patch });

  return (
    <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select value={filters.action} onValueChange={(action) => set({ action })}>
            <SelectTrigger style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
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
            placeholder="Resource (e.g. /api/sessions)"
            value={filters.resource}
            onChange={(e) => set({ resource: e.target.value })}
            style={inputStyle}
          />
          <Input
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => set({ userId: e.target.value })}
            style={inputStyle}
          />
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => set({ from: e.target.value })}
            style={inputStyle}
          />
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => set({ to: e.target.value })}
            style={inputStyle}
          />

          <Button variant="ghost" onClick={onReset} style={{ color: 'var(--text-secondary)' }}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
