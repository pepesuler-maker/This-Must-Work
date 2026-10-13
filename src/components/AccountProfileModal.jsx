import React, { useState } from 'react';
import { 
  X, Lock, Unlock, KeyRound, Check, Edit3, ArrowLeft 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { storageService } from '../services/storageService';

const AVATARS = ['🦊', '🐼', '🐱', '🐻', '🐰', '🦁', '🐨', '🦄', '🐧', '🐶', '🐯', '🐙'];

export function AccountProfileModal({
  accounts,
  activeAccountId,
  onSelectAccount,
  onClose,
  initialMode = 'select', // 'select' | 'enter_pin' | 'edit_profile'
  targetAccountForPin = null,
}) {
  const [mode, setMode] = useState(initialMode); // 'select' | 'enter_pin' | 'edit_profile' | 'change_pin'
  const [selectedAcc, setSelectedAcc] = useState(targetAccountForPin || null);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Edit profile states
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('🦊');
  const [editBio, setEditBio] = useState('');

  // Change PIN states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  // Handle selecting an account tile
  const handleAccountClick = (acc) => {
    soundEngine.playPop();
    setSelectedAcc(acc);
    setPinInput('');
    setErrorMessage('');
    setMode('enter_pin');
  };

  // Handle numeric keypad input
  const handleKeypadPress = (val) => {
    soundEngine.playPop();
    if (val === 'backspace') {
      setPinInput((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPinInput('');
    } else {
      if (pinInput.length < 6) {
        const next = pinInput + val;
        setPinInput(next);
        if (next.length === 4) {
          // Auto check on 4 digits
          attemptUnlock(next, selectedAcc);
        }
      }
    }
  };

  // Attempt unlock with entered PIN
  const attemptUnlock = (enteredPin = pinInput, account = selectedAcc) => {
    if (!account) return;

    if (storageService.verifyAccountPin(account.id, enteredPin)) {
      soundEngine.playSuccess();
      onSelectAccount(account.id);
      onClose();
    } else {
      soundEngine.playPop();
      setErrorMessage('Incorrect PIN. Please try again! (Default is 1234)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPinInput('');
    }
  };

  // Open profile editor
  const handleOpenEdit = (acc, e) => {
    e.stopPropagation();
    soundEngine.playPop();
    setSelectedAcc(acc);
    setEditName(acc.name);
    setEditAvatar(acc.avatar);
    setEditBio(acc.bio || '');
    setMode('edit_profile');
  };

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    soundEngine.playSuccess();
    storageService.updateAccountProfile(selectedAcc.id, {
      name: editName.trim(),
      avatar: editAvatar,
      bio: editBio.trim(),
    });
    setMode('select');
  };

  // Open change PIN
  const handleOpenChangePin = (acc) => {
    soundEngine.playPop();
    setSelectedAcc(acc);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setErrorMessage('');
    setPinSuccessMsg('');
    setMode('change_pin');
  };

  // Save new PIN
  const handleSaveNewPin = (e) => {
    e.preventDefault();
    if (!storageService.verifyAccountPin(selectedAcc.id, oldPin)) {
      setErrorMessage('Current PIN is incorrect!');
      return;
    }
    if (newPin.length < 4) {
      setErrorMessage('New PIN must be at least 4 digits!');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage('New PIN and confirmation do not match!');
      return;
    }

    storageService.updateAccountPin(selectedAcc.id, newPin);
    soundEngine.playSuccess();
    setPinSuccessMsg('PIN successfully updated! 🎉');
    setTimeout(() => {
      setMode('select');
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content netflix-account-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: mode === 'select' ? 640 : 440, padding: '24px' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {mode !== 'select' && (
              <button 
                type="button" 
                className="btn-icon-bubble"
                onClick={() => {
                  soundEngine.playPop();
                  setMode('select');
                  setErrorMessage('');
                }}
                style={{ width: 34, height: 34 }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div style={{ fontSize: 24 }}>📺</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                {mode === 'select' && "Who's Blooming?"}
                {mode === 'enter_pin' && `Enter PIN for ${selectedAcc?.name}`}
                {mode === 'edit_profile' && `Edit Profile: ${selectedAcc?.name}`}
                {mode === 'change_pin' && `Change PIN: ${selectedAcc?.name}`}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {mode === 'select' ? 'Select an account to access isolated quests & stamps' : 'Netflix-Style PIN Protection'}
              </p>
            </div>
          </div>

          <button className="btn-icon-bubble" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* VIEW 1: Profile Chooser (4 Accounts)                         */}
        {/* ----------------------------------------------------------- */}
        {mode === 'select' && (
          <div>
            <div className="netflix-profiles-grid">
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccountId;

                return (
                  <div
                    key={acc.id}
                    className={`netflix-profile-card ${isActive ? 'active-profile' : ''}`}
                    onClick={() => handleAccountClick(acc)}
                    style={{
                      background: '#FFFFFF',
                      border: `2.5px solid ${isActive ? 'var(--pastel-coral)' : 'var(--border-color)'}`,
                      borderRadius: 22,
                      padding: '18px 12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isActive ? '0 5px 0 var(--pastel-coral)' : '0 4px 0 var(--border-color)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {/* Active badge */}
                    {isActive && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'var(--pastel-coral)',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 8,
                        }}
                      >
                        CURRENT
                      </span>
                    )}

                    {/* Lock Indicator */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#FFF3E0',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="PIN Password Protected"
                    >
                      <Lock size={11} color="#E65100" />
                    </div>

                    {/* Avatar Icon */}
                    <div 
                      className="netflix-avatar-circle"
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 24,
                        background: acc.themeColor || 'var(--pastel-peach)',
                        border: '2.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 34,
                        margin: '6px auto 10px',
                        boxShadow: '0 3px 0 var(--border-color)',
                      }}
                    >
                      {acc.avatar}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>{acc.name}</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, minHeight: 18 }}>
                      {acc.bio || 'Cozy Explorer'}
                    </p>

                    {/* Quick Edit button */}
                    <button
                      type="button"
                      className="btn-bubble btn-cream"
                      style={{ padding: '4px 10px', fontSize: '0.72rem', marginTop: 10, width: '100%' }}
                      onClick={(e) => handleOpenEdit(acc, e)}
                    >
                      <Edit3 size={11} />
                      <span>Edit / PIN</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div 
              style={{ 
                marginTop: 18, 
                padding: '10px 14px', 
                background: '#FFF9F2', 
                borderRadius: 14, 
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              🔒 All 4 profiles are isolated. Default PIN for each account is <strong>1234</strong>.
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 2: PIN Password Entry Pad (Netflix Style)               */}
        {/* ----------------------------------------------------------- */}
        {mode === 'enter_pin' && selectedAcc && (
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                background: selectedAcc.themeColor || 'var(--pastel-peach)',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                margin: '0 auto 10px',
                boxShadow: '0 3px 0 var(--border-color)',
              }}
            >
              {selectedAcc.avatar}
            </div>

            <h3 style={{ fontSize: '1.15rem' }}>{selectedAcc.name}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 14 }}>
              Enter 4-digit PIN to unlock
            </p>

            {/* Error Message with Shake */}
            {errorMessage && (
              <div 
                className={isShaking ? 'shake-animation' : ''}
                style={{
                  background: '#FFEBEE',
                  color: '#C62828',
                  border: '1.5px solid #EF5350',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* PIN Dots Display */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 12, 
                margin: '12px 0 18px',
              }}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: isFilled ? 'var(--pastel-coral)' : '#FFFFFF',
                      border: '2px solid var(--border-color)',
                      boxShadow: '0 2px 0 var(--border-color)',
                      transform: isFilled ? 'scale(1.15)' : 'none',
                      transition: 'all 0.1s ease',
                    }}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad Buttons */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                maxWidth: 260,
                margin: '0 auto 16px',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="btn-bubble btn-cream pin-keypad-btn"
                  style={{ padding: '12px 0', fontSize: '1.25rem', fontWeight: 800 }}
                  onClick={() => handleKeypadPress(String(num))}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="btn-bubble btn-cream pin-keypad-btn"
                style={{ padding: '12px 0', fontSize: '0.82rem', fontWeight: 700 }}
                onClick={() => handleKeypadPress('clear')}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn-bubble btn-cream pin-keypad-btn"
                style={{ padding: '12px 0', fontSize: '1.25rem', fontWeight: 800 }}
                onClick={() => handleKeypadPress('0')}
              >
                0
              </button>
              <button
                type="button"
                className="btn-bubble btn-cream pin-keypad-btn"
                style={{ padding: '12px 0', fontSize: '0.82rem', fontWeight: 700 }}
                onClick={() => handleKeypadPress('backspace')}
              >
                ⌫
              </button>
            </div>

            {/* Unlock Button */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setMode('select')}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-bubble btn-mint"
                style={{ flex: 2, padding: '10px' }}
                onClick={() => attemptUnlock()}
              >
                <Unlock size={16} />
                <span>Unlock Profile</span>
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 700 }}>
              💡 Default PIN: <strong>1234</strong>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 3: Edit Profile                                         */}
        {/* ----------------------------------------------------------- */}
        {mode === 'edit_profile' && selectedAcc && (
          <form onSubmit={handleSaveProfile}>
            {/* Avatar Picker */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Choose Profile Avatar
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    className="btn-icon-bubble"
                    style={{
                      fontSize: 22,
                      background: editAvatar === av ? 'var(--pastel-peach)' : '#FFFFFF',
                      transform: editAvatar === av ? 'scale(1.15)' : 'none',
                    }}
                    onClick={() => {
                      soundEngine.playPop();
                      setEditAvatar(av);
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input (Background placeholder, no hardcoded garbage) */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Account Name
              </label>
              <input
                type="text"
                className="input-bubble"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter profile name..."
                required
              />
            </div>

            {/* Bio Input */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Profile Tagline / Bio
              </label>
              <input
                type="text"
                className="input-bubble"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="e.g. Marathon runner & daily coder..."
              />
            </div>

            {/* Change PIN shortcut */}
            <div style={{ marginBottom: 20 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => handleOpenChangePin(selectedAcc)}
              >
                <KeyRound size={16} />
                <span>Change Account Password / PIN</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setMode('select')}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-bubble btn-mint"
                style={{ flex: 2, padding: '10px' }}
              >
                <Check size={16} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 4: Change PIN                                           */}
        {/* ----------------------------------------------------------- */}
        {mode === 'change_pin' && selectedAcc && (
          <form onSubmit={handleSaveNewPin}>
            {errorMessage && (
              <div 
                style={{
                  background: '#FFEBEE',
                  color: '#C62828',
                  border: '1.5px solid #EF5350',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                {errorMessage}
              </div>
            )}

            {pinSuccessMsg && (
              <div 
                style={{
                  background: '#E8F5E9',
                  color: '#2E7D32',
                  border: '1.5px solid #81C784',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                {pinSuccessMsg}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Current PIN (Default: 1234)
              </label>
              <input
                type="password"
                className="input-bubble"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Enter current PIN..."
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                New PIN (At least 4 digits)
              </label>
              <input
                type="password"
                className="input-bubble"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 4-digit PIN..."
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Confirm New PIN
              </label>
              <input
                type="password"
                className="input-bubble"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm new PIN..."
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setMode('select')}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-bubble btn-mint"
                style={{ flex: 2, padding: '10px' }}
              >
                <Check size={16} />
                <span>Update PIN</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
