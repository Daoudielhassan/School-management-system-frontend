'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ManagerPortal');

export default function ManagerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error('Unhandled error in the manager portal', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-2xl bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Une erreur est survenue</h2>
            <p className="text-sm text-slate-500 mt-1">
              Quelque chose s&apos;est mal passé pendant le chargement de cette page.
            </p>
          </div>
          <Button onClick={reset}>Réessayer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
