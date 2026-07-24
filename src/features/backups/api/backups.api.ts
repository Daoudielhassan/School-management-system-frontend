/**
 * Backups API layer — thin wrappers over the shared HTTP client.
 */
import { apiGet, apiPost, API_ENDPOINTS } from '@/config/api';
import type { Backup } from '../types';

export function fetchBackups(token?: string): Promise<Backup[]> {
  return apiGet<Backup[]>(API_ENDPOINTS.BACKUPS.BASE, token);
}

export function createBackup(token?: string): Promise<Backup> {
  return apiPost<Backup>(API_ENDPOINTS.BACKUPS.BASE, {}, token);
}

export function restoreBackup(id: string, token?: string): Promise<void> {
  return apiPost<void>(API_ENDPOINTS.BACKUPS.RESTORE(id), {}, token);
}
