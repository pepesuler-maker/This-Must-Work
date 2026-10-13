import React from 'react';
import { Plus, User, LogIn, Sparkles } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function BlankLandingView({
  onOpenCreateAccount,
  onOpenSignIn,
  accounts = [],
  onSelectAccount,
}) {
  return (
    <div className="blank-landing-screen">
      {/* Centered Box in the middle of the screen (Matches Screenshot 2) */}
      <div className="blank-landing-center-box">
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
    </div>
  );
}
