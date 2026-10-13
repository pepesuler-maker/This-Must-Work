import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Download, Plus, Sparkles, CheckCircle2, Clock, Check, X 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { generateICSContent, downloadICSFile } from '../services/calendarExport';

// Local date string formatter (YYYY-MM-DD) avoiding timezone shifts
const formatLocalDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function CalendarView({
  journeys,
  activeJourneyId,
  onSelectMilestone,
  onAddMilestoneWithDate,
  onAddMilestoneDirect,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayStr = formatLocalDate(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // Quick add on date state
  const [isAddingOnDate, setIsAddingOnDate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');

  const activeJourneys = journeys.filter((j) => !j.isArchived);
  const [selectedJourneyId, setSelectedJourneyId] = useState(
    activeJourneyId || activeJourneys[0]?.id || (journeys[0] ? journeys[0].id : '')
  );

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
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    setSelectedDateStr(formatLocalDate(newDate));
  };

  const nextMonth = () => {
    soundEngine.playPop();
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    setSelectedDateStr(formatLocalDate(newDate));
  };

  const goToToday = () => {
    soundEngine.playPop();
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(formatLocalDate(now));
  };

  // Quick add checkpoint to selected date
  const handleQuickAdd = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const targetJId = selectedJourneyId || activeJourneys[0]?.id || journeys[0]?.id;
    if (onAddMilestoneDirect) {
      onAddMilestoneDirect({
        title: newTitle.trim(),
        journeyId: targetJId,
        targetDate: selectedDateStr,
        reminderTime: newTime || '10:00',
      });
    } else if (onAddMilestoneWithDate) {
      onAddMilestoneWithDate(selectedDateStr, targetJId);
    }

    setNewTitle('');
    setIsAddingOnDate(false);
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

          {!isAddingOnDate && (
            <button
              className="btn-bubble btn-peach"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => {
                soundEngine.playPop();
                setIsAddingOnDate(true);
              }}
            >
              <Plus size={14} />
              <span>Add on this Date</span>
            </button>
          )}
        </div>

        {/* Inline Quick Add Form */}
        {isAddingOnDate && (
          <form
            onSubmit={handleQuickAdd}
            style={{
              background: '#FFF9E6',
              border: '2px solid var(--border-color)',
              borderRadius: 18,
              padding: '12px 14px',
              marginBottom: 14,
              boxShadow: '0 3px 0 var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🌱</span> New Checkpoint ({selectedDateStr})
              </span>
              <button
                type="button"
                className="btn-icon-bubble"
                style={{ width: 22, height: 22 }}
                onClick={() => setIsAddingOnDate(false)}
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>

            <input
              type="text"
              className="input-bubble"
              placeholder="What do you plan to achieve? (e.g. Master Flexbox)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              style={{ padding: '8px 12px', fontSize: '0.88rem', background: '#FFFFFF' }}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeJourneys.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    Trail:
                  </label>
                  <select
                    className="input-bubble"
                    value={selectedJourneyId}
                    onChange={(e) => setSelectedJourneyId(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.78rem', width: '100%', background: '#FFFFFF' }}
                  >
                    {activeJourneys.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.icon || '🌱'} {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ width: 110 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                  Reminder:
                </label>
                <input
                  type="time"
                  className="input-bubble"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '0.78rem', width: '100%', background: '#FFFFFF' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn-bubble btn-mint"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem' }}
              >
                <Check size={14} />
                <span>Save Checkpoint</span>
              </button>

              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ padding: '7px 12px', fontSize: '0.82rem' }}
                onClick={() => setIsAddingOnDate(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ padding: '7px 10px', fontSize: '0.74rem', color: 'var(--text-muted)' }}
                onClick={() => {
                  soundEngine.playPop();
                  const targetJId = selectedJourneyId || activeJourneys[0]?.id || journeys[0]?.id;
                  onAddMilestoneWithDate(selectedDateStr, targetJId);
                  setIsAddingOnDate(false);
                }}
                title="Open full detailed editor with subtasks, reflections, and rewards"
              >
                More Details ↗
              </button>
            </div>
          </form>
        )}

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
