'use client';

/**
 * Search + department + class filter bar for the students directory.
 * Presentational: it renders the current `filters` and reports changes.
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
import type { Department, ClassGroup, StudentFilters as Filters } from '../types';

const ALL = '__all__';

export interface StudentFiltersProps {
  filters: Filters;
  departments: Department[];
  /** Class groups already scoped to the selected department. */
  classGroups: ClassGroup[];
  onChange: (filters: Filters) => void;
}

export function StudentFilters({
  filters,
  departments,
  classGroups,
  onChange,
}: StudentFiltersProps) {
  const hasActiveFilters = !!(filters.search || filters.departmentId || filters.classId);

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        type="text"
        placeholder="Search by name, email or student number"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px]"
      />

      <Select
        value={filters.departmentId || ALL}
        onValueChange={(v) =>
          onChange({ ...filters, departmentId: v === ALL ? '' : v, classId: '' })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.classId || ALL}
        onValueChange={(v) => {
          if (v === ALL) {
            onChange({ ...filters, classId: '' });
            return;
          }
          // Selecting a class also aligns the department it belongs to.
          const cls = classGroups.find((c) => c.id === v);
          onChange({
            ...filters,
            classId: v,
            departmentId: cls?.departmentId ?? filters.departmentId,
          });
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Classes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Classes</SelectItem>
          {classGroups.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name} (L{c.level})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => onChange({ search: '', departmentId: '', classId: '' })}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
