import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

const ICONS = ['🌱', '🚀', '🎨', '🎒', '☕', '🎮', '📚', '🏆', '🧘', '💖', '🎸', '🏕️'];
const THEME_COLORS = ['#7BDCB5', '#FFB3BA', '#FFDFBA', '#BFFCC6', '#DED2F9', '#BEE1E6'];

export function NewJourneyModal({ onClose, onCreateJourney }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundEngine.playSuccess();

    // Clean journey with zero pre-made dummy text
    const newJourney = {
      id: 'journey-' + Date.now(),
      title: `${icon} ${title.trim()}`,
      description: description.trim(),
      icon,
      themeColor,
      createdAt: new Date().toISOString(),
      milestones: [],
    };

    onCreateJourney(newJourney);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>✨</span>
            <h2 style={{ fontSize: '1.25rem' }}>Create New Roadmap</h2>
          </div>
          <button className="btn-icon-bubble" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Icon Picker */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Choose Quest Icon
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => {
                    soundEngine.playPop();
                    setIcon(ic);
                  }}
                  className="btn-icon-bubble"
                  style={{
                    fontSize: 20,
                    background: icon === ic ? 'var(--pastel-peach)' : '#FFFFFF',
                    transform: icon === ic ? 'scale(1.1)' : 'none',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Title (Background placeholder text only, no pre-made text) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Roadmap Title
            </label>
            <input
              className="input-bubble"
              placeholder="e.g. Master French Speaking, Marathon Training..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description (Background placeholder text only, no pre-made text) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              What is your vision for this journey?
            </label>
            <textarea
              className="input-bubble"
              rows={2}
              placeholder="A few words about why this progression matters to you..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Color theme */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Pastel Badge Color
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {THEME_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => {
                    soundEngine.playPop();
                    setThemeColor(color);
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: color,
                    border: '2px solid var(--border-color)',
                    boxShadow: themeColor === color ? '0 0 0 3px var(--border-color)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-bubble btn-mint"
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          >
            <Check size={18} />
            <span>Plant New Journey</span>
          </button>
        </form>
      </div>
    </div>
  );
}
