'use client';

import { useState, useEffect } from 'react';
import './page.css';

export default function Dashboard() {
  const [deepWorkTime, setDeepWorkTime] = useState(0); // in minutes
  const [isDeepWorkActive, setIsDeepWorkActive] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Fetch mock projects on load
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProjects(data.data.slice(0, 3)); // show top 3
        }
      });
  }, []);

  // Simple mock timer for the Deep Work block
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDeepWorkActive) {
      interval = setInterval(() => {
        setDeepWorkTime((prev) => prev + 1); // Mocking fast time for visual
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isDeepWorkActive]);

  const toggleTimer = () => setIsDeepWorkActive(!isDeepWorkActive);

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="neon-text">ANTIGRAVITY</h1>
          <p className="subtitle">PROTOCOL ENGINE</p>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${isDeepWorkActive ? 'active' : ''}`}></div>
          <span className="status-text">{isDeepWorkActive ? 'DEEP WORK ACTIVE' : 'STANDBY'}</span>
        </div>
      </header>

      <section className="timer-section glass-panel">
        <h2>The Forge [4-Hour Block]</h2>
        <div className="timer-display">
          <span className="time">{Math.floor(deepWorkTime / 60).toString().padStart(2, '0')}:{(deepWorkTime % 60).toString().padStart(2, '0')}</span>
          <span className="unit">HRS</span>
        </div>
        <button className={`action-btn ${isDeepWorkActive ? 'stop' : 'start'}`} onClick={toggleTimer}>
          {isDeepWorkActive ? 'END FORGE' : 'IGNITE FORGE'}
        </button>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${Math.min((deepWorkTime / 240) * 100, 100)}%` }}></div>
        </div>
      </section>

      <div className="grid-layout">
        <section className="track-card glass-panel">
          <div className="card-header">
            <h3>Track A: The Spine</h3>
            <span className="badge accent-primary">CORE</span>
          </div>
          <p className="card-desc">Distributed Systems & System Design</p>
          <ul className="task-list">
            <li><span className="icon">→</span> Read: CAP Theorem</li>
            <li><span className="icon">→</span> Read: Consistent Hashing</li>
          </ul>
        </section>

        <section className="track-card glass-panel">
          <div className="card-header">
            <h3>Track B: Execution</h3>
            <span className="badge accent-tertiary">BUILD</span>
          </div>
          <p className="card-desc">PROJECT_DANCE_150</p>
          <ul className="task-list">
            {projects.length > 0 ? (
              projects.map((p) => (
                <li key={p.projectId}><span className="icon">→</span> {p.projectId}: {p.title}</li>
              ))
            ) : (
              <li><span className="icon">→</span> Loading projects...</li>
            )}
          </ul>
        </section>

        <section className="track-card glass-panel">
          <div className="card-header">
            <h3>Track C: Parallel</h3>
            <span className="badge accent-secondary">COGNITIVE</span>
          </div>
          <p className="card-desc">Fragmented Time Consumption</p>
          <ul className="task-list">
            <li><span className="icon">→</span> Podcast: Naval Ravikant</li>
            <li><span className="icon">→</span> Drill: Mental Models</li>
          </ul>
        </section>
      </div>

      <section className="mastery-gate-section glass-panel">
        <div className="gate-content">
          <h3>The Mastery Gate</h3>
          <p>1500+ Daily Architecture Questions</p>
          <button className="gate-btn">OPEN GATE</button>
        </div>
      </section>
    </div>
  );
}
