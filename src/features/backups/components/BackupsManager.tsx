'use client';

/**
 * Backup & restore screen: stats, create backup, history table, restore (with
 * confirmation via the shared ConfirmDialog — replaces the native confirm()).
 */
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { extractErrorMessage } from '@/lib/api-error';
import { BackupStatsCards } from './BackupStatsCards';
import { buildBackupColumns } from './backup-columns';
import { useBackups, useCreateBackup, useRestoreBackup } from '../hooks/useBackups';
import type { Backup } from '../types';

export function BackupsManager() {
  const [restoring, setRestoring] = useState<Backup | null>(null);

  const { data: backups = [], isLoading } = useBackups();
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();

  const columns = useMemo(() => buildBackupColumns(setRestoring), []);

  const handleCreate = () => {
    createBackup.mutate(undefined, {
      onSuccess: () => toast.success('Sauvegarde créée'),
      onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create backup')),
    });
  };

  const handleRestore = async () => {
    if (!restoring) return;
    try {
      await restoreBackup.mutateAsync(restoring.id);
      toast.success('Système restauré');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to restore backup'));
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Database}
        title="Sauvegarde &amp; restauration"
        description="Gérez les sauvegardes de la base de données et la restauration système"
        actions={
          <Button onClick={handleCreate} disabled={createBackup.isPending}>
            <Database className="mr-2 h-4 w-4" />
            {createBackup.isPending ? 'Création…' : 'Créer une sauvegarde'}
          </Button>
        }
      />

      <BackupStatsCards backups={backups} />

      <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Historique des sauvegardes</CardTitle>
          <CardDescription>Liste de toutes les sauvegardes système disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={backups} isLoading={isLoading} paginated />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!restoring}
        onOpenChange={(open) => {
          if (!open) setRestoring(null);
        }}
        title="Restore backup"
        description="Are you sure you want to restore this backup? Current data will be overwritten."
        confirmLabel="Restore"
        variant="destructive"
        isConfirming={restoreBackup.isPending}
        onConfirm={handleRestore}
      />
    </div>
  );
}
