import React from 'react';
import { Plus, User, LogIn, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function BlankLandingView({
  onOpenCreateAccount,
  onOpenSignIn,
  accounts = [],
  onSelectAccount,
  onClose,
  isModal = false,
}) {
  const cardContent = (
    <div className="blank-landing-center-box" onClick={(e) => e.stopPropagation()}>
      {isModal && onClose && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -10, marginBottom: 4 }}>
          <button
            type="button"
            className="btn-icon-bubble"
            style={{ width: 32, height: 32 }}
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="blank-landing-sprout-icon">🌱</div>
      <h1 className="blank-landing-brand-title">BloomTrail</h1>
      <p className="blank-landing-brand-tagline">
        Cozy Progression & Milestones
      </p>

      {/* The prominent button in the middle to make an account */}
      <div style={{ marginTop: 24, marginBottom: 14 }}>
        <button
          className="btn-bubble btn-mint btn-blank-center-action"
          onClick={() => {
            soundEngine.playPop();
            onOpenCreateAccount();
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Create Account</span>
        </button>
      </div>

      {/* Sign In option */}
      <div style={{ marginBottom: accounts.length > 0 ? 16 : 0 }}>
        <button
          type="button"
          className="btn-bubble btn-cream btn-blank-signin-action"
          onClick={() => {
            soundEngine.playPop();
            onOpenSignIn();
          }}
        >
          <LogIn size={15} />
          <span>Already have an account? Sign In</span>
        </button>
      </div>

      {/* Optional quick resume if accounts exist */}
      {accounts.length > 0 && onSelectAccount && (
        <div className="blank-landing-existing-profiles">
          <span className="blank-existing-hint">Or switch to existing profile:</span>
          <div className="blank-existing-chips">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                className="blank-existing-chip"
                onClick={() => {
                  soundEngine.playPop();
                  onSelectAccount(acc.id);
                }}
                title={`Continue as ${acc.name}`}
              >
                <span>{acc.avatar || '🦊'}</span>
                <span>{acc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
        {cardContent}
      </div>
    );
  }

  return (
    <div className="blank-landing-screen">
      {cardContent}
    </div>
  );
}
