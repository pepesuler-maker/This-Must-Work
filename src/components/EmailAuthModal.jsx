import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, Check, Sparkles, ArrowRight, ArrowLeft, RefreshCw, AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../services/soundEngine';
import { storageService } from '../services/storageService';

const AVATARS = ['🦊', '🐼', '🐱', '🐻', '🐰', '🦁', '🌸', '🌱', '🚀', '⭐', '☕', '🎸'];
const THEME_COLORS = ['#FF9AA2', '#B5EAEA', '#FFDAC1', '#E2F0CB', '#FFB7B2', '#DED2F9'];

export function EmailAuthModal({
  initialMode = 'signup', // 'signup' | 'signin'
  onSuccess,
  onClose,
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'signup' | 'signin'
  const [step, setStep] = useState(1); // 1 = details, 2 = email verification code

  // Sign up fields (Clean background placeholders only)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);

  // Verification code field
  const [verificationCode, setVerificationCode] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState('');
  const [codeToast, setCodeToast] = useState('');

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send verification code to email
  const handleRequestVerification = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    soundEngine.playPop();

    // Check if email already registered
    const existing = storageService.getAccounts();
    if (existing.some((a) => a.email && a.email.toLowerCase() === email.trim().toLowerCase())) {
      setIsLoading(false);
      setErrorMessage(`An account with email "${email}" already exists. Please sign in instead.`);
      return;
    }

    // Dispatch verification code
    const res = storageService.sendVerificationCode(email);
    setDispatchedCode(res.code);
    setCodeToast(`📩 Mail Sent to ${res.email}! Your BloomTrail Verification Code is: ${res.code}`);
    setIsLoading(false);
    setStep(2);
  };

  // Step 2: Verify code and register account
  const handleVerifyAndRegister = (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setErrorMessage('');
    const verifyRes = storageService.verifyEmailCode(email, verificationCode);
    if (!verifyRes.success) {
      soundEngine.playPop();
      setErrorMessage(verifyRes.error || 'Invalid verification code.');
      return;
    }

    soundEngine.playMilestoneFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF9AA2', '#B5EAEA', '#FFDAC1', '#E2F0CB'],
    });

    const newAcc = storageService.addAccount({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      avatar,
      themeColor,
      isVerified: true,
    });

    onSuccess(newAcc);
    onClose();
  };

  // Sign In handler
  const handleSignIn = (e) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    const res = storageService.signInWithEmail(signInEmail, signInPassword);
    if (!res.success) {
      soundEngine.playPop();
      setErrorMessage(res.error);
      return;
    }

    soundEngine.playSuccess();
    onSuccess(res.account);
    onClose();
  };

  // Resend code
  const handleResendCode = () => {
    soundEngine.playPop();
    const res = storageService.sendVerificationCode(email);
    setDispatchedCode(res.code);
    setCodeToast(`📩 New Verification Code sent to ${res.email}: ${res.code}`);
    setErrorMessage('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content auth-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: '24px' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🌱</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                {authMode === 'signup' 
                  ? (step === 1 ? 'Create Account' : 'Verify Email Address') 
                  : 'Sign In to BloomTrail'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {authMode === 'signup' 
                  ? (step === 1 ? 'Email authentication & verification' : `6-digit code sent to ${email}`) 
                  : 'Access your cozy trails & habit stamps'}
              </p>
            </div>
          </div>
          <button className="btn-icon-bubble" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher: Create Account vs Sign In */}
        {step === 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`btn-bubble ${authMode === 'signup' ? 'btn-mint' : 'btn-cream'}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
              onClick={() => {
                soundEngine.playPop();
                setAuthMode('signup');
                setErrorMessage('');
              }}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`btn-bubble ${authMode === 'signin' ? 'btn-peach' : 'btn-cream'}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
              onClick={() => {
                soundEngine.playPop();
                setAuthMode('signin');
                setErrorMessage('');
              }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Simulated Email Delivery Alert Toast */}
        {codeToast && step === 2 && (
          <div 
            style={{
              background: '#E8F5E9',
              border: '2px solid #81C784',
              borderRadius: 14,
              padding: '10px 12px',
              marginBottom: 14,
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 0 #2E7D32',
            }}
          >
            <Mail size={18} color="#2E7D32" flexShrink={0} />
            <span>{codeToast}</span>
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div 
            style={{
              background: '#FFEBEE',
              color: '#C62828',
              border: '1.5px solid #EF5350',
              borderRadius: 12,
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              marginBottom: 14,
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* SIGN UP - STEP 1: Details & Send Code                        */}
        {/* ----------------------------------------------------------- */}
        {authMode === 'signup' && step === 1 && (
          <form onSubmit={handleRequestVerification}>
            {/* Avatar Picker */}
            <div style={{ marginBottom: 12 }}>
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
                      fontSize: 20,
                      background: avatar === av ? 'var(--pastel-peach)' : '#FFFFFF',
                      transform: avatar === av ? 'scale(1.12)' : 'none',
                    }}
                    onClick={() => {
                      soundEngine.playPop();
                      setAvatar(av);
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Your Name
              </label>
              <input
                type="text"
                className="input-bubble"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Sam, Explorer..."
                required
              />
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Email Address (Verification required)
              </label>
              <input
                type="email"
                className="input-bubble"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Password (Min. 4 characters)
              </label>
              <input
                type="password"
                className="input-bubble"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your password..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn-bubble btn-mint"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              disabled={isLoading}
            >
              <Mail size={16} />
              <span>Send Verification Code</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* SIGN UP - STEP 2: Email Verification (OTP Code)             */}
        {/* ----------------------------------------------------------- */}
        {authMode === 'signup' && step === 2 && (
          <form onSubmit={handleVerifyAndRegister}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div 
                style={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: '50%', 
                  background: 'var(--pastel-peach)', 
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                  fontSize: 24,
                }}
              >
                ✉️
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>
                Enter the 6-digit verification code sent to:
              </p>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {email}
              </strong>
            </div>

            {/* Verification code input */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                maxLength={6}
                className="input-bubble"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code (e.g. 123456)"
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.4rem', 
                  letterSpacing: 6, 
                  fontWeight: 800,
                  padding: '12px',
                }}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="btn-bubble btn-mint"
                style={{ flex: 2, padding: '10px' }}
              >
                <Check size={16} />
                <span>Verify & Finish ✨</span>
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                onClick={handleResendCode}
              >
                Didn't receive code? Resend Code
              </button>
            </div>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* SIGN IN                                                      */}
        {/* ----------------------------------------------------------- */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-bubble"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Password
              </label>
              <input
                type="password"
                className="input-bubble"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn-bubble btn-peach"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <Check size={16} />
              <span>Sign In to Account</span>
            </button>

            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn-bubble btn-cream"
                style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderStyle: 'dashed' }}
                onClick={() => {
                  soundEngine.playPop();
                  setSignInEmail('pepesuler@gmail.com');
                  setSignInPassword('1234');
                  setErrorMessage('');
                }}
              >
                🦊 Quick Fill Test: pepesuler@gmail.com / 1234
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
