'use client';

/**
 * Search box + role filter buttons for the users directory. Presentational.
 */
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { USER_ROLES, ROLE_FILTER_ALL, formatRole } from '../constants';
import type { UserFilters as Filters } from '../types';

export interface UserFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function UserFilters({ filters, onChange }: UserFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Input
        type="text"
        placeholder="Search users..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="max-w-xs"
      />
      <div className="flex flex-wrap gap-2">
        {[ROLE_FILTER_ALL, ...USER_ROLES].map((role) => (
          <Button
            key={role}
            variant={filters.role === role ? 'default' : 'outline'}
            className="capitalize"
            onClick={() => onChange({ ...filters, role: role as Filters['role'] })}
          >
            {role === ROLE_FILTER_ALL ? 'All' : formatRole(role)}
          </Button>
        ))}
      </div>
    </div>
  );
}
