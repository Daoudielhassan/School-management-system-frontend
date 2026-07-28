/**
 * A teaching day is split into two fixed 1h30 slots per half-day — a manager
 * always creates both slots of a half-day at once (see `POST /api/sessions
 * /half-day`), never a single session. Mirrors the backend's `Session`
 * domain validation (`Session.slotsFor`).
 */
export type HalfDayId = 'MORNING' | 'AFTERNOON';

export interface HalfDay {
  id: HalfDayId;
  label: string;
  /** Human-readable summary of the two slots this half-day creates. */
  hint: string;
}

export const HALF_DAYS: HalfDay[] = [
  { id: 'MORNING', label: 'Matin', hint: '9h00–10h30 et 10h45–12h15' },
  { id: 'AFTERNOON', label: 'Après-midi', hint: '14h00–15h30 et 15h45–17h15' },
];

/** The four fixed 1h30 windows in a teaching day — used to constrain the calendar's drag/drop. */
export interface FixedSlot {
  start: string;
  end: string;
}

export const FIXED_SLOTS: FixedSlot[] = [
  { start: '09:00', end: '10:30' },
  { start: '10:45', end: '12:15' },
  { start: '14:00', end: '15:30' },
  { start: '15:45', end: '17:15' },
];
