import React, { useState } from 'react';
import { 
  X, Bell, Volume2, Play, Download, Upload, 
  Smartphone, Monitor, Sparkles, Check, RefreshCw 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';

const RINGTONES = [
  { id: 'morning_bell', name: '🔔 Morning Bell', desc: 'Warm tubular bell chimes' },
  { id: 'cozy_marimba', name: '🪵 Cozy Marimba', desc: 'Playful wooden xylophone melody' },
  { id: 'bubble_harp', name: '🫧 Bubble Harp', desc: 'Gentle harp pluck arpeggios' },
  { id: 'stardust_fanfare', name: '✨ Stardust Fanfare', desc: 'Cheerful celebratory fanfare' },
];

export function SettingsModal({
  settings,
  onUpdateSettings,
  onClose,
  onDataImported,
}) {
  const [selectedRingtone, setSelectedRingtone] = useState(settings.ringtone || 'morning_bell');
  const [volume, setVolume] = useState(settings.volume ?? 0.8);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects ?? true);
  const [syncCode, setSyncCode] = useState(settings.syncCode || 'BLOOM-7788');
  const [notifStatus, setNotifStatus] = useState(notificationService.getPermissionStatus());
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Handle ringtone preview
  const handlePreviewRingtone = (ringtoneId, e) => {
    e.stopPropagation();
    soundEngine.playRingtone(ringtoneId);
  };

  // Test full alarm notification
  const handleTestAlarm = () => {
    soundEngine.playPop();
    notificationService.triggerReminder({
      milestone: {
        id: 'test-ms',
        title: 'Cozy Test Reminder ✨',
      },
      journeyTitle: 'BloomTrail Test',
      ringtone: selectedRingtone,
    });
  };

  // Request notifications permission
  const handleRequestNotif = async () => {
    soundEngine.playPop();
    const res = await notificationService.requestPermission();
    setNotifStatus(res);
  };

  // Save settings
  const handleSaveSettings = () => {
    soundEngine.playPop();
    const updated = {
      ...settings,
      ringtone: selectedRingtone,
      volume,
      soundEffects,
      syncCode,
    };
    soundEngine.setVolume(volume);
    soundEngine.toggleSound(soundEffects);
    onUpdateSettings(updated);
    onClose();
  };

  // File import handler
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const ok = storageService.importJSONBackup(content);
        if (ok) {
          soundEngine.playSuccess();
          setSyncSuccessMsg('Data restored successfully!');
          onDataImported();
        } else {
          alert('Could not parse backup file. Please ensure it is valid JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚙️</span>
            <h2 style={{ fontSize: '1.25rem' }}>Settings & Reminders</h2>
          </div>
          <button className="btn-icon-bubble" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 1. RINGTONE AUDIO SELECTION */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
            🎶 Choose Your Reminder Ringtone
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            Synthesized live with Web Audio API. Always works 100% offline with zero audio delay.
          </p>

          <div className="ringtone-grid">
            {RINGTONES.map((rt) => {
              const isSelected = selectedRingtone === rt.id;
              return (
                <div
                  key={rt.id}
                  className={`ringtone-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRingtone(rt.id);
                    soundEngine.playRingtone(rt.id);
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', display: 'block' }}>{rt.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rt.desc}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-icon-bubble"
                    style={{ width: 34, height: 34 }}
                    onClick={(e) => handlePreviewRingtone(rt.id, e)}
                    title="Preview sound"
                  >
                    <Play size={13} fill="currentColor" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. NOTIFICATIONS & ALARM TEST */}
        <div style={{ background: '#FFF8F2', padding: 16, borderRadius: 22, border: '2px solid var(--border-color)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#E65100" />
              <strong style={{ fontSize: '0.92rem' }}>Web Push & Reminder Notifications</strong>
            </div>
            <span 
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 8,
                background: notifStatus === 'granted' ? '#D4EDDA' : '#FFF3CD',
                color: notifStatus === 'granted' ? '#155724' : '#856404',
                border: '1.5px solid var(--border-color)'
              }}
            >
              {notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Blocked' : 'Action Needed'}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            Receive native alerts and custom chime ringtones for your scheduled checkpoints on desktop and mobile.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            {notifStatus !== 'granted' && (
              <button
                type="button"
                className="btn-bubble btn-mint"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                onClick={handleRequestNotif}
              >
                <Bell size={14} />
                <span>Allow Notifications</span>
              </button>
            )}

            <button
              type="button"
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
              onClick={handleTestAlarm}
            >
              <Play size={14} />
              <span>Test Alarm & Ringtone</span>
            </button>
          </div>
        </div>

        {/* 3. SOUND VOLUME & EFFECTS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 800, fontSize: '0.9rem' }}>
              🔊 Sound Effects & Volume
            </label>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              soundEngine.setVolume(v);
            }}
            style={{ width: '100%', accentColor: 'var(--pastel-coral)', marginBottom: 12 }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => {
                soundEngine.playPop();
                setSoundEffects(e.target.checked);
                soundEngine.toggleSound(e.target.checked);
              }}
              style={{ width: 18, height: 18, accentColor: '#388E3C' }}
            />
            <span>Enable cozy button pops and celebration fanfares</span>
          </label>
        </div>

        {/* 4. CROSS-DEVICE SYNC & DATA BACKUP */}
        <div style={{ background: '#F5F9FA', padding: 16, borderRadius: 22, border: '2px solid var(--border-color)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <RefreshCw size={18} color="#00838F" />
            <strong style={{ fontSize: '0.92rem' }}>Offline-First & Device Sync</strong>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            Your data is stored locally on this device so it works 100% offline. Transfer or sync between desktop and phone using your sync code or JSON backup.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              type="button"
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
              onClick={() => {
                soundEngine.playPop();
                storageService.exportJSONBackup();
              }}
            >
              <Download size={14} />
              <span>Export Backup (.json)</span>
            </button>

            <label
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              <Upload size={14} />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Sync Code Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Your Sync Code:
            </label>
            <input
              className="input-bubble"
              style={{ padding: '6px 12px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
            />
          </div>

          {syncSuccessMsg && (
            <p style={{ marginTop: 8, color: '#2E7D32', fontSize: '0.8rem', fontWeight: 800 }}>
              ✨ {syncSuccessMsg}
            </p>
          )}
        </div>

        {/* Save Settings */}
        <button
          type="button"
          className="btn-bubble btn-peach"
          style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
          onClick={handleSaveSettings}
        >
          <Check size={18} />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}
