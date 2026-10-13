// Calendar Export & Sync Helper for Google Calendar & Apple/Outlook (.ics)

// Format date into iCal format: YYYYMMDDTHHmmSSZ or YYYYMMDD
function formatICalDate(dateStr, timeStr = '09:00') {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const [hour, min] = (timeStr || '09:00').split(':');

  // Construct local date and convert to UTC
  const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min), 0);
  const pad = (n) => String(n).padStart(2, '0');

  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

// Generate Google Calendar 1-Click URL
export function getGoogleCalendarUrl(milestone, journeyTitle = 'BloomTrail') {
  if (!milestone.targetDate) return null;

  const startIso = formatICalDate(milestone.targetDate, milestone.reminderTime || '09:00');
  // 1 hour later
  const [year, month, day] = milestone.targetDate.split('-');
  const [hour, min] = (milestone.reminderTime || '09:00').split(':');
  const endDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour) + 1, Number(min), 0);
  const pad = (n) => String(n).padStart(2, '0');
  const endIso = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(endDate.getUTCDate())}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}00Z`;

  const title = encodeURIComponent(`🌸 [BloomTrail] ${milestone.title}`);
  let detailsText = `Roadmap: ${journeyTitle}\n\n`;
  if (milestone.description) detailsText += `Description: ${milestone.description}\n\n`;
  if (milestone.subtasks && milestone.subtasks.length > 0) {
    detailsText += 'Checklist:\n' + milestone.subtasks.map((st) => `- [${st.completed ? 'x' : ' '}] ${st.title}`).join('\n');
  }
  const details = encodeURIComponent(detailsText);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
}

// Generate .ics string for milestones
export function generateICSContent(milestones, journeyTitle = 'BloomTrail Roadmap') {
  const nowStr = formatICalDate(new Date().toISOString().split('T')[0], '00:00');
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BloomTrail//Cozy Roadmap Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${journeyTitle}`
  ];

  milestones.filter(m => m.targetDate).forEach((m) => {
    const startStr = formatICalDate(m.targetDate, m.reminderTime || '09:00');
    const [year, month, day] = m.targetDate.split('-');
    const [hour, min] = (m.reminderTime || '09:00').split(':');
    const end = new Date(Number(year), Number(month) - 1, Number(day), Number(hour) + 1, Number(min), 0);
    const pad = (n) => String(n).padStart(2, '0');
    const endStr = `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}00Z`;

    let desc = m.description || '';
    if (m.subtasks && m.subtasks.length > 0) {
      desc += ' \\nChecklist: ' + m.subtasks.map(s => `${s.completed ? '✓' : '○'} ${s.title}`).join(', ');
    }

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:bloomtrail-${m.id}@bloomtrail.app`);
    ics.push(`DTSTAMP:${nowStr}`);
    ics.push(`DTSTART:${startStr}`);
    ics.push(`DTEND:${endStr}`);
    ics.push(`SUMMARY:🌸 ${m.title}`);
    ics.push(`DESCRIPTION:${desc.replace(/\n/g, '\\n')}`);
    ics.push(`STATUS:${m.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);

    // Alarm reminder 15 minutes prior
    if (m.reminderEnabled) {
      ics.push('BEGIN:VALARM');
      ics.push('ACTION:DISPLAY');
      ics.push(`DESCRIPTION:Reminder: ${m.title}`);
      ics.push('TRIGGER:-PT15M');
      ics.push('END:VALARM');
    }

    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

// Download .ics file directly to device
export function downloadICSFile(filename, icsContent) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
