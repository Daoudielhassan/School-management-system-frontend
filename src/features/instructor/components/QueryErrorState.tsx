'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface QueryErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/** Shared "failed to load" state for query-backed lists — distinct from an empty result. */
export function QueryErrorState({
  message = 'Impossible de charger les données.',
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
