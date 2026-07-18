'use client';

import { Check, X, Clock, FileCheck } from 'lucide-react';

const STATUS_CONFIG = {
  PRESENT: { label: 'Présent', icon: Check, active: 'bg-emerald-600 text-white' },
  ABSENT: { label: 'Absent', icon: X, active: 'bg-red-600 text-white' },
  LATE: { label: 'Retard', icon: Clock, active: 'bg-amber-600 text-white' },
  EXCUSED: { label: 'Justifié', icon: FileCheck, active: 'bg-blue-600 text-white' },
} as const;

export type AttendanceStatusValue = keyof typeof STATUS_CONFIG;

export interface AttendanceStatusPickerProps {
  value: AttendanceStatusValue;
  onChange: (status: AttendanceStatusValue) => void;
  disabled?: boolean;
}

/**
 * One-click segmented control for marking attendance — replaces the
 * per-row status dropdown with direct, tactile selection (color-coded,
 * pressed state visible at a glance across a whole class list).
 */
export function AttendanceStatusPicker({ value, onChange, disabled }: AttendanceStatusPickerProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
      {(Object.keys(STATUS_CONFIG) as AttendanceStatusValue[]).map((status) => {
        const { label, icon: Icon, active } = STATUS_CONFIG[status];
        const isActive = value === status;
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(status)}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive ? active : 'text-slate-400 hover:bg-white hover:text-slate-600'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
