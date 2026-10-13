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
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

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
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
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

  // Build calendar matrix
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Milestones on the selected date
  const selectedDateMilestones = allMilestones.filter((m) => m.targetDate === selectedDateStr);

  return (
    <div className="calendar-card">
      {/* Calendar Header Controls */}
      <div className="calendar-header-bar">
        <div className="calendar-title-group">
          <div className="calendar-icon-bubble">
            <CalendarIcon size={22} color="var(--text-main)" />
          </div>
          <div>
            <h2>{monthNames[month]} {year}</h2>
            <p className="calendar-subtitle">Milestones & Target Dates</p>
          </div>
        </div>

        <div className="calendar-controls-group">
          <div className="calendar-nav-buttons">
            <button className="btn-icon-bubble btn-cal-nav" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="btn-bubble btn-cream btn-cal-today" onClick={goToToday}>
              Today
            </button>
            <button className="btn-icon-bubble btn-cal-nav" onClick={nextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            className="btn-bubble btn-mint btn-export-cal" 
            onClick={handleExportAllICS}
            title="Download .ics to sync with Apple Calendar, Google Calendar, or Outlook"
          >
            <Download size={14} />
            <span>Export (.ics)</span>
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="calendar-grid">
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
                className="calendar-empty-cell"
              />
            );
          }

          const pad = (n) => String(n).padStart(2, '0');
          const cellDateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
          const isToday = cellDateStr === todayStr;
          const isSelected = cellDateStr === selectedDateStr;

          const dayMilestones = allMilestones.filter((m) => m.targetDate === cellDateStr);

          return (
            <div
              key={`day-${dayNum}`}
              className={`calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected-day' : ''}`}
              onClick={() => {
                soundEngine.playPop();
                setSelectedDateStr(cellDateStr);
              }}
              title={`View milestones for ${cellDateStr}`}
            >
              <div className="calendar-cell-header">
                <span className="calendar-day-number">{dayNum}</span>
                {isToday && <span className="today-dot" title="Today" />}
              </div>

              {/* Milestone Indicators */}
              <div className="calendar-ms-container">
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
                    <span className="ms-status-icon">{m.status === 'completed' ? '✓' : '🌱'}</span>
                    <span className="ms-title-text">{m.title}</span>
                  </div>
                ))}

                {dayMilestones.length > 3 && (
                  <span className="calendar-ms-more">
                    +{dayMilestones.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Drawer (Especially handy on mobile phones!) */}
      <div className="selected-date-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h4 style={{ fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📅</span>
            <span>Checkpoints for {selectedDateStr}</span>
          </h4>

          <button
            className="btn-bubble btn-peach"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => {
              soundEngine.playPop();
              onAddMilestoneWithDate(selectedDateStr);
            }}
          >
            <Plus size={14} />
            <span>Add on this Date</span>
          </button>
        </div>

        {selectedDateMilestones.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No checkpoints scheduled on this day. Tap "Add on this Date" to schedule one!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedDateMilestones.map((m) => (
              <div
                key={m.id}
                className="selected-date-item"
                onClick={() => {
                  soundEngine.playPop();
                  onSelectMilestone(m);
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.92rem' }}>{m.title}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                    ({m.journeyTitle})
                  </span>
                </div>
                <div 
                  style={{
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: m.status === 'completed' ? '#D4EDDA' : '#FFF3CD',
                    color: m.status === 'completed' ? '#155724' : '#856404',
                    border: '1.5px solid var(--border-color)',
                  }}
                >
                  {m.status === 'completed' ? '✓ Completed' : '🌱 In Progress'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Reminders summary */}
      <div className="upcoming-checkpoints-card">
        <h4 style={{ fontSize: '0.98rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={16} color="#E65100" />
          <span>All Upcoming Checkpoints</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allMilestones
            .filter((m) => m.status !== 'completed' && m.targetDate >= todayStr)
            .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
            .slice(0, 4)
            .map((m) => (
              <div
                key={m.id}
                className="upcoming-item"
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
