"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Radio, Wifi, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Contact.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transmitProgress, setTransmitProgress] = useState(0);
  
  const canvasRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // References for GSAP scroll entrance & interactions
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const submitBtnRef = useRef(null);

  // Ref-based amplitude to allow smooth GSAP tweening on focus/blur
  const amplitudeRef = useRef(25);

  // GSAP scroll entry animation
  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const container = containerRef.current;

    if (!leftPanel || !rightPanel || !container) return;

    // Initial styles set by GSAP
    gsap.set(leftPanel, { x: -60, opacity: 0 });
    gsap.set(rightPanel, { x: 60, opacity: 0 });

    const entranceTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%", // viewport enter trigger
        toggleActions: "play none none none",
      }
    });

    entranceTimeline.to([leftPanel, rightPanel], {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
    });

    return () => {
      if (entranceTimeline.scrollTrigger) entranceTimeline.scrollTrigger.kill();
      entranceTimeline.kill();
    };
  }, []);

  // Magnetic hover pull effect on the submit button
  useEffect(() => {
    if (isSubmitted) return;

    const handleMouseMove = (e) => {
      const button = submitBtnRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - btnCenterX;
      const deltaY = e.clientY - btnCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < 80) {
        // Nudge toward cursor by delta * 0.3 factor
        gsap.to(button, {
          x: deltaX * 0.3,
          y: deltaY * 0.3,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        // Return to center
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isSubmitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tween amplitude on input focus and blur
  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
    gsap.to(amplitudeRef, {
      current: 45, // Increase amplitude to 45 on focus
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleBlur = () => {
    setFocusedField(null);
    gsap.to(amplitudeRef, {
      current: 25, // Return to base amplitude of 25 on blur
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Trigger transmission progress animation
    setIsSubmitted(true);
    setTransmitProgress(0);

    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 5;
      setTransmitProgress(progress);
      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
      }
    }, 120);
  };

  // Oscilloscope wave modulator loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId;
    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Determine wave speed/amplitude based on focus and submit states
      let speed = 0.05;
      let amp = 25;
      let freq = 0.02;
      let strokeColor = "rgba(0, 212, 255, 0.8)"; // Cyan

      if (isSubmitted) {
        if (transmitProgress < 100) {
          // Super fast wave during transmitting
          speed = 0.25;
          amp = 35;
          freq = 0.06;
          strokeColor = "rgba(255, 154, 60, 0.9)"; // Amber
        } else {
          // Laser straight line on success
          speed = 0;
          amp = 1.5;
          freq = 0;
          strokeColor = "rgba(0, 255, 136, 0.9)"; // Green
        }
      } else {
        // Read tweened amplitude value dynamically
        amp = amplitudeRef.current;
        if (focusedField) {
          speed = 0.12;
          freq = 0.04;
        }
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerY = canvas.height / 2;

      // Draw horizontal dashed grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      // Horizontal center
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // Top grid line
      ctx.beginPath();
      ctx.moveTo(0, centerY - 25);
      ctx.lineTo(canvas.width, centerY - 25);
      ctx.stroke();

      // Bottom grid line
      ctx.beginPath();
      ctx.moveTo(0, centerY + 25);
      ctx.lineTo(canvas.width, centerY + 25);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;

      // Draw primary modulated wave
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin(x * freq + phase) * amp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw secondary out-of-phase wave for radar overlap look
      if (!isSubmitted) {
        ctx.strokeStyle = "rgba(139, 92, 246, 0.35)"; // Purple
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + Math.sin(x * freq * 0.8 - phase * 0.7) * (amp * 0.7);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += speed;
      animFrameId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animFrameId);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [focusedField, isSubmitted, transmitProgress]);

  return (
    <section ref={containerRef} className={styles.sectionContainer} id="contact-section">
      
      <div className={styles.sectionHeader}>
        <span className={styles.subtitleCode}>// LOG_04: CONNECTION</span>
        <h2 className={styles.titleLarge}>Initiate Mission</h2>
      </div>

      <div className={styles.consoleGrid}>
        
        {/* Left Console: Transceiver Telemetry */}
        <div ref={leftPanelRef} className={styles.transceiverPanel}>
          <div className={styles.panelHeader}>
            <Radio size={14} className={styles.pulseIcon} />
            <span className={styles.panelTitle}>SIGNAL TRANSCEIVER STATUS</span>
          </div>

          <div className={styles.panelBody}>
            {/* Oscilloscope canvas */}
            <div className={styles.oscilloscopeContainer}>
              <span className={styles.oscLabel}>WAVEFORM_MODULATOR</span>
              <canvas ref={canvasRef} width={320} height={100} className={styles.oscCanvas} />
            </div>

            {/* Diagnostic readouts */}
            <div className={styles.telemetryReadout}>
              <div className={styles.telemetryRow}>
                <span className={styles.telLabel}>SYS_FREQUENCY</span>
                <span className={styles.telVal}>1420.40 MHz [Locked]</span>
              </div>
              <div className={styles.telemetryRow}>
                <span className={styles.telLabel}>SYS_MODULATION</span>
                <span className={styles.telVal}>QAM-64 (Vector)</span>
              </div>
              <div className={styles.telemetryRow}>
                <span className={styles.telLabel}>ANTENNA_GAIN</span>
                <span className={styles.telVal}>+45 dB [Maxed]</span>
              </div>
              <div className={styles.telemetryRow}>
                <span className={styles.telLabel}>UPLINK_STATUS</span>
                <span 
                  className={
                    isSubmitted 
                      ? transmitProgress < 100 
                        ? styles.telValAmber 
                        : styles.telValGreen 
                      : styles.telValCyan
                  }
                >
                  {isSubmitted 
                    ? transmitProgress < 100 
                      ? "TRANSMITTING..." 
                      : "UPLINK COMPLETED" 
                    : "STANDBY // READY"}
                </span>
              </div>
            </div>

            {/* Satellite signal stats widget */}
            <div className={styles.signalStatus}>
              <Wifi size={14} className={styles.wifiIcon} />
              <div className={styles.signalLabelColumn}>
                <span className={styles.signalBig}>ORBITAL_LINK</span>
                <span className={styles.signalSub}>SAT_NAME: ESC_LAB_GATEWAY_V1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Console: Form Payload */}
        <div ref={rightPanelRef} className={styles.formPanel}>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              
              {/* Name field */}
              <div className={styles.inputWrapper}>
                <label htmlFor="name" className={styles.inputLabel}>
                  01 // SENDER_IDENTIFICATION (NAME)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus("name")}
                  onBlur={handleBlur}
                  className={`${styles.inputField} ${focusedField === "name" ? styles.inputFieldFocused : ""}`}
                  placeholder="ENTER YOUR NAME"
                  required
                />
              </div>

              {/* Email field */}
              <div className={styles.inputWrapper}>
                <label htmlFor="email" className={styles.inputLabel}>
                  02 // ROUTING_ADDRESS (EMAIL)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={handleBlur}
                  className={`${styles.inputField} ${focusedField === "email" ? styles.inputFieldFocused : ""}`}
                  placeholder="ENTER YOUR EMAIL"
                  required
                />
              </div>

              {/* Message field */}
              <div className={styles.inputWrapper}>
                <label htmlFor="message" className={styles.inputLabel}>
                  03 // PACKET_PAYLOAD (MESSAGE)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus("message")}
                  onBlur={handleBlur}
                  rows={4}
                  className={`${styles.textareaField} ${focusedField === "message" ? styles.textareaFieldFocused : ""}`}
                  placeholder="DESCRIBE YOUR INQUIRY OR MISSION OBJECTIVES"
                  required
                />
              </div>

              <button 
                ref={submitBtnRef}
                type="submit" 
                className={styles.submitButton}
                data-cursor-hover
                data-cursor-text="TRANSMIT NOW"
              >
                <Send size={14} />
                <span>./TRANSMIT_PAYLOAD</span>
              </button>

            </form>
          ) : (
            
            // Transmission screen feedback
            <div className={styles.transmissionScreen}>
              {transmitProgress < 100 ? (
                // Transmitting state
                <div className={styles.transmittingState}>
                  <div className={styles.transmittingText}>
                    <span>TRANSMITTING DATA PACKETS...</span>
                    <span>{transmitProgress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className={styles.progressBarTrack}>
                    <motion.div 
                      className={styles.progressBarFill}
                      animate={{ width: `${transmitProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <div className={styles.transmittingTerminal}>
                    <div>[SYS] Encrypting packet [AES-256]...</div>
                    {transmitProgress > 30 && <div>[SYS] Routing via ESC_LAB_GATEWAY_V1...</div>}
                    {transmitProgress > 60 && <div>[SYS] Packaging sender coordinates payload...</div>}
                    {transmitProgress > 85 && <div>[SYS] Syncing handshake frequency...</div>}
                  </div>
                </div>
              ) : (
                // Successfully transmitted state
                <motion.div 
                  className={styles.successState}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 size={44} className={styles.successIcon} />
                  <h3 className={styles.successTitle}>UPLINK SYNCHRONIZED</h3>
                  <p className={styles.successDesc}>
                    Your mechatronics data packet was successfully transmitted to Yash's lab. The signal has locked securely. Yash will establish a return connection vector soon.
                  </p>
                  
                  <div className={styles.successDiagnostic}>
                    <ShieldCheck size={14} className={styles.checkIconGreen} />
                    <span className={styles.diagnosticText}>TRANSMISSION_CODE: 200 // OK</span>
                  </div>

                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className={styles.backBtn}
                    data-cursor-hover
                    data-cursor-text="TRANSMIT NEW"
                  >
                    <span>TRANSMIT NEW PACKET</span>
                  </button>
                </motion.div>
              )}
            </div>
          )}

        </div>

      </div>

    </section>
  );
}
