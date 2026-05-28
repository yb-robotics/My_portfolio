"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Terminal, Cpu, RotateCw, Activity, ShieldAlert } from "lucide-react";
import styles from "./SimulationLab.module.css";

const STATIC_LOGS = [
  "[SYS] Initializing ROS2 nodes on domain ID 42...",
  "[SYS] Loading robot description URDF (Articulated Arm V2)...",
  "[SYS] Joint state publisher initialized.",
  "[SYS] Forward Kinematics solver loaded.",
  "[SYS] Inverse Kinematics solver loaded.",
  "[INFO] TCP controller active. Awaiting target vectors...",
  "[INFO] Laser scanner active - range 12.0m, resolution 0.25deg",
  "[INFO] TF Tree verified: /world -> /base_link -> /tcp",
  "[INFO] Torque safety boundaries verified. Limit 24.5 Nm.",
  "[WARN] High latency detected on joint_4 encoder loop. Re-calibrating...",
  "[SYS] Re-calibration successful. Latency 1.2ms [OK]",
  "[INFO] Motion planner ready. Target set: GRASP_MODE.",
  "[INFO] Executing motion path trajectory [P1 -> P2 -> P3]...",
  "[INFO] Target coordinates reached. Actuator torque balanced.",
  "[INFO] Gripper status: CLOSED. Object detected (Load: 124g).",
  "[INFO] Running path planning for return cycle...",
];

export default function SimulationLab() {
  const [logs, setLogs] = useState([]);
  const [joints, setJoints] = useState({ J1: 0, J2: 15, J3: -45, J4: 90, J5: 0, J6: 45 });
  const [tcp, setTcp] = useState({ x: 0.354, y: 0.128, z: 0.448 });
  const [activePose, setActivePose] = useState("Home");
  const [simActive, setSimActive] = useState(true);

  const containerRef = useRef(null);
  const logContainerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  // Stream console logs
  useEffect(() => {
    if (!simActive) return;

    // Load initial logs
    setLogs(STATIC_LOGS.slice(0, 5));

    let logIndex = 5;
    const logInterval = setInterval(() => {
      setLogs((prev) => {
        const updated = [...prev, STATIC_LOGS[logIndex]];
        // Cap logs shown
        if (updated.length > 12) updated.shift();
        return updated;
      });

      // Advance logs pointer cyclically
      logIndex = (logIndex + 1) % STATIC_LOGS.length;
    }, 3500);

    return () => clearInterval(logInterval);
  }, [simActive]);

  // Scroll to bottom of terminal whenever new log is added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Random joint micro-fluctuations (simulating real-time sensor jitter/feedback loop)
  useEffect(() => {
    if (!simActive) return;

    const jitterInterval = setInterval(() => {
      setJoints((prev) => {
        const fluctuation = () => (Math.random() - 0.5) * 0.4;
        const newJ = {
          J1: Number((prev.J1 + fluctuation()).toFixed(2)),
          J2: Number((prev.J2 + fluctuation()).toFixed(2)),
          J3: Number((prev.J3 + fluctuation()).toFixed(2)),
          J4: Number((prev.J4 + fluctuation()).toFixed(2)),
          J5: Number((prev.J5 + fluctuation()).toFixed(2)),
          J6: Number((prev.J6 + fluctuation()).toFixed(2)),
        };

        // Recalculate dummy TCP coordinate vectors based on joint changes
        setTcp({
          x: Number((0.35 + (newJ.J1 + newJ.J2) * 0.0005).toFixed(4)),
          y: Number((0.12 + (newJ.J3 - newJ.J4) * 0.0005).toFixed(4)),
          z: Number((0.45 + (newJ.J5 + newJ.J6) * 0.0005).toFixed(4)),
        });

        return newJ;
      });
    }, 1500);

    return () => clearInterval(jitterInterval);
  }, [simActive]);

  // Preset Poses
  const triggerPose = (poseName, targetJoints) => {
    setActivePose(poseName);
    setSimActive(false); // Pause automatic jitter while sweeping

    setLogs((prev) => [
      ...prev,
      `[COMMAND] Requesting kinematic state transition to: ${poseName.toUpperCase()}`,
      `[SYS] Planning collision-free trajectory...`,
    ]);

    // Animate transition to joints targets
    let step = 0;
    const maxSteps = 20;
    const startJoints = { ...joints };

    const sweepInterval = setInterval(() => {
      step++;
      const progress = step / maxSteps;
      
      setJoints({
        J1: Number((startJoints.J1 + (targetJoints.J1 - startJoints.J1) * progress).toFixed(2)),
        J2: Number((startJoints.J2 + (targetJoints.J2 - startJoints.J2) * progress).toFixed(2)),
        J3: Number((startJoints.J3 + (targetJoints.J3 - startJoints.J3) * progress).toFixed(2)),
        J4: Number((startJoints.J4 + (targetJoints.J4 - startJoints.J4) * progress).toFixed(2)),
        J5: Number((startJoints.J5 + (targetJoints.J5 - startJoints.J5) * progress).toFixed(2)),
        J6: Number((startJoints.J6 + (targetJoints.J6 - startJoints.J6) * progress).toFixed(2)),
      });

      if (step >= maxSteps) {
        clearInterval(sweepInterval);
        setLogs((prev) => [
          ...prev,
          `[SYS] Kinematic state [${poseName.toUpperCase()}] reached. Deviation: 0.000deg.`,
        ]);
        setSimActive(true); // Resume jitter telemetry
      }
    }, 40);
  };

  return (
    <section ref={containerRef} className={styles.sectionContainer} id="simulation-section">
      <div className={styles.sectionHeader}>
        <span className={styles.subtitleCode}>// LOG_03.B: SIMULATION_LAB</span>
        <h2 className={styles.titleLarge}>3D Telemetry Viewer</h2>
      </div>

      <div className={styles.dashboardGrid}>
        
        {/* Left Telemetry Console */}
        <motion.div 
          className={styles.dashboardPanel}
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div className={styles.panelHeader}>
            <Cpu size={16} className={styles.panelIconBlue} />
            <span className={styles.panelTitle}>ROS2 CONTROL TELEMETRY</span>
            <div className={styles.statusPill}>
              <span className={styles.statusPulse} />
              LIVE FEED
            </div>
          </div>

          {/* Joint Sliders Indicators */}
          <div className={styles.panelBody}>
            <div className={styles.telemetryGroup}>
              <div className={styles.groupHeader}>JOINT ROTATIONAL STATES (DEG)</div>
              {Object.entries(joints).map(([key, val]) => (
                <div key={key} className={styles.jointRow}>
                  <span className={styles.jointLabel}>{key}</span>
                  <div className={styles.barContainer}>
                    <motion.div
                      className={styles.barFill}
                      animate={{ width: `${Math.min(Math.max((val + 180) / 3.6, 0), 100)}%` }}
                      transition={{ type: "spring", stiffness: 80 }}
                    />
                  </div>
                  <span className={styles.jointValue}>{val.toFixed(2)}°</span>
                </div>
              ))}
            </div>

            {/* Inverse Kinematics Output */}
            <div className={styles.vectorTelemetry}>
              <div className={styles.groupHeader}>TCP COORDINATES (METERS)</div>
              <div className={styles.vectorGrid}>
                <div className={styles.vectorItem}>
                  <span className={styles.vectorLabel}>X_POS:</span>
                  <span className={styles.vectorVal}>{tcp.x.toFixed(4)}m</span>
                </div>
                <div className={styles.vectorItem}>
                  <span className={styles.vectorLabel}>Y_POS:</span>
                  <span className={styles.vectorVal}>{tcp.y.toFixed(4)}m</span>
                </div>
                <div className={styles.vectorItem}>
                  <span className={styles.vectorLabel}>Z_POS:</span>
                  <span className={styles.vectorVal}>{tcp.z.toFixed(4)}m</span>
                </div>
              </div>
            </div>

            {/* Simulated Poses Controller */}
            <div className={styles.controlGroup}>
              <div className={styles.groupHeader}>TRIGGER MOTION PLAN</div>
              <div className={styles.buttonGrid}>
                <button
                  onClick={() => triggerPose("Home", { J1: 0, J2: 15, J3: -45, J4: 90, J5: 0, J6: 45 })}
                  className={`${styles.consoleBtn} ${activePose === "Home" ? styles.consoleBtnActive : ""}`}
                  data-cursor-hover
                  data-cursor-text="POSE: HOME"
                >
                  HOME
                </button>
                <button
                  onClick={() => triggerPose("Grasp", { J1: -45, J2: 60, J3: -10, J4: 120, J5: -45, J6: 90 })}
                  className={`${styles.consoleBtn} ${activePose === "Grasp" ? styles.consoleBtnActive : ""}`}
                  data-cursor-hover
                  data-cursor-text="POSE: GRASP"
                >
                  GRASP_POS
                </button>
                <button
                  onClick={() => triggerPose("Inspect", { J1: 90, J2: -30, J3: -90, J4: 45, J5: 45, J6: -45 })}
                  className={`${styles.consoleBtn} ${activePose === "Inspect" ? styles.consoleBtnActive : ""}`}
                  data-cursor-hover
                  data-cursor-text="POSE: SCAN"
                >
                  SCAN_CYCLE
                </button>
                <button
                  onClick={() => triggerPose("Stow", { J1: 180, J2: -15, J3: -120, J4: 180, J5: 0, J6: 0 })}
                  className={`${styles.consoleBtn} ${activePose === "Stow" ? styles.consoleBtnActive : ""}`}
                  data-cursor-hover
                  data-cursor-text="POSE: STOW"
                >
                  STOW_ARM
                </button>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Center 3D WebGL Canvas */}
        <motion.div 
          className={styles.canvasPanel}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {/* Dashboard HUD graphics overlay */}
          <div className={styles.canvasHUD}>
            <div className={styles.hudCrosshair} />
            <div className={styles.hudCornerTR} />
            <div className={styles.hudCornerTL} />
            <div className={styles.hudCornerBR} />
            <div className={styles.hudCornerBL} />
            <div className={styles.canvasLabel}>WebGL_RT // CAD_RENDER</div>
          </div>

          <div className={styles.splineContainer}>
            <spline-viewer
              url="https://prod.spline.design/IOg-s51tJs7GuT2D/scene.splinecode"
              hint="false"
              loading-anim-type="spinner"
            />
          </div>
        </motion.div>

        {/* Right Terminal Console Logs */}
        <motion.div 
          className={styles.dashboardPanel}
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div className={styles.panelHeader}>
            <Terminal size={16} className={styles.panelIconGreen} />
            <span className={styles.panelTitle}>DIAGNOSTIC MESSAGES (STDOUT)</span>
          </div>

          {/* Logs */}
          <div className={styles.terminalBody}>
            <div ref={logContainerRef} className={styles.logWrapper}>
              {logs.map((log, idx) => {
                let styleClass = styles.logInfo;
                if (log.includes("[SYS]")) styleClass = styles.logSystem;
                if (log.includes("[WARN]")) styleClass = styles.logWarn;
                if (log.includes("[COMMAND]")) styleClass = styles.logCommand;

                return (
                  <div key={idx} className={`${styles.logRow} ${styleClass}`}>
                    <span className={styles.logTick}>&gt;&gt;</span>
                    <span className={styles.logText}>{log}</span>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.terminalIndicatorGroup}>
              <span className={styles.terminalIndicatorItem}>
                <Activity size={12} style={{ color: "#00ff88" }} /> FLOW: BALANCED
              </span>
              <span className={styles.terminalIndicatorItem}>
                <ShieldAlert size={12} style={{ color: "#ff9a3c" }} /> WARN: NONE
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
