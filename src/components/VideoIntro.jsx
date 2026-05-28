"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CinematicLayer from './CinematicLayer';
import useGSAPEntrance from '../hooks/useGSAPEntrance';
import styles from './VideoIntro.module.css';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function VideoIntro() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundBadge, setShowSoundBadge] = useState(true);
  const [sysTime, setSysTime] = useState("");
  const [isMobileSize, setIsMobileSize] = useState(false);

  const heroRef = useRef(null);
  const bgVideoRef = useRef(null);
  const fgVideoRef = useRef(null);
  
  // Parallax layers refs
  const videoLayerRef = useRef(null);
  const canvasLayerRef = useRef(null);
  const contentLayerRef = useRef(null);

  // GSAP targets for entrance
  const taglineRef = useRef(null);
  const nameRef = useRef(null);
  const subtitleRef = useRef(null);
  const controlsRef = useRef(null);
  const statusRef = useRef(null);

  // Hook up GSAP entrance timelines on component mount
  useGSAPEntrance({
    containerRef: heroRef,
    taglineRef,
    nameRef,
    subtitleRef,
    controlsRef,
    statusRef
  });

  // Track window resizing to dynamically enable/disable mobile optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileSize(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // GSAP ScrollTrigger to pin the Hero container for 100vh of scrolling
  useEffect(() => {
    if (isMobileSize) return;

    const pinTrigger = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "+=100%", // pin for 100vh scrolled
      pin: true,
      pinSpacing: true,
      scrub: true,
    });

    return () => {
      if (pinTrigger) pinTrigger.kill();
    };
  }, [isMobileSize]);

  // Hook up Lenis scroll position callback to update the parallax translations
  useLenis(({ scroll }) => {
    if (isMobileSize) {
      if (videoLayerRef.current) videoLayerRef.current.style.transform = '';
      if (canvasLayerRef.current) canvasLayerRef.current.style.transform = '';
      if (contentLayerRef.current) contentLayerRef.current.style.transform = '';
      return;
    }

    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
    // Pin duration is 100vh, clamp scroll to vh so elements don't fly away infinitely after scroll passes hero
    const clampedScroll = Math.max(0, Math.min(scroll, vh));

    // Video layer moves at 0.4x scroll speed
    const videoY = clampedScroll * 0.4;
    // Cinematic Three.js canvas moves at 0.6x scroll speed
    const canvasY = clampedScroll * 0.6;
    // Headline moves at 0.8x scroll speed
    const headlineY = clampedScroll * 0.8;

    if (videoLayerRef.current) {
      videoLayerRef.current.style.transform = `translate3d(0, ${videoY}px, 0)`;
    }
    if (canvasLayerRef.current) {
      canvasLayerRef.current.style.transform = `translate3d(0, ${canvasY}px, 0)`;
    }
    if (contentLayerRef.current) {
      contentLayerRef.current.style.transform = `translate3d(0, ${headlineY}px, 0)`;
    }
  });

  // Auto-hide the "Tap for sound" badge after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSoundBadge(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // System time ticker for robotics/RViz aesthetic
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      setSysTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Explicitly trigger autoplay on mount for reliable execution across strict browsers
  useEffect(() => {
    if (fgVideoRef.current) {
      fgVideoRef.current.muted = true;
      fgVideoRef.current.play().catch(err => {
        console.log("Foreground video autoplay prevented:", err);
      });
    }
    if (bgVideoRef.current) {
      bgVideoRef.current.muted = true;
      bgVideoRef.current.play().catch(err => {
        console.log("Background video autoplay prevented:", err);
      });
    }
  }, []);

  // Sync play states
  const togglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    
    if (fgVideoRef.current) {
      if (nextPlaying) {
        fgVideoRef.current.play().catch(err => console.log("Foreground play failed:", err));
      } else {
        fgVideoRef.current.pause();
      }
    }

    if (bgVideoRef.current && !isMobileSize) {
      if (nextPlaying) {
        bgVideoRef.current.play().catch(err => console.log("Background play failed:", err));
      } else {
        bgVideoRef.current.pause();
      }
    }
  };

  // Sync mute states
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setShowSoundBadge(false); // Hide the badge if user interacts manually
    
    if (fgVideoRef.current) {
      fgVideoRef.current.muted = nextMuted;
    }
  };

  // Synchronize background video playing to the foreground master video
  const handleTimeUpdate = () => {
    if (!isMobileSize && bgVideoRef.current && fgVideoRef.current) {
      const diff = Math.abs(fgVideoRef.current.currentTime - bgVideoRef.current.currentTime);
      if (diff > 0.15) {
        bgVideoRef.current.currentTime = fgVideoRef.current.currentTime;
      }
    }
  };

  const handleScrollClick = () => {
    const target = document.getElementById('projects-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className={styles.heroContainer} id="hero-section">
      
      {/* 1. Ambient Background Layer (Blurred Video) - Discarded on mobile for CPU efficiency */}
      {!isMobileSize && (
        <div className={styles.ambientVideoWrapper}>
          <video
            ref={bgVideoRef}
            className={styles.videoBlurred}
            src="/yash-video.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      )}

      {/* 2. Three.js Robotics Particle Canvas Overlay (wrapped for parallax translation) */}
      <div ref={canvasLayerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        <CinematicLayer />
      </div>

      {/* 3. Foreground Video Frame (Centered Apple-style container) */}
      <div ref={videoLayerRef} className={styles.foregroundVideoWrapper}>
        <video
          ref={fgVideoRef}
          className={styles.videoForeground}
          src="/yash-video.mp4"
          autoPlay
          loop
          muted={isMuted}
          defaultMuted
          playsInline
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* 4. Cinematic Vignette and Lighting Overlays */}
      <div className={styles.overlayVignette} />

      {/* 5. Left-Aligned Landing Typography (Lower-Left quadrant) */}
      <div ref={contentLayerRef} className={styles.contentContainer}>
        <span ref={taglineRef} className={styles.tagline}>
          <span className={styles.taglineDot} />
          Robotics & AI Engineer
        </span>
        
        <div ref={nameRef} className={styles.nameContainer}>
          <h1 className={styles.nameLine}>Yash</h1>
          <h1 className={styles.nameLine}>Bansal</h1>
        </div>

        <p ref={subtitleRef} className={styles.subtitle}>
          Building intelligent machines that interact with the real world.
        </p>

        <div className={styles.techList}>
          <span className={styles.techItem}>ROS2</span>
          <span className={styles.techItem}>SolidWorks</span>
          <span className={styles.techItem}>Embedded Systems</span>
          <span className={styles.techItem}>SLAM</span>
        </div>
      </div>

      {/* 6. High-Tech Glassmorphism Player Controls (Bottom-Right) */}
      <div ref={controlsRef} className={styles.controlsWrapper}>
        {showSoundBadge && isMuted && (
          <div className={styles.soundBadge}>
            TAP FOR SOUND
          </div>
        )}
        
        <button 
          onClick={togglePlay} 
          className={styles.glassButton} 
          aria-label={isPlaying ? "Pause Video" : "Play Video"}
        >
          {isPlaying ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} fill="currentColor" />}
        </button>

        <button 
          onClick={toggleMute} 
          className={styles.glassButton} 
          aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
        </button>
      </div>

      {/* 7. Easter Eggs: Coordinate Grid Reference & System Counter (Bottom Left) */}
      <div ref={statusRef} className={styles.rvizWidget}>
        <div className={styles.coordinateAxes}>
          <span className={`${styles.axisItem} ${styles.axisX}`}>
            X <div className={styles.axisLine} />
          </span>
          <span className={`${styles.axisItem} ${styles.axisY}`}>
            Y <div className={styles.axisLine} />
          </span>
          <span className={`${styles.axisItem} ${styles.axisZ}`}>
            Z <div className={styles.axisLine} />
          </span>
        </div>
        <div className={styles.sysTerminal}>
          <span>SYS_T: {sysTime}</span>
          <span>// SYS: ONLINE</span>
          <span className={styles.blinkCursor} />
        </div>
      </div>

      {/* 8. Scroll Down Pulse Indicator */}
      <div className={styles.scrollIndicator} onClick={handleScrollClick}>
        <span className={styles.scrollText}>SCROLL</span>
        <div className={styles.scrollTrack}>
          <div className={styles.scrollPulse} />
        </div>
      </div>

    </section>
  );
}
