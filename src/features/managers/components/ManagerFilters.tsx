'use client';

/**
 * Search + department filter bar for the managers directory. Presentational:
 * it renders the current `filters` and reports changes.
 */
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Department, ManagerFilters as Filters } from '../types';

const ALL = '__all__';

export interface ManagerFiltersProps {
  filters: Filters;
  departments: Department[];
  onChange: (filters: Filters) => void;
}

export function ManagerFilters({ filters, departments, onChange }: ManagerFiltersProps) {
  const hasActiveFilters = !!(filters.search || filters.departmentId);

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        type="text"
        placeholder="Rechercher par nom, email ou matricule"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px]"
      />

      <Select
        value={filters.departmentId || ALL}
        onValueChange={(v) => onChange({ ...filters, departmentId: v === ALL ? '' : v })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tous les départements" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tous les départements</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => onChange({ search: '', departmentId: '' })}
        >
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );
}
