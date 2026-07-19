'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGet } from '@/lib/axios';
import { Modal } from '@/components/ui/Modal';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  status: string;
  type: 'DELEGATION' | 'WORK_REQUEST' | 'CHECKLIST' | 'FMS' | 'HOLIDAY' | 'BIRTHDAY' | 'ANNIVERSARY';
}

const TYPE_COLORS: Record<string, string> = {
  DELEGATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  WORK_REQUEST: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  CHECKLIST: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  FMS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  HOLIDAY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  BIRTHDAY: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  ANNIVERSARY: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function eventIcon(type: CalendarEvent['type']) {
  switch (type) {
    case 'BIRTHDAY': return 'Birthday';
    case 'ANNIVERSARY': return 'Anniversary';
    case 'HOLIDAY': return 'Holiday';
    case 'DELEGATION': return 'Delegation';
    case 'WORK_REQUEST': return 'Work Request';
    case 'CHECKLIST': return 'Checklist';
    case 'FMS': return 'FMS';
    default: return type;
  }
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const from = new Date(year, month, 1).toISOString();
  const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () =>
      apiGet<{
        delegation: CalendarEvent[];
        workRequests: CalendarEvent[];
        checklist: CalendarEvent[];
        fms: CalendarEvent[];
        holidays: CalendarEvent[];
        celebrations: CalendarEvent[];
      }>('/calendar/events', { from, to }),
  });

  const allEvents: CalendarEvent[] = [
    ...(events?.holidays ?? []),
    ...(events?.delegation ?? []),
    ...(events?.workRequests ?? []),
    ...(events?.checklist ?? []),
    ...(events?.fms ?? []),
    ...(events?.celebrations ?? []),
  ];

  const holidayDays = new Set(
    (events?.holidays ?? []).map((h) => new Date(h.date).getDate()),
  );

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of allEvents) {
    const d = new Date(ev.date).getDate();
    (eventsByDay[d] ??= []).push(ev);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;
  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-indigo-500" />
          <h1 className="text-xl font-bold font-display text-foreground">Calendar</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground w-36 text-center">
            {monthName} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(TYPE_COLORS).map(([type, cls]) => (
          <span key={type} className={`rounded-full px-2 py-1 font-medium ${cls}`}>
            {type.replace('_', ' ')}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="min-h-[100px] p-1 border-b border-r border-slate-100 dark:border-slate-800" />
            ))}
            {days.map((day) => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isHoliday = holidayDays.has(day);
              const dayEvents = eventsByDay[day] ?? [];
              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDay(day)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDay(day);
                    }
                  }}
                  className={`min-h-[100px] p-1.5 border-b border-r border-slate-100 dark:border-slate-800 ${
                    isToday
                      ? 'bg-amber-50 ring-2 ring-inset ring-amber-300 dark:bg-amber-950/20 dark:ring-amber-500/60'
                      : isHoliday
                        ? 'bg-red-50 dark:bg-red-950/20'
                        : ''
                  } cursor-pointer transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/35`}
                  aria-label={`${day} ${monthName} ${year}, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}`}
                >
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' : 'text-foreground'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded px-1 py-0.5 text-xs truncate ${TYPE_COLORS[ev.type] ?? ''}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs font-medium text-primary pl-1">+{dayEvents.length - 3} more - view all</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDate ? selectedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }) : 'Calendar details'}
        size="lg"
      >
        {selectedEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedEvents.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-border bg-surface-muted p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-foreground">{ev.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[ev.type] ?? ''}`}>
                    {eventIcon(ev.type)}
                  </span>
                </div>
                {ev.status && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Status: <span className="font-medium text-foreground">{ev.status.replace(/_/g, ' ')}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center">
            <p className="text-sm font-medium text-foreground">No events on this date</p>
            <p className="mt-1 text-xs text-muted-foreground">Birthdays, anniversaries, holidays, and task dates will appear here.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
