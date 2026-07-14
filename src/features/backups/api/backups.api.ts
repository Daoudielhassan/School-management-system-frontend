/**
 * Backups API layer.
 *
 * TODO(backend): no backup/restore endpoint exists anywhere in the current
 * backend contract (see ADMIN_BACKEND_TODO.md). The list is empty and
 * create/restore throw a clear error instead of hitting a nonexistent route.
 * Replace these bodies with real calls once the endpoint exists.
 */
import type { Backup } from '../types';

export function fetchBackups(): Promise<Backup[]> {
  return Promise.resolve([]);
}

export async function createBackup(): Promise<Backup> {
  throw new Error('Backups are not implemented by the current backend.');
}

export async function restoreBackup(): Promise<void> {
  throw new Error('Backups are not implemented by the current backend.');
}
