import React, { useState } from 'react';
import { 
  X, Lock, Unlock, KeyRound, Check, Edit3, ArrowLeft, Plus, Sparkles 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { storageService } from '../services/storageService';

const AVATARS = ['🦊', '🐼', '🐱', '🐻', '🐰', '🦁', '🐨', '🦄', '🌸', '🌱', '🚀', '⭐'];
const THEME_COLORS = ['#FF9AA2', '#B5EAEA', '#FFDAC1', '#E2F0CB', '#FFB7B2', '#DED2F9'];

export function AccountProfileModal({
  accounts,
  activeAccountId,
  onSelectAccount,
  onAccountCreated,
  onClose,
  initialMode = 'enter_pin', // 'enter_pin' | 'add_account' | 'edit_profile' | 'change_pin'
  targetAccountForPin = null,
}) {
  const [mode, setMode] = useState(initialMode);
  const [selectedAcc, setSelectedAcc] = useState(targetAccountForPin || null);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Add account states (clean placeholders, zero pre-made text)
  const [addName, setAddName] = useState('');
  const [addAvatar, setAddAvatar] = useState(AVATARS[0]);
  const [addPin, setAddPin] = useState('1234');
  const [addThemeColor, setAddThemeColor] = useState(THEME_COLORS[0]);

  // Edit profile states
  const [editName, setEditName] = useState(selectedAcc?.name || '');
  const [editAvatar, setEditAvatar] = useState(selectedAcc?.avatar || '🦊');
  const [editBio, setEditBio] = useState(selectedAcc?.bio || '');

  // Change PIN states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

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

  // Handle creating a brand new account
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!addName.trim()) return;

    soundEngine.playSuccess();
    const newAcc = storageService.addAccount({
      name: addName.trim(),
      avatar: addAvatar,
      pin: addPin || '1234',
      themeColor: addThemeColor,
    });

    if (onAccountCreated) {
      onAccountCreated(newAcc);
    } else {
      onSelectAccount(newAcc.id);
    }
    onClose();
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
    onClose();
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
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content netflix-account-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: '24px' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24 }}>
              {mode === 'add_account' ? '✨' : '🔒'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                {mode === 'enter_pin' && `Unlock: ${selectedAcc?.name}`}
                {mode === 'add_account' && 'Create New Account'}
                {mode === 'edit_profile' && `Edit Profile: ${selectedAcc?.name}`}
                {mode === 'change_pin' && `Change PIN: ${selectedAcc?.name}`}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {mode === 'add_account' ? 'Create a profile with custom PIN' : 'PIN Password Security'}
              </p>
            </div>
          </div>

          <button className="btn-icon-bubble" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* VIEW 1: ENTER PIN TO UNLOCK                                  */}
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
              Enter 4-digit PIN to switch to this account
            </p>

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

            {/* PIN Dots */}
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

            {/* Keypad */}
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

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={onClose}
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
        {/* VIEW 2: ADD ACCOUNT MODAL                                    */}
        {/* ----------------------------------------------------------- */}
        {mode === 'add_account' && (
          <form onSubmit={handleCreateAccount}>
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
                      background: addAvatar === av ? 'var(--pastel-peach)' : '#FFFFFF',
                      transform: addAvatar === av ? 'scale(1.15)' : 'none',
                    }}
                    onClick={() => {
                      soundEngine.playPop();
                      setAddAvatar(av);
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Name (Clean placeholder background text) */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Account Name
              </label>
              <input
                type="text"
                className="input-bubble"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Alex, Sam, Explorer..."
                autoFocus
                required
              />
            </div>

            {/* PIN (Password) */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Account Password / PIN (4 digits)
              </label>
              <input
                type="password"
                className="input-bubble"
                maxLength={6}
                value={addPin}
                onChange={(e) => setAddPin(e.target.value)}
                placeholder="Set 4-digit PIN (e.g. 1234)"
                required
              />
            </div>

            {/* Theme Color */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Badge Color
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {THEME_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      soundEngine.playPop();
                      setAddThemeColor(col);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: col,
                      border: '2px solid var(--border-color)',
                      boxShadow: addThemeColor === col ? '0 0 0 3px var(--border-color)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-bubble btn-mint"
                style={{ flex: 2, padding: '10px' }}
              >
                <Sparkles size={16} />
                <span>Create Account</span>
              </button>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 3: EDIT PROFILE                                         */}
        {/* ----------------------------------------------------------- */}
        {mode === 'edit_profile' && selectedAcc && (
          <form onSubmit={handleSaveProfile}>
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

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Bio / Tagline
              </label>
              <input
                type="text"
                className="input-bubble"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="e.g. Marathon runner & daily coder..."
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => setMode('change_pin')}
              >
                <KeyRound size={16} />
                <span>Change PIN Password</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={onClose}
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
        {/* VIEW 4: CHANGE PIN                                           */}
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
                onClick={onClose}
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
