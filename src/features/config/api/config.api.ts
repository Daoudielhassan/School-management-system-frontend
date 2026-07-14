/**
 * System config API layer.
 *
 * TODO(backend): no system-config endpoint exists anywhere in the current
 * backend contract (see ADMIN_BACKEND_TODO.md). The list is empty and update
 * throws a clear error instead of hitting a nonexistent route. Replace these
 * bodies with real calls once the endpoint exists.
 */
import type { SystemConfig } from '../types';

export function fetchConfigs(): Promise<SystemConfig[]> {
  return Promise.resolve([]);
}

export async function updateConfig(): Promise<SystemConfig> {
  throw new Error('System configuration is not implemented by the current backend.');
}
