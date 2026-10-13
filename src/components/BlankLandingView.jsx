import React from 'react';
import { Plus, Lock, Sparkles } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function BlankLandingView({
  accounts = [],
  onOpenAddAccount,
  onUnlockAccount,
}) {
  return (
    <div className="blank-landing-wrapper">
      <div className="blank-landing-card">
        {/* Minimal Cozy Branding */}
        <div className="blank-landing-icon">
          🌱
        </div>
        <h1 className="blank-landing-title">BloomTrail</h1>
        <p className="blank-landing-subtitle">
          Cozy Progression & Milestones
        </p>

        {/* Primary Action: ONLY Button Add Account */}
        <div style={{ margin: '24px 0 16px' }}>
          <button
            className="btn-bubble btn-mint btn-blank-add-account"
            onClick={() => {
              soundEngine.playPop();
              onOpenAddAccount();
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Add Account</span>
          </button>
        </div>

        {/* If existing accounts exist in storage, offer quick PIN unlock */}
        {accounts.length > 0 && (
          <div className="blank-existing-accounts-section">
            <span className="blank-existing-accounts-label">
              Or unlock existing profile:
            </span>
            <div className="blank-existing-accounts-grid">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  className="btn-bubble btn-cream blank-account-pill"
                  onClick={() => {
                    soundEngine.playPop();
                    onUnlockAccount(acc);
                  }}
                  title={`Unlock ${acc.name} (Requires PIN)`}
                >
                  <span style={{ fontSize: 18 }}>{acc.avatar}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{acc.name}</span>
                  <Lock size={12} color="#E65100" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
