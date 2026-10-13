import React, { useState, useEffect } from 'react';
import { Sparkles, Wifi, WifiOff, Volume2, VolumeX, Settings, Download, Flame } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function Header({
  isOnline,
  streakCount,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for PWA installation prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    soundEngine.playPop();
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  return (
    <header className="header-container">
      <div className="logo-section">
        <div className="logo-icon-bubble">
          🌱
        </div>
        <div className="logo-text">
          <h1>BloomTrail</h1>
          <p className="logo-tagline">Cozy Progression & Milestones</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Streak Counter */}
        <div className="badge-pill badge-streak" title="Daily Check-in Streak!">
          <Flame size={16} fill="#FF8A00" color="#B23A00" />
          <span>{streakCount} Day Streak</span>
        </div>

        {/* Offline / Online Badge */}
        <div 
          className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}
          title={isOnline ? 'Connected & Ready to Sync' : 'Offline Mode - Saving locally!'}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Install PWA Button (if available) */}
        {installPrompt && !isInstalled && (
          <button 
            className="btn-bubble btn-mint"
            onClick={handleInstallClick}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Install app to your home screen or desktop!"
          >
            <Download size={15} />
            <span>Install App</span>
          </button>
        )}

        {/* Sound toggle */}
        <button
          className="btn-icon-bubble"
          onClick={() => {
            soundEngine.playPop();
            onToggleSound(!soundEnabled);
          }}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Settings Button */}
        <button
          className="btn-icon-bubble"
          onClick={() => {
            soundEngine.playPop();
            onOpenSettings();
          }}
          title="Open Settings & Audio Chimes"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
