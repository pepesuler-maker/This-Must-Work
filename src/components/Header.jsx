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
        {/* Clean Logo Section on the Left */}
        <div className="logo-section">
          <div className="logo-icon-bubble">🌱</div>
          <div className="logo-text">
            <h1>BloomTrail</h1>
            <p className="logo-tagline">Cozy Progression & Milestones</p>
          </div>
        </div>

        {/* Quick controls on the Right */}
        <div className="header-quick-controls">
          {installPrompt && !isInstalled && (
            <button 
              className="btn-bubble btn-mint btn-install-mini"
              onClick={handleInstallClick}
              title="Install app"
            >
              <Download size={13} />
              <span className="install-label">Install</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            className="btn-icon-bubble"
            onClick={() => {
              soundEngine.playPop();
              onToggleSound(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Settings Button (Desktop header) */}
          <button
            className="btn-icon-bubble desktop-only-btn"
            onClick={() => {
              soundEngine.playPop();
              onOpenSettings();
            }}
            title="Open Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Badges Row (Streak + Online Status) */}
      <div className="header-badges-row">
        <div className="badge-pill badge-streak" title="Daily Check-in Streak!">
          <Flame size={14} fill="#FF8A00" color="#B23A00" />
          <span>{streakCount} Day Streak</span>
        </div>

        <div 
          className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
}
