import React, { useState } from 'react';
import { 
  Plus, Calendar, Award, Sparkles, Check, 
  Trash2, Camera, Flame, ChevronRight, X, Clock, ExternalLink 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { storageService } from '../services/storageService';
import { StampProofModal } from './StampProofModal';

const HABIT_ICONS = ['🏃', '🚴', '🧘', '💧', '📖', '🎨', '🏋️', '🥗', '🌿', '⭐', '☕', '🎸'];
const THEME_COLORS = ['#FF9AA2', '#B5EAEA', '#FFDAC1', '#E2F0CB', '#FFB7B2', '#DED2F9'];

export function HabitMilestonesView({
  habits,
  onUpdateHabits,
}) {
  const [activeHabitForStamp, setActiveHabitForStamp] = useState(null);
  const [initialDateForStamp, setInitialDateForStamp] = useState('');
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);
  const [viewingStampProof, setViewingStampProof] = useState(null); // { stamp, habitTitle }

  // New habit form states (empty background placeholder text only)
  const [newTitle, setNewTitle] = useState('');
  const [newDaysPerWeek, setNewDaysPerWeek] = useState(3);
  const [newIcon, setNewIcon] = useState(HABIT_ICONS[0]);
  const [newThemeColor, setNewThemeColor] = useState(THEME_COLORS[0]);
  const [newDescription, setNewDescription] = useState('');

  // Handle saving a new stamp with mandatory picture proof
  const handleSaveStamp = (stamp) => {
    if (!activeHabitForStamp) return;

    const updated = habits.map((h) => {
      if (h.id === activeHabitForStamp.id) {
        // Avoid duplicate stamp for same date or prepend newest
        const existingStamps = (h.stamps || []).filter((s) => s.date !== stamp.date);
        return {
          ...h,
          stamps: [stamp, ...existingStamps],
        };
      }
      return h;
    });

    onUpdateHabits(updated);
    setActiveHabitForStamp(null);
  };

  // Handle deleting a stamp
  const handleDeleteStamp = (habitId, stampId) => {
    soundEngine.playPop();
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          stamps: (h.stamps || []).filter((s) => s.id !== stampId),
        };
      }
      return h;
    });
    onUpdateHabits(updated);
    if (viewingStampProof?.stamp?.id === stampId) {
      setViewingStampProof(null);
    }
  };

  // Handle creating a new habit milestone
  const handleCreateHabit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundEngine.playSuccess();
    const newHabit = {
      id: 'habit-' + Date.now(),
      title: newTitle.trim(),
      targetDaysPerWeek: Number(newDaysPerWeek) || 3,
      icon: newIcon,
      themeColor: newThemeColor,
      description: newDescription.trim(),
      category: 'Personal Goal',
      createdAt: new Date().toISOString(),
      stamps: [],
    };

    onUpdateHabits([...habits, newHabit]);
    setNewTitle('');
    setNewDescription('');
    setIsNewHabitModalOpen(false);
  };

  // Handle deleting a habit milestone
  const handleDeleteHabit = (habitId) => {
    if (confirm('Delete this habit milestone and its stamps?')) {
      soundEngine.playPop();
      onUpdateHabits(habits.filter((h) => h.id !== habitId));
    }
  };

  return (
    <div className="habit-view-container">
      {/* Informative Milestone Status Header Banner */}
      <div className="milestone-status-summary-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 18, 
              background: 'var(--pastel-peach)', 
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 3px 0 var(--border-color)',
              flexShrink: 0,
            }}
          >
            🏃
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>Habit Milestones & Photo Proofs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 700 }}>
              Set minimum days per week goals (e.g. Jogging 3 days/week). Every stamp requires mandatory photo proof!
            </p>
          </div>
        </div>

        <button
          className="btn-bubble btn-mint"
          onClick={() => {
            soundEngine.playPop();
            setIsNewHabitModalOpen(true);
          }}
          style={{ padding: '9px 16px', fontSize: '0.88rem', flexShrink: 0 }}
        >
          <Plus size={16} />
          <span>New Habit Milestone</span>
        </button>
      </div>

      {/* Habit Cards List */}
      <div className="habit-cards-grid">
        {habits.map((habit) => {
          const status = storageService.getHabitWeeklyStatus(habit);

          return (
            <div 
              key={habit.id} 
              className="habit-card"
              style={{
                borderLeft: `8px solid ${habit.themeColor || 'var(--pastel-peach)'}`,
              }}
            >
              {/* Card Header */}
              <div className="habit-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div 
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 16, 
                      background: habit.themeColor || '#FF9AA2',
                      border: '2px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      boxShadow: '0 3px 0 var(--border-color)',
                    }}
                  >
                    {habit.icon || '🏃'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>{habit.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Goal: Minimum {habit.targetDaysPerWeek} days a week
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="btn-icon-bubble"
                    onClick={() => handleDeleteHabit(habit.id)}
                    title="Delete habit milestone"
                    style={{ width: 34, height: 34 }}
                  >
                    <Trash2 size={15} color="#C62828" />
                  </button>
                </div>
              </div>

              {/* Informative Status Badge */}
              <div 
                className={`milestone-inform-badge ${status.isReached ? 'badge-reached' : ''}`}
                style={{
                  background: status.isReached ? '#E8F5E9' : '#FFF3E0',
                  border: `2px solid ${status.isReached ? '#81C784' : '#FFB74D'}`,
                  borderRadius: 14,
                  padding: '8px 12px',
                  margin: '12px 0',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: status.isReached ? '#2E7D32' : '#E65100',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{status.isReached ? '🎉' : '📢'}</span>
                <span>{status.statusMessage}</span>
              </div>

              {/* Weekly Progress Bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, marginBottom: 5 }}>
                  <span>Weekly Milestone Progress</span>
                  <span>{status.completedDays} / {status.target} Days ({status.progressPercent}%)</span>
                </div>
                <div 
                  style={{
                    height: 12,
                    background: '#EAE0D5',
                    borderRadius: 999,
                    overflow: 'hidden',
                    border: '1.5px solid var(--border-color)',
                  }}
                >
                  <div 
                    style={{
                      height: '100%',
                      width: `${status.progressPercent}%`,
                      background: status.isReached ? 'linear-gradient(90deg, #A8E6CF, #388E3C)' : 'var(--pastel-peach)',
                      borderRadius: 999,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* 7-Day Week Stamps Strip */}
              <div className="habit-week-strip" style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {status.weekDays.map((wd) => (
                    <div 
                      key={wd.date}
                      className={`week-day-cell ${wd.isStamped ? 'stamped' : ''} ${wd.isToday ? 'today-cell' : ''}`}
                      onClick={() => {
                        if (wd.isStamped && wd.stamp) {
                          soundEngine.playPop();
                          setViewingStampProof({ stamp: wd.stamp, habitTitle: habit.title, habitId: habit.id });
                        } else {
                          soundEngine.playPop();
                          setInitialDateForStamp(wd.date);
                          setActiveHabitForStamp(habit);
                        }
                      }}
                      title={wd.isStamped ? `View proof for ${wd.dayName} (${wd.date})` : `Stamp ${wd.dayName} with photo proof`}
                      style={{
                        background: wd.isStamped ? '#E8F5E9' : '#FFFFFF',
                        border: `2px solid ${wd.isToday ? '#E65100' : 'var(--border-color)'}`,
                        borderRadius: 14,
                        padding: '8px 4px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: wd.isStamped ? '0 2px 0 #2E7D32' : '0 2px 0 var(--border-color)',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, display: 'block', color: 'var(--text-muted)' }}>
                        {wd.dayName}
                      </span>
                      <div style={{ fontSize: 18, margin: '3px 0' }}>
                        {wd.isStamped ? (wd.stamp?.badgeIcon || '💮') : '⭕'}
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: wd.isStamped ? '#2E7D32' : 'var(--text-soft)' }}>
                        {wd.isStamped ? 'Stamped' : (wd.isToday ? 'Today' : wd.date.slice(8))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action Button to Stamp */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button
                  className="btn-bubble btn-peach"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
                  onClick={() => {
                    soundEngine.playPop();
                    setInitialDateForStamp(new Date().toISOString().split('T')[0]);
                    setActiveHabitForStamp(habit);
                  }}
                >
                  <Camera size={16} />
                  <span>Stamp Today (+ Mandatory Photo Proof)</span>
                </button>
              </div>

              {/* Stamps Photo Gallery Preview */}
              <div className="habit-stamps-gallery">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📸</span> Photo Proof Stamps ({habit.stamps?.length || 0})
                  </span>
                  {habit.stamps?.length > 0 && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-soft)', fontWeight: 700 }}>
                      Tap to view photo proof
                    </span>
                  )}
                </div>

                {(!habit.stamps || habit.stamps.length === 0) ? (
                  <div 
                    style={{ 
                      padding: '16px', 
                      background: '#FFF9F2', 
                      borderRadius: 14, 
                      border: '1.5px dashed var(--border-subtle)',
                      textAlign: 'center',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    No stamps recorded yet. Tap "Stamp Today" with your photo proof to begin!
                  </div>
                ) : (
                  <div className="stamps-horizontal-scroller">
                    {habit.stamps.map((stamp) => (
                      <div
                        key={stamp.id}
                        className="stamp-gallery-card"
                        onClick={() => {
                          soundEngine.playPop();
                          setViewingStampProof({ stamp, habitTitle: habit.title, habitId: habit.id });
                        }}
                        title={`Stamped on ${stamp.date}. Tap to view full proof photo.`}
                      >
                        <div className="stamp-thumb-wrapper">
                          <img 
                            src={stamp.photoProof} 
                            alt={`Proof for ${stamp.date}`} 
                            className="stamp-thumb-img" 
                          />
                          <div className="stamp-seal-overlay">
                            {stamp.badgeIcon || '💮'}
                          </div>
                        </div>
                        <div className="stamp-card-caption">
                          <span className="stamp-date-text">{stamp.date}</span>
                          {stamp.caption && <span className="stamp-note-snippet">{stamp.caption}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div 
            style={{
              padding: 40,
              background: '#FFFFFF',
              borderRadius: 24,
              border: '2.5px solid var(--border-color)',
              textAlign: 'center',
              boxShadow: '0 4px 0 var(--border-color)',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>🌱</div>
            <h3>No habit milestones yet!</h3>
            <p style={{ color: 'var(--text-muted)', margin: '8px 0 16px', fontSize: '0.9rem' }}>
              Create your first habit milestone (e.g. Jogging 3 days a week) to start tracking with mandatory photo stamps!
            </p>
            <button
              className="btn-bubble btn-mint"
              onClick={() => setIsNewHabitModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add First Habit</span>
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Photo Proof Stamp Modal */}
      {activeHabitForStamp && (
        <StampProofModal
          habit={activeHabitForStamp}
          initialDate={initialDateForStamp}
          onClose={() => setActiveHabitForStamp(null)}
          onSaveStamp={handleSaveStamp}
        />
      )}

      {/* Proof Lightbox Modal */}
      {viewingStampProof && (
        <div className="modal-overlay" onClick={() => setViewingStampProof(null)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{viewingStampProof.stamp.badgeIcon || '💮'}</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>Certified Photo Proof</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {viewingStampProof.habitTitle} • {viewingStampProof.stamp.date} {viewingStampProof.stamp.time}
                  </p>
                </div>
              </div>
              <button className="btn-icon-bubble" onClick={() => setViewingStampProof(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Proof Image */}
            <div 
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '2.5px solid var(--border-color)',
                boxShadow: '0 4px 0 var(--border-color)',
                marginBottom: 16,
                background: '#1F1F1F',
              }}
            >
              <img 
                src={viewingStampProof.stamp.photoProof} 
                alt="Enlarged photo proof"
                style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' }} 
              />
            </div>

            {/* Caption & Metadata */}
            {viewingStampProof.stamp.caption && (
              <div 
                style={{
                  background: '#FFF9F2',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1.5px solid var(--border-color)',
                  marginBottom: 16,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                💬 "{viewingStampProof.stamp.caption}"
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn-bubble btn-cream"
                style={{ color: '#C62828', padding: '8px 14px', fontSize: '0.82rem' }}
                onClick={() => {
                  if (confirm('Delete this proof stamp?')) {
                    handleDeleteStamp(viewingStampProof.habitId, viewingStampProof.stamp.id);
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Delete Stamp</span>
              </button>

              <button
                className="btn-bubble btn-mint"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                onClick={() => setViewingStampProof(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Habit Milestone Modal (zero pre-made text, placeholder background text only) */}
      {isNewHabitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewHabitModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>✨</span>
                <h2 style={{ fontSize: '1.25rem' }}>New Habit Milestone</h2>
              </div>
              <button className="btn-icon-bubble" onClick={() => setIsNewHabitModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHabit}>
              {/* Icon Picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Choose Activity Icon
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {HABIT_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      className="btn-icon-bubble"
                      style={{
                        fontSize: 20,
                        background: newIcon === ic ? 'var(--pastel-peach)' : '#FFFFFF',
                        transform: newIcon === ic ? 'scale(1.1)' : 'none',
                      }}
                      onClick={() => {
                        soundEngine.playPop();
                        setNewIcon(ic);
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input (Placeholder background text only, NO pre-made text) */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Habit / Goal Name
                </label>
                <input
                  type="text"
                  className="input-bubble"
                  placeholder="e.g. Jogging, Cycling, Morning Reading..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Target Days Per Week */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Minimum Days Target per Week ({newDaysPerWeek} Days)
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`btn-bubble ${newDaysPerWeek === num ? 'btn-peach' : 'btn-cream'}`}
                      style={{ flex: 1, padding: '8px 0', fontSize: '0.9rem' }}
                      onClick={() => {
                        soundEngine.playPop();
                        setNewDaysPerWeek(num);
                      }}
                    >
                      {num}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Card Color
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        soundEngine.playPop();
                        setNewThemeColor(color);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: color,
                        border: '2px solid var(--border-color)',
                        boxShadow: newThemeColor === color ? '0 0 0 3px var(--border-color)' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Description (Placeholder background text only, NO pre-made text) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Description / Milestone Rules
                </label>
                <textarea
                  className="input-bubble"
                  rows={2}
                  placeholder="e.g. Minimum 3 days jogging a week. Mandatory picture proof of shoes or trail required!"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn-bubble btn-cream"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => setIsNewHabitModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-bubble btn-mint"
                  style={{ flex: 2, padding: '12px' }}
                >
                  <Sparkles size={18} />
                  <span>Create Milestone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
