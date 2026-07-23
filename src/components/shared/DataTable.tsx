'use client';

/**
 * Generic, presentational data table built on TanStack Table — the single table
 * primitive for the app.
 *
 * Cross-cutting states handled for you: loading skeletons, error, empty.
 * Optional behaviours (opt-in, so the simple call sites stay simple):
 *   - `searchKey`  → renders a search box filtering that column client-side.
 *   - `paginated`  → renders rows-per-page + page controls (client pagination).
 *
 * When neither is set it just renders the given rows (callers that paginate
 * server-side pass one page of rows + their own <Pagination/>).
 */
import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  skeletonRows?: number;
  /** Column id to filter with the search box. Omit to hide search. */
  searchKey?: string;
  searchPlaceholder?: string;
  /** Enable client-side pagination controls. */
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  error = null,
  emptyMessage = 'Aucun résultat',
  skeletonRows = 10,
  searchKey,
  searchPlaceholder = 'Rechercher…',
  paginated = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(searchKey ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    ...(paginated ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters },
    initialState: paginated ? { pagination: { pageSize } } : undefined,
  });

  const colCount = columns.length;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: colCount }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={colCount} className="text-center text-red-400">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colCount} className="text-center text-gray-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginated && !isLoading && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
