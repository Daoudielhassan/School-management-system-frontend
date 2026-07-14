'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  /** 0-based current page */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of elements across all pages */
  totalElements: number;
  /** Number of items per page */
  pageSize: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-1', className)}>
      {/* Element count */}
      <p className="text-sm text-muted-foreground">
        {totalElements === 0
          ? 'Aucun résultat'
          : `${from}–${to} sur ${totalElements} résultats`}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Lignes par page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange(Number(v));
                onPageChange(0); // reset to first page
              }}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          title="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          title="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm px-2 whitespace-nowrap">
          Page <span className="font-medium">{totalPages === 0 ? 0 : page + 1}</span> sur{' '}
          <span className="font-medium">{totalPages}</span>
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          title="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          title="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
