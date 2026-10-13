import React, { useState } from 'react';
import { X, Archive, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function ArchivedJourneysModal({
  archivedJourneys,
  onClose,
  onRestoreJourney,
  onDeleteJourney,
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>📦</span>
            <h2 style={{ fontSize: '1.25rem' }}>Archived Trails</h2>
          </div>
          <button className="btn-icon-bubble" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Trails you have archived to keep your active adventure list clean. You can restore them anytime!
        </p>

        {archivedJourneys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              No archived trails yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {archivedJourneys.map((j) => {
              const completedCount = j.milestones.filter((m) => m.status === 'completed').length;
              const totalCount = j.milestones.length;

              return (
                <div
                  key={j.id}
                  style={{
                    background: '#FFFDF9',
                    border: '2px solid var(--border-color)',
                    borderRadius: 20,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: '0 3px 0 var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 26 }}>{j.icon || '🌱'}</span>
                      <div>
                        <strong style={{ fontSize: '0.98rem' }}>{j.title}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {completedCount}/{totalCount} checkpoints completed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      className="btn-bubble btn-mint"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem' }}
                      onClick={() => {
                        soundEngine.playSuccess();
                        onRestoreJourney(j.id);
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Restore Trail</span>
                    </button>

                    {confirmDeleteId === j.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#FFEAEA', padding: '3px 8px', borderRadius: 12 }}>
                        <span style={{ fontSize: '0.74rem', color: '#C62828', fontWeight: 700 }}>Delete forever?</span>
                        <button
                          className="btn-bubble"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#FF5252', color: '#fff', borderColor: '#C62828' }}
                          onClick={() => {
                            soundEngine.playPop();
                            setConfirmDeleteId(null);
                            onDeleteJourney(j.id);
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn-bubble btn-cream"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-bubble btn-cream"
                        style={{ padding: '7px 12px', fontSize: '0.8rem', color: '#C62828' }}
                        onClick={() => {
                          soundEngine.playPop();
                          setConfirmDeleteId(j.id);
                        }}
                        title="Permanently Delete"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
