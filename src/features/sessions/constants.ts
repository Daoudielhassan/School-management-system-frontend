/**
 * A teaching day has exactly two fixed half-day slots — no freeform start
 * time/duration. Mirrors the backend's `Session` domain validation
 * (`MORNING_START`/`MORNING_END`/`AFTERNOON_START`/`AFTERNOON_END`).
 */
export interface SessionSlot {
  id: 'MORNING' | 'AFTERNOON';
  label: string;
  start: string;
  end: string;
}

export type SessionSlotId = SessionSlot['id'];

export const SESSION_SLOTS: SessionSlot[] = [
  { id: 'MORNING', label: 'Matin', start: '09:00', end: '12:15' },
  { id: 'AFTERNOON', label: 'Après-midi', start: '14:00', end: '17:15' },
];
