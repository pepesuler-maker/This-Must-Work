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
    // extract symbol or match by name
    ALL_STICKERS.forEach((sticker) => {
      if (s.sticker.includes(sticker.symbol) || s.sticker.includes(sticker.name)) {
        unlockedMap.set(sticker.name, s);
      }
    });
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Stats Bar */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        <div 
          style={{
            background: '#FFFFFF',
            border: 'var(--border-thick)',
            borderRadius: 22,
            padding: '16px 20px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div 
            style={{ 
              width: 48, height: 48, borderRadius: 16, 
              background: '#FFE0B2', border: '2px solid var(--border-color)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            <Flame size={24} color="#E65100" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-bubble)' }}>
              {streakCount} Days
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Current Streak
            </div>
          </div>
        </div>

        <div 
          style={{
            background: '#FFFFFF',
            border: 'var(--border-thick)',
            borderRadius: 22,
            padding: '16px 20px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div 
            style={{ 
              width: 48, height: 48, borderRadius: 16, 
              background: '#C8E6C9', border: '2px solid var(--border-color)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            <CheckCircle size={24} color="#2E7D32" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-bubble)' }}>
              {stats.completedMilestones}/{stats.totalMilestones}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Milestones Conquered
            </div>
          </div>
        </div>

        <div 
          style={{
            background: '#FFFFFF',
            border: 'var(--border-thick)',
            borderRadius: 22,
            padding: '16px 20px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div 
            style={{ 
              width: 48, height: 48, borderRadius: 16, 
              background: '#E1BEE7', border: '2px solid var(--border-color)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            <Sparkles size={24} color="#6A1B9A" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-bubble)' }}>
              {stats.completionRate}%
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Journey Completion
            </div>
          </div>
        </div>
      </div>

      {/* Warm Encouragement Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #FFF0F3, #FFE8D6)',
          border: 'var(--border-thick)',
          borderRadius: 26,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <span style={{ fontSize: 36 }}>🏡</span>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>
            Your Cozy Trophy Scrapbook
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
            Every step you take, big or small, blooms into your personal story. Collect stickers by achieving checkpoints!
          </p>
        </div>
      </div>

      {/* Stickers Showcase Grid */}
      <div 
        style={{
          background: '#FFFFFF',
          border: 'var(--border-thick)',
          borderRadius: 32,
          padding: 24,
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={22} color="#E65100" />
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

                <strong style={{ fontSize: '0.95rem', marginBottom: 4 }}>
                  {sticker.name}
                </strong>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {sticker.desc}
                </p>

                {isUnlocked ? (
                  <div 
                    style={{ 
                      marginTop: 10, 
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
                      marginTop: 10, 
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
