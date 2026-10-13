import React from 'react';
import { Award, Flame, CheckCircle, Sparkles, Heart } from 'lucide-react';
import { storageService } from '../services/storageService';

const ALL_STICKERS = [
  { symbol: '🌱', name: 'Little Sprout', desc: 'Planted your initial seeds of progress.' },
  { symbol: '☕', name: 'Warm Mug', desc: 'Fueling your cozy focus sessions.' },
  { symbol: '🎒', name: 'Wanderer Backpack', desc: 'Embarking on meaningful journeys.' },
  { symbol: '⭐', name: 'Golden Star', desc: 'Achieved an inspiring major milestone.' },
  { symbol: '👑', name: 'Cozy Crown', desc: 'Mastery over your habits and crafts.' },
  { symbol: '🌸', name: 'Cherry Blossom', desc: 'Blossoming with mindful grace.' },
  { symbol: '🐾', name: 'Cat Paw', desc: 'Curious steps moving forward.' },
  { symbol: '🍵', name: 'Warm Matcha', desc: 'Peaceful balance in daily routines.' },
  { symbol: '🌙', name: 'Cozy Moon', desc: 'Restful evenings and quiet growth.' },
  { symbol: '🧁', name: 'Sweet Muffin', desc: 'Sweet treats for sweet achievements.' },
];

export function StickerAlbum({ journeys, streakCount }) {
  const stats = storageService.getStats(journeys);

  // Set of unlocked sticker names
  const unlockedMap = new Map();
  stats.earnedStickers.forEach((s) => {
    ALL_STICKERS.forEach((sticker) => {
      if (s.sticker.includes(sticker.symbol) || s.sticker.includes(sticker.name)) {
        unlockedMap.set(sticker.name, s);
      }
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview Stats Bar (Smooth Horizontal Scroll on Mobile) */}
      <div className="stats-overview-row">
        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: '#FFE0B2' }}>
            <Flame size={22} color="#E65100" />
          </div>
          <div className="stats-card-info">
            <div className="stats-value">{streakCount} Days</div>
            <div className="stats-label">Current Streak</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: '#C8E6C9' }}>
            <CheckCircle size={22} color="#2E7D32" />
          </div>
          <div className="stats-card-info">
            <div className="stats-value">{stats.completedMilestones}/{stats.totalMilestones}</div>
            <div className="stats-label">Milestones Conquered</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-icon" style={{ background: '#E1BEE7' }}>
            <Sparkles size={22} color="#6A1B9A" />
          </div>
          <div className="stats-card-info">
            <div className="stats-value">{stats.completionRate}%</div>
            <div className="stats-label">Journey Completion</div>
          </div>
        </div>
      </div>

      {/* Warm Encouragement Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #FFF0F3, #FFE8D6)',
          border: 'var(--border-thick)',
          borderRadius: 24,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <span style={{ fontSize: 32 }}>🏡</span>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>
            Your Cozy Trophy Scrapbook
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600 }}>
            Every step you take blooms into your personal story. Collect stickers by achieving checkpoints!
          </p>
        </div>
      </div>

      {/* Stickers Showcase Grid */}
      <div 
        style={{
          background: '#FFFFFF',
          border: 'var(--border-thick)',
          borderRadius: 28,
          padding: 20,
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="#E65100" />
            <span>Collectible Stickers ({unlockedMap.size}/{ALL_STICKERS.length})</span>
          </h3>
        </div>

        <div className="scrapbook-grid">
          {ALL_STICKERS.map((sticker) => {
            const unlockedData = unlockedMap.get(sticker.name);
            const isUnlocked = Boolean(unlockedData);

            return (
              <div
                key={sticker.name}
                className="sticker-tile"
                style={{
                  opacity: isUnlocked ? 1 : 0.65,
                  background: isUnlocked ? '#FFFDF9' : '#F5F5F5',
                  borderStyle: isUnlocked ? 'solid' : 'dashed',
                }}
              >
                <div 
                  className="sticker-symbol" 
                  style={{ 
                    filter: isUnlocked ? 'none' : 'grayscale(1)',
                    opacity: isUnlocked ? 1 : 0.4
                  }}
                >
                  {sticker.symbol}
                </div>

                <strong style={{ fontSize: '0.92rem', marginBottom: 4 }}>
                  {sticker.name}
                </strong>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {sticker.desc}
                </p>

                {isUnlocked ? (
                  <div 
                    style={{ 
                      marginTop: 8, 
                      padding: '3px 8px', 
                      background: '#D4EDDA', 
                      color: '#155724', 
                      borderRadius: 10, 
                      fontSize: '0.72rem', 
                      fontWeight: 800,
                      border: '1.5px solid #2E7D32' 
                    }}
                  >
                    ✨ Unlocked!
                  </div>
                ) : (
                  <div 
                    style={{ 
                      marginTop: 8, 
                      padding: '3px 8px', 
                      background: '#EEEEEE', 
                      color: '#757575', 
                      borderRadius: 10, 
                      fontSize: '0.72rem', 
                      fontWeight: 700 
                    }}
                  >
                    🔒 Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
