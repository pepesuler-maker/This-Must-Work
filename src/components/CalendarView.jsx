import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Download, Plus, Sparkles, CheckCircle2, Clock 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { generateICSContent, downloadICSFile } from '../services/calendarExport';

export function CalendarView({
  journeys,
  onSelectMilestone,
  onAddMilestoneWithDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    soundEngine.playPop();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    soundEngine.playPop();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    soundEngine.playPop();
    setCurrentDate(new Date());
  };

  // Collect all milestones with dates across all journeys
  const allMilestones = [];
  journeys.forEach((j) => {
    j.milestones.forEach((m) => {
      if (m.targetDate) {
        allMilestones.push({ ...m, journeyTitle: j.title });
      }
    });
  });

  // Export all milestones to ICS
  const handleExportAllICS = () => {
    soundEngine.playPop();
    const content = generateICSContent(allMilestones, 'BloomTrail Milestones');
    downloadICSFile(`BloomTrail_All_Milestones_${year}_${month + 1}`, content);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Build calendar matrix
  const calendarCells = [];
  // Empty leading cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="calendar-card">
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            style={{ 
              width: 46, 
              height: 46, 
              borderRadius: 16, 
              background: 'var(--pastel-peach)', 
              border: '2px solid var(--border-color)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 3px 0 var(--border-color)'
            }}
          >
            <CalendarIcon size={24} color="var(--text-main)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', lineHeight: 1.1 }}>
              {monthNames[month]} {year}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
              Milestones & Target Dates
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-icon-bubble" onClick={prevMonth} title="Previous Month">
            <ChevronLeft size={18} />
          </button>
          <button className="btn-bubble btn-cream" onClick={goToToday} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            Today
          </button>
          <button className="btn-icon-bubble" onClick={nextMonth} title="Next Month">
            <ChevronRight size={18} />
          </button>
          <button 
            className="btn-bubble btn-mint" 
            onClick={handleExportAllICS}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Download .ics to sync with Apple Calendar, Google Calendar, or Outlook"
          >
            <Download size={15} />
            <span>Export Calendar (.ics)</span>
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="calendar-grid" style={{ marginTop: 0 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {calendarCells.map((dayNum, idx) => {
          if (!dayNum) {
            return (
              <div 
                key={`empty-${idx}`} 
                style={{ background: 'transparent', minHeight: 84, minWidth: 0, width: '100%' }} 
              />
            );
          }

          const pad = (n) => String(n).padStart(2, '0');
          const cellDateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
          const isToday = cellDateStr === todayStr;

          const dayMilestones = allMilestones.filter((m) => m.targetDate === cellDateStr);

          return (
            <div
              key={`day-${dayNum}`}
              className={`calendar-day-cell ${isToday ? 'today' : ''}`}
              onClick={() => {
                soundEngine.playPop();
                onAddMilestoneWithDate(cellDateStr);
              }}
              title="Click to schedule a milestone on this date"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="calendar-day-number">{dayNum}</span>
                {isToday && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#E65100' }}>
                    TODAY
                  </span>
                )}
              </div>

              {dayMilestones.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className={`calendar-ms-pill ${m.status === 'completed' ? 'completed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playPop();
                    onSelectMilestone(m);
                  }}
                  title={`${m.title} (${m.status})`}
                >
                  {m.status === 'completed' ? '✓ ' : '🌱 '}
                  {m.title}
                </div>
              ))}

              {dayMilestones.length > 3 && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  +{dayMilestones.length - 3} more
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Reminders summary */}
      <div style={{ marginTop: 24, padding: 18, background: '#FFF8F2', borderRadius: 22, border: '2px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} color="#E65100" />
          <span>Upcoming Checkpoints</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allMilestones
            .filter((m) => m.status !== 'completed' && m.targetDate >= todayStr)
            .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
            .slice(0, 4)
            .map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  padding: '8px 14px',
                  borderRadius: 14,
                  border: '1.5px solid var(--border-color)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  soundEngine.playPop();
                  onSelectMilestone(m);
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{m.title}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                    ({m.journeyTitle})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700 }}>
                  <CalendarIcon size={13} />
                  <span>{m.targetDate}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
