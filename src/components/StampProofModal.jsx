import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, Sparkles, AlertCircle, Image as ImageIcon, Trash2, Calendar, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../services/soundEngine';

const STAMP_BADGES = [
  { id: 'runner', label: '🏃 Runner Stamp', icon: '🏃' },
  { id: 'certified', label: '💮 Certified Seal', icon: '💮' },
  { id: 'gold_star', label: '⭐ Gold Star', icon: '⭐' },
  { id: 'paw', label: '🐾 Cozy Paw', icon: '🐾' },
  { id: 'floral', label: '🌸 Floral Badge', icon: '🌸' },
  { id: 'flame', label: '🔥 Streak Fire', icon: '🔥' },
];

// Helper to compress/resize image in browser canvas to keep localStorage fast & lightweight
function resizeImage(file, maxWidth = 640, maxHeight = 640, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// Generate an offline test photo canvas if user wants quick test photo
function generateCozyTestPhoto(habitTitle = 'Activity') {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  // Cozy pastel gradient background
  const grad = ctx.createLinearGradient(0, 0, 400, 300);
  grad.addColorStop(0, '#FFE8D6');
  grad.addColorStop(0.5, '#B7E4C7');
  grad.addColorStop(1, '#A8DADC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 300);

  // Decorative border
  ctx.strokeStyle = '#5A3E31';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 380, 280);

  // Text
  ctx.fillStyle = '#5A3E31';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📸 PHOTO PROOF VERIFIED', 200, 120);

  ctx.font = '18px sans-serif';
  ctx.fillText(habitTitle, 200, 160);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#3E2723';
  ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 200, 200);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function StampProofModal({
  habit,
  initialDate,
  onClose,
  onSaveStamp,
}) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [caption, setCaption] = useState(''); // Empty background placeholder
  const [photoProof, setPhotoProof] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(STAMP_BADGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');
      soundEngine.playPop();
      const compressedDataUrl = await resizeImage(file);
      setPhotoProof(compressedDataUrl);
    } catch (err) {
      console.error('Error reading photo', err);
      setErrorMessage('Failed to read photo. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseDemoPhoto = () => {
    soundEngine.playPop();
    const demoPhoto = generateCozyTestPhoto(habit.title);
    setPhotoProof(demoPhoto);
    setErrorMessage('');
  };

  const handleRemovePhoto = () => {
    soundEngine.playPop();
    setPhotoProof(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmStamp = (e) => {
    e.preventDefault();

    // STRICT MANDATORY PHOTO PROOF CHECK
    if (!photoProof) {
      soundEngine.playPop();
      setErrorMessage('Mandatory photo proof required! You cannot select it as done without attaching a picture of proof.');
      return;
    }

    soundEngine.playMilestoneFanfare();

    // Sprinkling confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAEA'],
    });

    const stamp = {
      id: 'stamp-' + Date.now(),
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      photoProof,
      caption: caption.trim(),
      badgeIcon: selectedBadge.icon,
      badgeLabel: selectedBadge.label,
      certifiedAt: new Date().toISOString(),
    };

    onSaveStamp(stamp);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content modal-stamp-proof"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 16, 
                background: habit.themeColor || '#FF9AA2',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 3px 0 var(--border-color)',
              }}
            >
              {habit.icon || '🏃'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', lineHeight: 1.2 }}>Stamp Progress</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {habit.title} • {habit.targetDaysPerWeek} Days/Week Goal
              </p>
            </div>
          </div>
          <button className="btn-icon-bubble" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Mandatory Proof Requirement Banner */}
        <div 
          style={{
            background: photoProof ? '#E8F5E9' : '#FFF3E0',
            border: `2px solid ${photoProof ? '#81C784' : '#FFB74D'}`,
            borderRadius: 16,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: photoProof ? '#2E7D32' : '#E65100',
          }}
        >
          {photoProof ? (
            <>
              <Check size={20} color="#2E7D32" strokeWidth={3} />
              <span>Photo proof attached! Ready to stamp this day as done.</span>
            </>
          ) : (
            <>
              <AlertCircle size={20} color="#E65100" />
              <span>Mandatory Proof: A picture of proof is required to stamp this day as done!</span>
            </>
          )}
        </div>

        {errorMessage && (
          <div 
            style={{
              background: '#FFEBEE',
              border: '2px solid #EF5350',
              borderRadius: 14,
              padding: '10px 14px',
              marginBottom: 16,
              color: '#C62828',
              fontSize: '0.85rem',
              fontWeight: 800,
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleConfirmStamp}>
          {/* Date Picker */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Completion Date
            </label>
            <input
              type="date"
              className="input-bubble"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
              required
            />
          </div>

          {/* Picture Proof Upload Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📸</span> Picture Proof <span style={{ color: '#D32F2F', fontSize: '0.8rem' }}>(Mandatory *)</span>
              </label>

              {!photoProof && (
                <button
                  type="button"
                  className="btn-bubble btn-cream"
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                  onClick={handleUseDemoPhoto}
                  title="Generate a verified proof photo for quick testing"
                >
                  <span>Quick Test Photo</span>
                </button>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="stamp-photo-input"
            />

            {!photoProof ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2.5px dashed var(--border-color)',
                  borderRadius: 20,
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  boxShadow: '0 3px 0 var(--border-color)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF9F2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
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
                  <Camera size={26} color="var(--text-main)" />
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>
                  {isProcessing ? 'Processing image...' : 'Tap to Upload or Snap Photo Proof'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Mandatory: Camera snapshot or gallery image showing you completed {habit.title}
                </p>
              </div>
            ) : (
              <div 
                style={{ 
                  position: 'relative', 
                  borderRadius: 20, 
                  overflow: 'hidden', 
                  border: '2.5px solid var(--border-color)',
                  boxShadow: '0 4px 0 var(--border-color)',
                  background: '#2B2B2B',
                }}
              >
                <img
                  src={photoProof}
                  alt="Milestone proof"
                  style={{
                    width: '100%',
                    maxHeight: 240,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                
                {/* Stamp watermark badge in corner */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid var(--border-color)',
                    borderRadius: 12,
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <span>✓ Proof Attached</span>
                </div>

                {/* Remove / replace button */}
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: '#FFFFFF',
                    border: '2px solid var(--border-color)',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                  title="Remove and retake photo"
                >
                  <Trash2 size={16} color="#C62828" />
                </button>
              </div>
            )}
          </div>

          {/* Stamp Style Badge Picker */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Choose Stamp Seal
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {STAMP_BADGES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="btn-bubble"
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    background: selectedBadge.id === b.id ? 'var(--pastel-peach)' : '#FFFFFF',
                    borderColor: 'var(--border-color)',
                    transform: selectedBadge.id === b.id ? 'scale(1.02)' : 'none',
                  }}
                  onClick={() => {
                    soundEngine.playPop();
                    setSelectedBadge(b);
                  }}
                >
                  <span>{b.icon}</span>
                  <span style={{ fontSize: '0.76rem' }}>{b.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caption / Reflection (Placeholder background text only, NO pre-made text!) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Notes or Caption (Optional)
            </label>
            <textarea
              className="input-bubble"
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Ran 4.5km around the park in the morning sunshine!"
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-bubble btn-cream"
              style={{ flex: 1, padding: '12px' }}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`btn-bubble ${photoProof ? 'btn-mint' : 'btn-cream'}`}
              disabled={!photoProof || isProcessing}
              style={{
                flex: 2,
                padding: '12px',
                opacity: photoProof ? 1 : 0.65,
                cursor: photoProof ? 'pointer' : 'not-allowed',
              }}
              title={photoProof ? 'Confirm stamp and certify milestone' : 'Attach photo proof first'}
            >
              <Sparkles size={18} />
              <span>{photoProof ? 'Confirm Stamp & Proof ✨' : '⚠️ Photo Proof Required'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
