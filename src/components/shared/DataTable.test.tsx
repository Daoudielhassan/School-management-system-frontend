import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
];

describe('DataTable defaults', () => {
  it('shows the French empty-state message by default when no emptyMessage is passed', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
    expect(screen.queryByText(/no results/i)).not.toBeInTheDocument();
  });

  it('shows French pagination labels by default when paginated', () => {
    const rows: Row[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
    }));

    render(<DataTable columns={columns} data={rows} paginated pageSize={10} />);

    expect(screen.getByText('Lignes par page')).toBeInTheDocument();
    expect(screen.getByText('Page 1 sur 2')).toBeInTheDocument();
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();
  });
});
