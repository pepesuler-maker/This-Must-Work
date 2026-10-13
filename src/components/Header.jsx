import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Volume2, VolumeX, Settings, Download, Flame, User } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function Header({
  isOnline,
  streakCount,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  activeAccount,
  onOpenAuthPrompt,
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
        {/* Left: Brand Logo Group */}
        <div className="logo-section">
          <div className="logo-icon-bubble">
            <span>🌱</span>
          </div>
          <div className="logo-text">
            <h1 className="logo-brand-title">BloomTrail</h1>
            <p className="logo-tagline">Cozy Progression & Milestones</p>
          </div>
        </div>

        {/* Center: Streak & Online Badges */}
        <div className="header-badges-group">
          <div className="badge-pill badge-streak" title="Daily Check-in Streak!">
            <Flame size={14} fill="#FF8A00" color="#B23A00" />
            <span>{streakCount} Day Streak</span>
          </div>

          <div 
            className={`badge-pill ${isOnline ? 'badge-online' : 'badge-offline'}`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            <div className={`status-indicator-dot ${isOnline ? 'online' : 'offline'}`} />
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="header-quick-controls">
          {/* Active Account Pill or Guest Sign In button */}
          {activeAccount ? (
            <button
              className="btn-bubble btn-cream btn-header-account-pill"
              onClick={() => {
                soundEngine.playPop();
                onOpenSettings();
              }}
              title={`Logged in as ${activeAccount.name} (${activeAccount.email}). Tap to manage settings & profile.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 800,
              }}
            >
              <span style={{ fontSize: 16 }}>{activeAccount.avatar || '🦊'}</span>
              <span className="account-pill-name">{activeAccount.name}</span>
            </button>
          ) : (
            onOpenAuthPrompt && (
              <button
                className="btn-bubble btn-mint btn-install-mini"
                onClick={() => {
                  soundEngine.playPop();
                  onOpenAuthPrompt();
                }}
                title="Create Account to save your progress"
              >
                <User size={13} />
                <span className="install-label">Create Account</span>
              </button>
            )
          )}

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
            className="btn-icon-bubble btn-header-ctrl"
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
            className="btn-icon-bubble btn-header-ctrl desktop-only-btn"
            onClick={() => {
              soundEngine.playPop();
              onOpenSettings();
            }}
            title="Open Settings & Profile"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
