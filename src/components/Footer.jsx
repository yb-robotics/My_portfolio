"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const [latency, setLatency] = useState(12);

  // Simulate subtle real-time network latency shifts (10ms - 16ms range) for robotics telemetry flavor
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 7) + 10);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBackToTop = () => {
    const target = document.getElementById('hero-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      
      {/* 1. High-Tech System Telemetry Readouts */}
      <div className={styles.telemetryBoard}>
        <span className={styles.telemetryItem}>
          SYS_STATUS: <span className={styles.telemetryGreen}>OPERATIONAL</span>
        </span>
        <span className={styles.telemetryItem}>
          SYS_PING: <span className={styles.telemetryBlue}>{latency}ms</span>
        </span>
        <span className={styles.telemetryItem}>
          DEV_ENV: <span style={{ color: '#ff9a3c' }}>Next.js 15 // GSAP 3</span>
        </span>
      </div>

      {/* 2. Social Links */}
      <div className={styles.linksContainer}>
        <a href="https://github.com/yb-robotics" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
          // GITHUB
        </a>
        <a href="https://www.linkedin.com/in/yash-bansal-77644b318/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
          // LINKEDIN
        </a>
        <a href="mailto:work.yashbansal5@gmail.com" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>
          // EMAIL
        </a>
        
        {/* Back to top toggle */}
        <button onClick={handleBackToTop} className={styles.backToTop} aria-label="Scroll Back to Top">
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* 3. Copyright stamp */}
      <div style={{ width: '100%', marginTop: '0.5rem' }}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Yash Bansal. ALL RIGHTS RESERVED. SECURED VIA SEC_LAB_GATEWAY_V1.
        </p>
      </div>

    </footer>
  );
}
