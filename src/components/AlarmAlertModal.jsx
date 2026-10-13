import React from 'react';
import { Bell, Sparkles, Check, ArrowRight, Music, Volume2, Video } from 'lucide-react';
import { soundEngine, extractYouTubeId } from '../services/soundEngine';

export function AlarmAlertModal({
  alertData,
  onDismiss,
  onOpenMilestone,
}) {
  if (!alertData) return null;

  const { milestone, journeyTitle, ringtoneConfig } = alertData;
  const config = ringtoneConfig || { type: 'synth', key: 'morning_bell' };
  const ytId = config.type === 'youtube' ? extractYouTubeId(config.youtubeUrl) : null;

  const handleDismiss = () => {
    soundEngine.stopAlarmLoop();
    soundEngine.playPop();
    onDismiss();
  };

  const handleView = () => {
    soundEngine.stopAlarmLoop();
    soundEngine.playPop();
    onOpenMilestone(milestone);
    onDismiss();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div 
        className="modal-content"
        style={{ 
          maxWidth: 460, 
          textAlign: 'center', 
          background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)',
          border: '3px solid #E65100',
          boxShadow: '0 12px 0 #BF360C'
        }}
      >
        {/* Animated Bell / Music Icon */}
        <div 
          style={{ 
            width: 72, 
            height: 72, 
            margin: '0 auto 12px', 
            borderRadius: '50%', 
            background: '#FFE082', 
            border: '3px solid #BF360C', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 34,
            animation: 'gentleBob 0.8s infinite alternate' 
          }}
        >
          {config.type === 'youtube' ? '📺' : config.type === 'custom_file' ? '🎵' : '🔔'}
        </div>

        <h2 style={{ fontSize: '1.4rem', color: '#BF360C', marginBottom: 4 }}>
          Milestone Check-in Time!
        </h2>

        <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 2 }}>
          {milestone.title}
        </p>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 16 }}>
          Roadmap: {journeyTitle}
        </p>

        {/* YOUTUBE EMBED PLAYER (if YouTube ringtone is active) */}
        {config.type === 'youtube' && ytId && (
          <div style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden', border: '2px solid var(--border-color)', boxShadow: '0 4px 0 var(--border-color)' }}>
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&playsinline=1`}
              title="YouTube Alarm Ringtone"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* CUSTOM AUDIO FILE DISPLAY */}
        {config.type === 'custom_file' && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              padding: '10px 14px', 
              background: '#FFF3E0', 
              borderRadius: 14, 
              border: '1.5px solid var(--border-color)',
              marginBottom: 16,
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#E65100'
            }}
          >
            <Music size={18} />
            <span>Playing Your Custom Ringtone Song</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-bubble btn-cream"
            style={{ flex: 1, padding: '12px 16px' }}
            onClick={handleDismiss}
          >
            <span>Stop & Dismiss</span>
          </button>

          <button
            className="btn-bubble btn-mint"
            style={{ flex: 1, padding: '12px 16px' }}
            onClick={handleView}
          >
            <span>View Milestone</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
