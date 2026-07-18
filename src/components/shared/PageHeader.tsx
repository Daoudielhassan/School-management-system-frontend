'use client';

import type { ComponentType, ReactNode } from 'react';

export interface PageHeaderProps {
  /** Lucide (or any) icon component rendered in the accent chip. */
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  /** Right-aligned actions (buttons, etc.). */
  actions?: ReactNode;
}

/**
 * Consistent premium header for every dashboard screen (admin, manager,
 * student): an accent icon chip, a title set in the admin display font where
 * available (`--font-admin-display`, falls back to inherit outside the admin
 * layout), a muted description, and a right-aligned actions slot. Keeps
 * typography, spacing and color identical across every role.
 */
export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <div className="flex-shrink-0 grid place-items-center h-11 w-11 rounded-2xl bg-blue-50 ring-1 ring-inset ring-blue-100">
            <Icon className="h-[22px] w-[22px] text-blue-600" />
          </div>
        )}
        <div className="min-w-0">
          <h1
            className="text-[26px] font-semibold text-slate-900 tracking-tight leading-none truncate"
            style={{ fontFamily: 'var(--font-admin-display, inherit)' }}
          >
            {title}
          </h1>
          {description && <p className="text-sm text-slate-500 mt-1.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
