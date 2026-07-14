'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
  STATUS_FILTER_ALL,
  SEVERITY_FILTER_ALL,
} from '../constants';
import type { DisciplineFilters as Filters } from '../types';

export interface DisciplineFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

const triggerStyle = { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' };

export function DisciplineFilters({ filters, onChange, onReset }: DisciplineFiltersProps) {
  return (
    <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status })}>
            <SelectTrigger className="w-44" style={triggerStyle}>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_FILTER_ALL}>Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.severity}
            onValueChange={(severity) => onChange({ ...filters, severity })}
          >
            <SelectTrigger className="w-44" style={triggerStyle}>
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEVERITY_FILTER_ALL}>Toutes sévérités</SelectItem>
              {SEVERITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            style={{ color: 'var(--text-secondary)' }}
            onClick={onReset}
          >
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
