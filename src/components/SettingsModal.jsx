import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Volume2, Play, Square, Download, Upload, 
  Smartphone, Monitor, Sparkles, Check, RefreshCw, 
  Music, Video, Radio, FileAudio, ExternalLink
} from 'lucide-react';
import { soundEngine, extractYouTubeId } from '../services/soundEngine';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storageService';
import { saveCustomAudioFile, getCustomAudioFile } from '../services/audioStorage';

const SYNTH_RINGTONES = [
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
  // Ringtone config: { type: 'synth'|'youtube'|'custom_file'|'audio_url', synthKey, youtubeUrl, customFileName, audioUrl }
  const [ringtoneType, setRingtoneType] = useState(settings.ringtoneConfig?.type || 'synth');
  const [synthKey, setSynthKey] = useState(settings.ringtoneConfig?.synthKey || settings.ringtone || 'morning_bell');
  const [youtubeUrl, setYoutubeUrl] = useState(settings.ringtoneConfig?.youtubeUrl || 'https://www.youtube.com/watch?v=jfKfPfyJRdk'); // lofi hip hop sample
  const [customFileName, setCustomFileName] = useState(settings.ringtoneConfig?.customFileName || '');
  const [audioUrl, setAudioUrl] = useState(settings.ringtoneConfig?.audioUrl || '');
  
  const [volume, setVolume] = useState(settings.volume ?? 0.8);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects ?? true);
  const [syncCode, setSyncCode] = useState(settings.syncCode || 'BLOOM-7788');
  const [notifStatus, setNotifStatus] = useState(notificationService.getPermissionStatus());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Check if custom audio already exists in IndexedDB
  useEffect(() => {
    getCustomAudioFile('default_custom_audio').then((res) => {
      if (res && res.name) {
        setCustomFileName(res.name);
      }
    });
  }, []);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAlarmLoop();
    };
  }, []);

  // Handle custom audio file upload
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEngine.playPop();
    await saveCustomAudioFile('default_custom_audio', file, file.name);
    setCustomFileName(file.name);
    setRingtoneType('custom_file');
    alert(`"${file.name}" saved as your custom ringtone! Works 100% offline.`);
  };

  // Preview current ringtone
  const handleTogglePreview = () => {
    if (isPlayingPreview) {
      soundEngine.stopAlarmLoop();
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);
    if (ringtoneType === 'synth') {
      soundEngine.playRingtone(synthKey);
    } else if (ringtoneType === 'custom_file') {
      soundEngine.playCustomAudioFile();
    } else if (ringtoneType === 'audio_url') {
      soundEngine.playAudioUrl(audioUrl);
    }
    // YouTube preview handles itself via iframe below
  };

  // Test full alarm with alert modal
  const handleTestAlarm = () => {
    soundEngine.playPop();
    notificationService.triggerReminder({
      milestone: {
        id: 'test-ms',
        title: 'Alarm Ringtone Test 🎶',
      },
      journeyTitle: 'BloomTrail Audio',
      ringtoneConfig: {
        type: ringtoneType,
        synthKey,
        youtubeUrl,
        customFileName,
        audioUrl,
      },
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
    const ringtoneConfig = {
      type: ringtoneType,
      synthKey,
      youtubeUrl,
      customFileName,
      audioUrl,
    };

    const updated = {
      ...settings,
      ringtone: synthKey,
      ringtoneConfig,
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

  const parsedYtId = extractYouTubeId(youtubeUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎶</span>
            <h2 style={{ fontSize: '1.25rem' }}>Alarm & Audio Settings</h2>
          </div>
          <button className="btn-icon-bubble" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 1. CUSTOM RINGTONE SOURCE SELECTOR */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
            🎵 Select Alarm Ringtone Source
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { type: 'synth', label: '🔔 Built-in Chimes', sub: '100% Offline synth' },
              { type: 'youtube', label: '📺 YouTube Song', sub: 'Free video / music' },
              { type: 'custom_file', label: '📁 Upload File (MP3)', sub: 'From phone/PC offline' },
              { type: 'audio_url', label: '🌐 Direct Audio URL', sub: 'Streaming link' },
            ].map((tab) => (
              <button
                key={tab.type}
                type="button"
                className={`btn-bubble ${ringtoneType === tab.type ? 'btn-peach' : 'btn-cream'}`}
                style={{ padding: '8px 10px', fontSize: '0.82rem', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}
                onClick={() => {
                  soundEngine.playPop();
                  soundEngine.stopAlarmLoop();
                  setIsPlayingPreview(false);
                  setRingtoneType(tab.type);
                }}
              >
                <strong style={{ fontSize: '0.85rem' }}>{tab.label}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tab.sub}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT A: SYNTH CHIMES */}
          {ringtoneType === 'synth' && (
            <div className="ringtone-grid">
              {SYNTH_RINGTONES.map((rt) => {
                const isSelected = synthKey === rt.id;
                return (
                  <div
                    key={rt.id}
                    className={`ringtone-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSynthKey(rt.id);
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
                      style={{ width: 32, height: 32 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playRingtone(rt.id);
                      }}
                      title="Preview sound"
                    >
                      <Play size={12} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB CONTENT B: YOUTUBE MUSIC */}
          {ringtoneType === 'youtube' && (
            <div style={{ background: '#FFF8F2', padding: 14, borderRadius: 18, border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Video size={16} color="#E65100" />
                <strong style={{ fontSize: '0.88rem' }}>Paste Any YouTube Music Link</strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                100% Free! You can use any song, soundtrack, or lofi beat from YouTube as your alarm ringtone.
              </p>
              <input
                className="input-bubble"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: 10 }}
              />

              {parsedYtId ? (
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid var(--border-color)', marginTop: 8 }}>
                  <iframe
                    width="100%"
                    height="160"
                    src={`https://www.youtube-nocookie.com/embed/${parsedYtId}?enablejsapi=1`}
                    title="YouTube Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: '#C62828', fontWeight: 700 }}>
                  Please paste a valid YouTube video URL.
                </p>
              )}
            </div>
          )}

          {/* TAB CONTENT C: CUSTOM AUDIO FILE (OFFLINE) */}
          {ringtoneType === 'custom_file' && (
            <div style={{ background: '#FFF8F2', padding: 14, borderRadius: 18, border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <FileAudio size={16} color="#E65100" />
                <strong style={{ fontSize: '0.88rem' }}>Upload Audio File (MP3, WAV, M4A)</strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Saved locally inside your browser (IndexedDB). Plays as your alarm even completely offline!
              </p>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn-bubble btn-mint" style={{ padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>Choose Sound File</span>
                  <input type="file" accept="audio/*" onChange={handleAudioFileUpload} style={{ display: 'none' }} />
                </label>

                {customFileName && (
                  <button
                    type="button"
                    className="btn-bubble btn-cream"
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                    onClick={handleTogglePreview}
                  >
                    {isPlayingPreview ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                    <span>{isPlayingPreview ? 'Stop' : 'Play Song'}</span>
                  </button>
                )}
              </div>

              {customFileName && (
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2E7D32', marginTop: 8 }}>
                  🎵 Current file: {customFileName}
                </p>
              )}
            </div>
          )}

          {/* TAB CONTENT D: DIRECT AUDIO URL */}
          {ringtoneType === 'audio_url' && (
            <div style={{ background: '#FFF8F2', padding: 14, borderRadius: 18, border: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Radio size={16} color="#E65100" />
                <strong style={{ fontSize: '0.88rem' }}>Direct Audio Stream / MP3 URL</strong>
              </div>
              <input
                className="input-bubble"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://example.com/audio/alarm.mp3"
                style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: 10 }}
              />
              {audioUrl && (
                <button
                  type="button"
                  className="btn-bubble btn-cream"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  onClick={handleTogglePreview}
                >
                  {isPlayingPreview ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  <span>{isPlayingPreview ? 'Stop Preview' : 'Test Audio URL'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. NOTIFICATIONS & ALARM TEST */}
        <div style={{ background: '#FFFDF9', padding: 16, borderRadius: 22, border: '2px solid var(--border-color)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#E65100" />
              <strong style={{ fontSize: '0.92rem' }}>Alarm Reminders & Web Push</strong>
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

          <div style={{ display: 'flex', gap: 8 }}>
            {notifStatus !== 'granted' && (
              <button
                type="button"
                className="btn-bubble btn-mint"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                onClick={handleRequestNotif}
              >
                <Bell size={14} />
                <span>Allow Push Notifications</span>
              </button>
            )}

            <button
              type="button"
              className="btn-bubble btn-peach"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
              onClick={handleTestAlarm}
            >
              <Play size={14} />
              <span>Test Alarm Pop-up & Ringtone</span>
            </button>
          </div>
        </div>

        {/* 3. SOUND VOLUME & EFFECTS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontWeight: 800, fontSize: '0.88rem' }}>
              🔊 Volume Control
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
            style={{ width: '100%', accentColor: 'var(--pastel-coral)', marginBottom: 10 }}
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
            <span>Enable button pops and celebration sound effects</span>
          </label>
        </div>

        {/* 4. BACKUP & SYNC */}
        <div style={{ background: '#F5F9FA', padding: 14, borderRadius: 20, border: '2px solid var(--border-color)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <RefreshCw size={16} color="#00838F" />
            <strong style={{ fontSize: '0.88rem' }}>Offline Backup & Device Sync</strong>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem' }}
              onClick={() => {
                soundEngine.playPop();
                storageService.exportJSONBackup();
              }}
            >
              <Download size={13} />
              <span>Export Backup (.json)</span>
            </button>

            <label
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              <Upload size={13} />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Sync Code:
            </label>
            <input
              className="input-bubble"
              style={{ padding: '6px 10px', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase' }}
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
            />
          </div>

          {syncSuccessMsg && (
            <p style={{ marginTop: 6, color: '#2E7D32', fontSize: '0.78rem', fontWeight: 800 }}>
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
