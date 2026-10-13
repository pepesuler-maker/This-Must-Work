import React, { useRef, useEffect, useState } from 'react';
import { Plus, Sparkles, Check, Lock, Clock, Calendar, ChevronRight } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export function RoadmapView({
  journey,
  onSelectMilestone,
  onAddMilestone,
}) {
  const containerRef = useRef(null);
  const [svgPathD, setSvgPathD] = useState('');

  const milestones = journey?.milestones || [];
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPercent = milestones.length > 0 
    ? Math.round((completedCount / milestones.length) * 100) 
    : 0;

  // Calculate dynamic winding SVG curve between nodes
  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const nodes = containerRef.current.querySelectorAll('.milestone-node');
      if (nodes.length < 2) {
        setSvgPathD('');
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const points = [];

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top + rect.height / 2 - containerRect.top;
        points.push({ x, y });
      });

      // Construct cubic bezier curve
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midY = (curr.y + next.y) / 2;
        d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
      }

      setSvgPathD(d);
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    const timeout = setTimeout(updatePath, 150);

    return () => {
      window.removeEventListener('resize', updatePath);
      clearTimeout(timeout);
    };
  }, [milestones]);

  return (
    <div className="roadmap-container">
      {/* Journey Header Card */}
      <div className="roadmap-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div 
            style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 20, 
              background: journey.themeColor || '#A8E6CF', 
              border: '2.5px solid var(--border-color)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 30,
              boxShadow: '0 3px 0 var(--border-color)' 
            }}
          >
            {journey.icon || '🌱'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', lineHeight: 1.2 }}>{journey.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
              {journey.description || 'Your personal adventure trail.'}
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="progress-track">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
            <span>Roadmap Progress</span>
            <span>{progressPercent}% ({completedCount}/{milestones.length})</span>
          </div>
          <div className="progress-track-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Trail Canvas with Winding Nodes */}
      <div className="trail-canvas" ref={containerRef}>
        {/* SVG Curved Trail Connector */}
        <svg className="trail-svg-layer">
          {svgPathD && (
            <>
              {/* Outer stroke shadow */}
              <path
                d={svgPathD}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="14 10"
              />
              {/* Inner bright dashed path */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#FFE49E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="14 10"
              />
            </>
          )}
        </svg>

        {milestones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', zIndex: 2 }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              No milestones on this path yet!
            </p>
            <button
              className="btn-bubble btn-mint"
              style={{ marginTop: 14 }}
              onClick={() => {
                soundEngine.playPop();
                onAddMilestone();
              }}
            >
              <Plus size={18} />
              <span>Plant First Milestone</span>
            </button>
          </div>
        ) : (
          milestones.map((ms, index) => {
            // Alternate left, center, right for that cozy winding trail look
            const alignClass =
              index % 3 === 0 ? 'align-left' : index % 3 === 1 ? '' : 'align-right';

            const subtaskCompleted = ms.subtasks?.filter((s) => s.completed).length || 0;
            const subtaskTotal = ms.subtasks?.length || 0;

            return (
              <div key={ms.id} className={`trail-milestone-row ${alignClass}`}>
                <div
                  className={`milestone-node ${ms.status}`}
                  onClick={() => {
                    soundEngine.playPop();
                    onSelectMilestone(ms);
                  }}
                >
                  {/* Floating unlocked sticker */}
                  {ms.status === 'completed' && ms.rewardSticker && (
                    <div className="node-sticker-badge">
                      <Sparkles size={11} color="#E65100" />
                      <span>{ms.rewardSticker}</span>
                    </div>
                  )}

                  {/* Icon Node */}
                  <div className="node-icon-circle">
                    {ms.status === 'completed' ? (
                      <Check size={26} strokeWidth={3} color="#2E7D32" />
                    ) : ms.status === 'locked' ? (
                      <Lock size={20} color="#795548" />
                    ) : (
                      <span>🌱</span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="node-info">
                    <span className="node-title">{ms.title}</span>
                    <div className="node-meta">
                      {ms.targetDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} />
                          {ms.targetDate}
                        </span>
                      )}
                      {subtaskTotal > 0 && (
                        <span>
                          • {subtaskCompleted}/{subtaskTotal} steps
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={18} color="var(--border-color)" style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            );
          })
        )}

        {/* Add Milestone Node at the end of the trail */}
        <div className="trail-milestone-row" style={{ zIndex: 2, marginTop: 10 }}>
          <button
            className="btn-bubble btn-peach"
            onClick={() => {
              soundEngine.playPop();
              onAddMilestone();
            }}
          >
            <Plus size={18} />
            <span>Add Next Milestone Checkpoint</span>
          </button>
        </div>
      </div>
    </div>
  );
}
