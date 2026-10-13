import React, { useState, useRef } from 'react';
import { 
  X, Check, Calendar, Bell, Plus, Trash2, 
  ExternalLink, Sparkles, Camera 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../services/soundEngine';
import { getGoogleCalendarUrl, generateICSContent, downloadICSFile } from '../services/calendarExport';

const STICKER_OPTIONS = [
  '🌱 Little Sprout',
  '☕ Warm Mug',
  '🎒 Wanderer Backpack',
  '⭐ Golden Star',
  '👑 Cozy Crown',
  '🌸 Cherry Blossom',
  '🐾 Cat Paw',
  '🍵 Warm Matcha',
  '🌙 Cozy Moon',
  '🧁 Sweet Muffin',
];

export function MilestoneModal({
  milestone,
  journeyTitle,
  onClose,
  onUpdateMilestone,
  onDeleteMilestone,
}) {
  const [title, setTitle] = useState(milestone.title || '');
  const [description, setDescription] = useState(milestone.description || '');
  const [status, setStatus] = useState(milestone.status || 'in_progress');
  const [targetDate, setTargetDate] = useState(milestone.targetDate || '');
  const [reminderTime, setReminderTime] = useState(milestone.reminderTime || '09:00');
  const [reminderEnabled, setReminderEnabled] = useState(milestone.reminderEnabled ?? true);
  const [rewardSticker, setRewardSticker] = useState(milestone.rewardSticker || STICKER_OPTIONS[0]);
  const [reflection, setReflection] = useState(milestone.reflection || '');
  const [subtasks, setSubtasks] = useState(milestone.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [photoProof, setPhotoProof] = useState(milestone.photoProof || null);
  const fileInputRef = useRef(null);

  // Handle checking/unchecking a subtask
  const handleToggleSubtask = (stId) => {
    soundEngine.playPop();
    const updated = subtasks.map((st) =>
      st.id === stId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);
  };

  // Add new subtask
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    soundEngine.playPop();
    const newTask = {
      id: 'st-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newTask]);
    setNewSubtaskTitle('');
  };

  // Remove subtask
  const handleDeleteSubtask = (stId) => {
    soundEngine.playPop();
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundEngine.playPop();
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoProof(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger celebration on completing
  const handleMarkComplete = () => {
    soundEngine.playMilestoneFanfare();
    
    // Launch delightful confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94', '#FFE49E'],
    });

    const updated = {
      ...milestone,
      title: title.trim() || 'Checkpoint',
      description,
      status: 'completed',
      targetDate,
      reminderTime,
      reminderEnabled,
      rewardSticker,
      reflection,
      photoProof,
      subtasks: subtasks.map((st) => ({ ...st, completed: true })),
      completedAt: new Date().toISOString(),
    };
    onUpdateMilestone(updated);
    onClose();
  };

  // Save changes
  const handleSave = () => {
    soundEngine.playPop();
    const updated = {
      ...milestone,
      title: title.trim() || 'Checkpoint',
      description,
      status,
      targetDate,
      reminderTime,
      reminderEnabled,
      rewardSticker,
      reflection,
      photoProof,
      subtasks,
    };
    onUpdateMilestone(updated);
    onClose();
  };

  const googleCalUrl = getGoogleCalendarUrl(
    { ...milestone, title, targetDate, reminderTime, description, subtasks },
    journeyTitle
  );

  const handleDownloadICS = () => {
    soundEngine.playPop();
    const content = generateICSContent(
      [{ ...milestone, title, targetDate, reminderTime, description, subtasks, reminderEnabled }],
      journeyTitle
    );
    downloadICSFile(`Milestone-${(title || 'Checkpoint').replace(/\s+/g, '_')}`, content);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>✨</span>
            <h2 style={{ fontSize: '1.25rem' }}>Checkpoint Details</h2>
          </div>
          <button className="btn-icon-bubble" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Title & Status (Background placeholder text only) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Milestone Name
          </label>
          <input
            className="input-bubble"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Flexbox Layouts"
          />
        </div>

        {/* Description (Background placeholder text only) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Description & Notes
          </label>
          <textarea
            className="input-bubble"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does reaching this checkpoint look like?"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Status Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Status
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'locked', label: '🔒 Locked' },
              { key: 'in_progress', label: '🌱 In Progress' },
              { key: 'completed', label: '✨ Completed' },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                className={`btn-bubble ${status === st.key ? 'btn-peach' : 'btn-cream'}`}
                style={{ flex: 1, padding: '8px 10px', fontSize: '0.85rem' }}
                onClick={() => {
                  soundEngine.playPop();
                  setStatus(st.key);
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Photo Proof for this Checkpoint */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              📸 Photo Proof Attachment
            </label>
            {photoProof && (
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#C62828' }}
                onClick={() => setPhotoProof(null)}
              >
                Remove Photo
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />

          {!photoProof ? (
            <button
              type="button"
              className="btn-bubble btn-cream"
              style={{ width: '100%', padding: '10px', fontSize: '0.82rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} />
              <span>Attach Picture Proof of Completion</span>
            </button>
          ) : (
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid var(--border-color)', maxHeight: 180 }}>
              <img src={photoProof} alt="Milestone proof" style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Date & Reminder Notification Scheduling */}
        <div style={{ background: '#FFF7ED', padding: 16, borderRadius: 20, border: '2px solid var(--border-color)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Calendar size={18} color="#E65100" />
            <h4 style={{ fontSize: '0.95rem' }}>Schedule & Ringtone Reminder</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Target Due Date
              </label>
              <input
                type="date"
                className="input-bubble"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Reminder Time
              </label>
              <input
                type="time"
                className="input-bubble"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => {
                  soundEngine.playPop();
                  setReminderEnabled(e.target.checked);
                }}
                style={{ width: 18, height: 18, accentColor: '#388E3C' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Bell size={14} /> Enable Push Reminder & Ringtone
              </span>
            </label>
          </div>

          {/* Calendar Sync Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border-subtle)' }}>
            {googleCalUrl && (
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                <span>Google Cal</span>
              </a>
            )}
            <button
              type="button"
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem' }}
              onClick={handleDownloadICS}
            >
              <Calendar size={13} />
              <span>Apple / .ics</span>
            </button>
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Checklist Steps ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
          </div>

          {subtasks.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: 8 }}>
              No action steps yet. Type below and tap + to add your first step!
            </p>
          ) : (
            subtasks.map((st) => (
              <div
                key={st.id}
                className={`checklist-item ${st.completed ? 'checked' : ''}`}
                onClick={() => handleToggleSubtask(st.id)}
              >
                <div className="checkbox-cozy">
                  {st.completed && <Check size={14} strokeWidth={3} />}
                </div>
                <span style={{ flex: 1, fontSize: '0.9rem' }}>{st.title}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubtask(st.id);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#9E9E9E', cursor: 'pointer' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}

          <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              className="input-bubble"
              style={{ padding: '8px 14px', fontSize: '0.88rem' }}
              placeholder="Add next action step..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
            />
            <button type="submit" className="btn-bubble btn-mint" style={{ padding: '8px 14px' }}>
              <Plus size={16} />
            </button>
          </form>
        </div>

        {/* Sticker Reward Selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Reward Sticker to Unlock
          </label>
          <select
            className="input-bubble"
            value={rewardSticker}
            onChange={(e) => setRewardSticker(e.target.value)}
            style={{ padding: '10px 14px', fontSize: '0.9rem' }}
          >
            {STICKER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Personal Reflection Notes (Background placeholder text only) */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Personal Reflection
          </label>
          <textarea
            className="input-bubble"
            rows={2}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="How did it feel? What did you learn?"
          />
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {status !== 'completed' && (
            <button
              type="button"
              className="btn-bubble btn-mint"
              style={{ flex: 1, padding: '12px 16px' }}
              onClick={handleMarkComplete}
            >
              <Sparkles size={18} />
              <span>Complete & Celebrate!</span>
            </button>
          )}

          <button
            type="button"
            className="btn-bubble btn-peach"
            style={{ flex: 1, padding: '12px 16px' }}
            onClick={handleSave}
          >
            <Check size={18} />
            <span>Save Changes</span>
          </button>

          <button
            type="button"
            className="btn-bubble btn-cream"
            style={{ padding: '12px 16px', color: '#C62828' }}
            onClick={() => {
              if (confirm('Delete this checkpoint?')) {
                soundEngine.playPop();
                onDeleteMilestone(milestone.id);
                onClose();
              }
            }}
            title="Delete Milestone"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
