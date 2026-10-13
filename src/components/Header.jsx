import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Volume2, VolumeX, Settings, Download, Flame } from 'lucide-react';
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
      <div className="header-main-row">
        <div className="logo-section">
          <div className="logo-icon-bubble">🌱</div>
          <div className="logo-text">
            <h1>BloomTrail</h1>
            <p className="logo-tagline">Cozy Progression & Milestones</p>
          </div>
        </div>

        {/* Quick controls on the right */}
        <div className="header-quick-controls">
          {/* Install PWA Button (if available) */}
          {installPrompt && !isInstalled && (
            <button 
              className="btn-bubble btn-mint btn-install-mini"
              onClick={handleInstallClick}
              title="Install app to your home screen or desktop!"
            >
              <Download size={14} />
              <span className="install-label">Install</span>
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

          {/* Settings Button (visible on desktop header; mobile has bottom nav) */}
          <button
            className="btn-icon-bubble desktop-only-btn"
            onClick={() => {
              soundEngine.playPop();
              onOpenSettings();
            }}
            title="Open Settings & Audio Chimes"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Badges Row (Streak + Online Status) */}
      <div className="header-badges-row">
        <div className="badge-pill badge-streak" title="Daily Check-in Streak!">
          <Flame size={15} fill="#FF8A00" color="#B23A00" />
          <span>{streakCount} Day Streak</span>
        </div>

        <div 
          className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}
          title={isOnline ? 'Connected & Ready to Sync' : 'Offline Mode - Saving locally!'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
}
