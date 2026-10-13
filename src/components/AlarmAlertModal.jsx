import React from 'react';
import { Bell, Sparkles, Check, ArrowRight } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function AlarmAlertModal({
  alertData,
  onDismiss,
  onOpenMilestone,
}) {
  if (!alertData) return null;

  const { milestone, journeyTitle } = alertData;

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
          maxWidth: 420, 
          textAlign: 'center', 
          background: 'linear-gradient(180deg, #FFF9E6 0%, #FFFFFF 100%)',
          border: '3px solid #E65100',
          boxShadow: '0 12px 0 #BF360C'
        }}
      >
        <div 
          style={{ 
            width: 72, 
            height: 72, 
            margin: '0 auto 16px', 
            borderRadius: '50%', 
            background: '#FFE082', 
            border: '3px solid #BF360C', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 36,
            animation: 'gentleBob 1s infinite alternate' 
          }}
        >
          🔔
        </div>

        <h2 style={{ fontSize: '1.4rem', color: '#BF360C', marginBottom: 6 }}>
          Time for Check-in!
        </h2>

        <p style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>
          {milestone.title}
        </p>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 20 }}>
          Roadmap: {journeyTitle}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-bubble btn-cream"
            style={{ flex: 1, padding: '10px 14px' }}
            onClick={handleDismiss}
          >
            <span>Dismiss</span>
          </button>

          <button
            className="btn-bubble btn-mint"
            style={{ flex: 1, padding: '10px 14px' }}
            onClick={handleView}
          >
            <span>View Checkpoint</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
