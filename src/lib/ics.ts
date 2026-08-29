import type { Popup } from '../types';
import { format } from 'date-fns';

export function generateICS(popup: Popup): string {
  const formatDt = (iso: string) =>
    iso.replace(/[-:]/g, '').replace('T', 'T').split('.')[0];

  const start = formatDt(popup.startsAt);
  const end = formatDt(popup.endsAt);
  const now = format(new Date(), "yyyyMMdd'T'HHmmss");
  const uid = `${popup.id}@purplewheel.store`;

  const description = [
    'The Purple Wheel — mobile refillery',
    popup.notes,
    'Reserve ahead at purplewheel.store/reserve',
  ]
    .filter(Boolean)
    .join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Purple Wheel//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${popup.title} — The Purple Wheel`,
    `LOCATION:${popup.address}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
