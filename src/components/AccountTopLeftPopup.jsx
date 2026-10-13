import React from 'react';
import { 
  Plus, Lock, KeyRound, Edit3, LogOut, ChevronDown, Check, User 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function AccountTopLeftPopup({
  activeAccount,
  accounts = [],
  isOpen,
  onToggle,
  onClose,
  onSelectAccountPrompt,
  onOpenAddAccount,
  onOpenEditProfile,
  onLockSession,
}) {
  const otherAccounts = accounts.filter((a) => a.id !== activeAccount?.id);

  return (
    <div className="top-left-account-wrapper">
      {/* Top Left Trigger Button */}
      <button
        className="btn-bubble btn-top-left-account"
        onClick={() => {
          soundEngine.playPop();
          onToggle();
        }}
        title="Account Profile & Switcher (Top Left)"
      >
        <span className="account-avatar-sm">{activeAccount?.avatar || '🦊'}</span>
        <span className="account-name-sm">{activeAccount?.name || 'Explorer'}</span>
        <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'rotate-up' : ''}`} />
      </button>

      {/* Top Left Pop-up Menu */}
      {isOpen && (
        <>
          {/* Invisible backdrop to dismiss */}
          <div className="popup-backdrop" onClick={onClose} />

          <div className="top-left-account-popup" onClick={(e) => e.stopPropagation()}>
            {/* Active Account Header Card */}
            <div 
              className="popup-active-account-card"
              style={{
                background: activeAccount?.themeColor || '#FFF4E8',
              }}
            >
              <div className="popup-active-avatar">
                {activeAccount?.avatar || '🦊'}
              </div>
              <div className="popup-active-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h4 style={{ fontSize: '0.98rem', lineHeight: 1.2 }}>{activeAccount?.name || 'Explorer'}</h4>
                  <span className="badge-active-pill">Active</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  PIN Protected 🔒
                </p>
              </div>
            </div>

            {/* Other Accounts List (if any exist) */}
            {otherAccounts.length > 0 && (
              <div style={{ margin: '10px 0 8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Switch Account:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {otherAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      className="popup-account-switch-item"
                      onClick={() => {
                        soundEngine.playPop();
                        onClose();
                        onSelectAccountPrompt(acc);
                      }}
                      title={`Switch to ${acc.name} (Requires PIN)`}
                    >
                      <span style={{ fontSize: 18 }}>{acc.avatar}</span>
                      <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 800, textAlign: 'left' }}>
                        {acc.name}
                      </span>
                      <Lock size={12} color="#E65100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Account Button */}
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1.5px dashed var(--border-subtle)' }}>
              <button
                className="btn-bubble btn-mint"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                onClick={() => {
                  soundEngine.playPop();
                  onClose();
                  onOpenAddAccount();
                }}
              >
                <Plus size={15} />
                <span>Add Account</span>
              </button>
            </div>

            {/* Action Buttons: Edit Profile & Lock */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '7px 8px', fontSize: '0.74rem' }}
                onClick={() => {
                  soundEngine.playPop();
                  onClose();
                  onOpenEditProfile();
                }}
                title="Edit profile name or change PIN"
              >
                <Edit3 size={12} />
                <span>Edit / PIN</span>
              </button>

              <button
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '7px 8px', fontSize: '0.74rem', color: '#C62828' }}
                onClick={() => {
                  soundEngine.playPop();
                  onClose();
                  onLockSession();
                }}
                title="Lock session and return to blank page"
              >
                <Lock size={12} />
                <span>Lock</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
