import React, { useState, useEffect } from 'react';
import loadingBg from '../assets/loading_screen.jpg';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete, minDuration = 1200, role = 'client' }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Authenticating session...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const updateStatus = (currentProgress) => {
      const r = (role || '').toLowerCase();
      if (currentProgress < 30) {
        setStatusText(r === 'admin' ? 'Authenticating Administrator...' : r === 'staff' ? 'Verifying Staff Credentials...' : 'Authenticating EcoTour Account...');
      } else if (currentProgress < 70) {
        setStatusText(r === 'admin' ? 'Loading System & Revenue Analytics...' : r === 'staff' ? 'Preparing POS & Resort Terminals...' : 'Loading Reservations & Spring Services...');
      } else if (currentProgress < 99) {
        setStatusText(r === 'admin' ? 'Opening Admin Control Center...' : r === 'staff' ? 'Opening Staff Operations Portal...' : 'Preparing Your EcoTourVista Portal...');
      } else {
        setStatusText(r === 'admin' ? 'Welcome Administrator! 🌿' : r === 'staff' ? 'Welcome Staff Member! 🌿' : 'Welcome to EcoTourVista! 🌿');
      }
    };

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let nextProgress = Math.min(100, Math.floor((elapsed / minDuration) * 100));

      // Fast, natural feeling increments
      if (nextProgress < 95 && Math.random() > 0.3) {
        nextProgress = Math.min(95, nextProgress + Math.floor(Math.random() * 4));
      }

      setProgress(nextProgress);
      updateStatus(nextProgress);

      if (elapsed >= minDuration) {
        setProgress(100);
        updateStatus(100);
        clearInterval(interval);

        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 350); // Snappy fade-out
        }, 150);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [minDuration, onComplete, role]);

  return (
    <div className={`ecotour-loading-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Background artwork */}
      <img
        src={loadingBg}
        alt="EcoTourVista Loading Screen"
        className="loading-bg-img"
      />

      {/* Dark gradient overlay for bottom text and progress bar readability */}
      <div className="loading-vignette-overlay" />

      {/* Interactive Bottom Progress Overlay */}
      <div className="loading-bottom-container">
        {/* Dynamic Status Headline */}
        <p className="loading-status-headline">{statusText}</p>

        {/* Progress Bar with Golden Border Frame & Glow */}
        <div className="loading-bar-wrapper">
          <div className="loading-bar-frame">
            <div
              className="loading-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="loading-bar-sparkle" />
            </div>
          </div>

          {/* Accurate Percentage Display with Golden Flourish */}
          <div className="loading-percent-badge">
            <span className="percent-number">{progress}%</span>
          </div>
        </div>

        {/* Subtitle */}
        <p className="loading-subtitle">Preparing your EcoTourVista adventure...</p>

        {/* Decorative Lotus Flourish */}
        <div className="loading-flourish">
          <span className="flourish-line" />
          <span className="flourish-icon">⚜</span>
          <span className="flourish-line" />
        </div>
      </div>
    </div>
  );
}
