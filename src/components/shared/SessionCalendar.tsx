'use client';

import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { EventContentArg, EventDropArg, DateSelectArg } from '@fullcalendar/core';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FIXED_SLOTS } from '@/features/sessions';
import styles from './SessionCalendar.module.css';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * `Date` -> local "YYYY-MM-DDTHH:mm:ss", matching the backend's `LocalDateTime`
 * (no zone). `.toISOString()` converts to UTC and appends "Z", which the
 * backend can neither parse into a LocalDateTime nor match against its
 * fixed-slot validation (both compare local wall-clock time).
 */
function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export interface SessionCalendarEvent {
  id: string;
  startsAt: string;
  endsAt: string;
  title: string;
  subtitle?: string;
  room?: string | null;
  cancelled?: boolean;
  /** Any stable string (e.g. subject id) used to pick a consistent color for this event's category. */
  colorKey?: string;
}

export interface SessionCalendarProps {
  events: SessionCalendarEvent[];
  isLoading?: boolean;
  /**
   * Enables drag-to-reschedule. Resize is never available — a session always
   * runs a full fixed slot (see `FIXED_SLOTS`), so its duration isn't a
   * user-adjustable property.
   */
  editable?: boolean;
  emptyMessage?: string;
  onEventClick?: (id: string) => void;
  onEventDrop?: (id: string, startsAt: string, endsAt: string, revert: () => void) => void;
  /** Enables click/drag-to-create on an empty slot. */
  onSlotSelect?: (startsAt: string, endsAt: string) => void;
}

const PALETTE = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' }, // blue
  { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' }, // emerald
  { bg: '#fffbeb', border: '#fde68a', text: '#b45309' }, // amber
  { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' }, // violet
  { bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490' }, // cyan
  { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' }, // rose
];

function colorFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function renderEventContent(arg: EventContentArg) {
  const { subtitle, room, cancelled } = arg.event.extendedProps as {
    subtitle?: string;
    room?: string | null;
    cancelled?: boolean;
  };
  return (
    <div className={`${styles.eventCard} ${cancelled ? styles.eventCancelled : ''}`}>
      <p className={styles.eventTitle}>{arg.event.title}</p>
      {subtitle && <p className={styles.eventSubtitle}>{subtitle}</p>}
      {room && (
        <p className={styles.eventRoom}>
          <MapPin size={11} />
          {room}
        </p>
      )}
    </div>
  );
}

/**
 * Shared week/day/month calendar for session display, used read-only
 * (professor/student/admin schedules) and editable (manager drag-and-drop
 * scheduling) — one visual language for "what session is where" everywhere
 * in the app instead of each screen re-inventing a table or a fixed-slot grid.
 */
export function SessionCalendar({
  events,
  isLoading = false,
  editable = false,
  emptyMessage = 'Aucune séance programmée',
  onEventClick,
  onEventDrop,
  onSlotSelect,
}: SessionCalendarProps) {
  const calendarEvents = useMemo(
    () =>
      events.map((e) => {
        const color = colorFor(e.colorKey ?? e.title);
        return {
          id: e.id,
          start: e.startsAt,
          end: e.endsAt,
          title: e.title,
          editable: editable && !e.cancelled,
          backgroundColor: e.cancelled ? '#f1f5f9' : color.bg,
          borderColor: e.cancelled ? '#cbd5e1' : color.border,
          textColor: e.cancelled ? '#94a3b8' : color.text,
          extendedProps: { subtitle: e.subtitle, room: e.room, cancelled: e.cancelled },
        };
      }),
    [events, editable]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-xl" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <div className="text-center py-14 text-slate-400 text-sm">{emptyMessage}</div>;
  }

  return (
    <div className={`${styles.calendarWrap} overflow-x-auto`}>
      <div className="min-w-[700px]">
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay,dayGridMonth',
        }}
        firstDay={1}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        nowIndicator
        height="auto"
        editable={editable}
        // A session always runs exactly one of the four fixed 1h30 slots —
        // never a partial one — so duration can't be dragged, only the
        // day/start can move. `businessHours` doubles as the drag/resize
        // constraint: since an event's length always equals one full slot,
        // it can only land flush with a slot's start, which keeps every
        // drag valid instead of round-tripping to the server to find out.
        // Same constraint on create-by-click via `selectConstraint`. Only
        // set (and only shaded in the UI) when actually needed for a
        // constraint — read-only calendars stay visually unchanged.
        businessHours={
          editable || onSlotSelect
            ? FIXED_SLOTS.map((s) => ({ daysOfWeek: ALL_DAYS, startTime: `${s.start}:00`, endTime: `${s.end}:00` }))
            : undefined
        }
        eventStartEditable={editable}
        eventDurationEditable={false}
        eventConstraint={editable ? 'businessHours' : undefined}
        selectConstraint={onSlotSelect ? 'businessHours' : undefined}
        selectable={!!onSlotSelect}
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={(info) => onEventClick?.(info.event.id)}
        select={(info: DateSelectArg) => {
          onSlotSelect?.(info.startStr, info.endStr);
        }}
        eventDrop={(info: EventDropArg) => {
          if (!onEventDrop || !info.event.start || !info.event.end) return;
          onEventDrop(info.event.id, toLocalDateTimeString(info.event.start), toLocalDateTimeString(info.event.end), info.revert);
        }}
      />
      </div>
    </div>
  );
}
