"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Cpu, Compass, HardDrive, ShieldCheck, GitBranch } from "lucide-react";
import styles from "./ProjectDetails.module.css";

const PROJECTS_DETAILS_DATA = {
  "rocker-boggie-rover": {
    title: "Rocker-Boggie Suspension Rover",
    category: "MECHATRONICS & DFM",
    num: "LOG_01",
    desc: "A planetary exploration platform utilizing a passive rocker-boggie suspension architecture. Engineered to traverse uneven terrain with high stability, maintaining all 6 wheels in contact with the ground on obstacle scaling. Completed the full CAD layout, structural FEA stress optimization, DFM 3D print parameters, and physical mechatronics assembly.",
    video: "/rover-working.mp4",
    github: "https://github.com/yashbansal/rocker-boggie-rover",
    specs: [
      { name: "Chassis Susp", value: "Rocker-Boggie (Passive)" },
      { name: "Drive Actuators", value: "6x DC Metal Gearmotors" },
      { name: "Unit Weight", value: "4.8 kg" },
      { name: "Max Payload", value: "8.0 kg" },
      { name: "Power Source", value: "3S LiPo 11.1V 5000mAh" },
      { name: "Obstacle Max", value: "140mm Vertical Scale" }
    ],
    phases: [
      { title: "PHASE 01: CAD & Suspension kinematics", desc: "Designed full linkage kinematics in SolidWorks. Modeled joints to withstand a 2.5G deceleration shock profile." },
      { title: "PHASE 02: FEA Stress Optimization", desc: "Ran Ansys structural FEA tests. Reduced raw structural material thickness, trimming weight by 18% without buckling risks." },
      { title: "PHASE 03: Manufacturing & DFM", desc: "3D printed main linkages in high-density PETG with 60% infill. Hand-assembled differential bars and motor hubs." }
    ],
    commits: [
      { date: "2026-05-18", msg: "fix: resolved structural buckling points on rocker pivot" },
      { date: "2026-05-12", msg: "feat: calibrated motor speed matching differential vectors" },
      { date: "2026-05-02", msg: "chore: finalized SolidWorks assembly 3D CAD blueprint file" }
    ]
  },
  "esp32-robotic-arm": {
    title: "ESP32 Robotic Arm Bot",
    category: "ROBOTICS & CONTROL SYSTEMS",
    num: "LOG_02",
    desc: "A multi-axis articulated robotic arm mounted on an omnidirectional mobile base. Programmed multi-axis inverse kinematics, closed-loop servo torque feedback profiles, and custom coordinate mapping to carry out precise autonomous pickup, translation, and sorting operations.",
    video: "/robotic-arm.mp4",
    github: "https://github.com/yashbansal/esp32-robotic-arm",
    specs: [
      { name: "Joint Degree", value: "4 DOF + Gripper Claw" },
      { name: "Actuator Types", value: "Closed-loop High Torque Servos" },
      { name: "Microcontroller", value: "ESP32 (Dual-Core 240MHz)" },
      { name: "Arm Reach", value: "450 mm" },
      { name: "Input Logic", value: "Inverse Kinematics (IK) Matrix" },
      { name: "Comm Link", value: "ESP-NOW & WebSockets" }
    ],
    phases: [
      { title: "PHASE 01: Joint Armatures design", desc: "Calculated torque ratios and motor sizing requirements. Built linkage drawings in SolidWorks." },
      { title: "PHASE 02: Kinematic Solver Coding", desc: "Programmed analytical Inverse Kinematics equations directly in C++ on the ESP32 to map coordinate targets (X, Y, Z)." },
      { title: "PHASE 03: Loop Feedback Tuning", desc: "Tuned joint position gains to suppress oscillations under full physical payload capacity." }
    ],
    commits: [
      { date: "2026-05-24", msg: "feat: implemented WebSocket telemetry broadcast stream" },
      { date: "2026-05-15", msg: "fix: corrected kinematic singularities in J3 pitch sweep" },
      { date: "2026-05-08", msg: "feat: optimized joint speed profiles using trapezoidal curves" }
    ]
  },
  "autonomous-firefighter": {
    title: "Autonomous Firefighter Bot",
    category: "EMBEDDED SYSTEMS & FIRMWARE",
    num: "LOG_03",
    desc: "A tracked robotic firefighter crawler engineered to autonomously search, locate, and extinguish small fire outbreaks in indoor locations. Integrates array flame infrared heat signature sensors, ultrasonic obstacles collision checkers, and a dual H-bridge motor driver to direct onboard extinguishing payloads.",
    video: "/firebot.mp4",
    github: "https://github.com/yashbansal/autonomous-firefighter",
    specs: [
      { name: "Drive System", value: "Dual Continuous Track Belts" },
      { name: "Extinguish Load", value: "Water Pump + 500ml Tank" },
      { name: "Main Controller", value: "STM32F103 (ARM Cortex-M3)" },
      { name: "Thermal Scan", value: "5-Array IR Flame Sensors" },
      { name: "Obstacle Check", value: "3x Ultrasonic Sonar Rings" },
      { name: "Extinguish Range", value: "Up to 300 mm" }
    ],
    phases: [
      { title: "PHASE 01: PCB Board Design", desc: "Designed custom power regulation and logic routing board in EasyEDA. Assembled boards with SMD soldering." },
      { title: "PHASE 02: Sensor Fusion Loops", desc: "Programmed ADC sensor reading loops in Embedded C to filter background heat and locate fire centroids." },
      { title: "PHASE 03: Extinguisher Test", desc: "Wired relay-driven water pump. Designed nozzle mounts to direct extinguishing stream accurately." }
    ],
    commits: [
      { date: "2026-05-20", msg: "feat: updated sonar obstacle avoidance interrupt triggers" },
      { date: "2026-05-14", msg: "fix: resolved battery voltage drops on pump relay fire" },
      { date: "2026-05-03", msg: "chore: finalized dual H-bridge layout routing traces" }
    ]
  },
  "ros2-slam-simulation": {
    title: "ROS2 SLAM Navigation Simulation",
    category: "AUTONOMOUS AGENTS & AI",
    num: "LOG_04",
    desc: "A virtual testing pipeline developed in Gazebo to benchmark robot navigation and cartography stacks. Wired ROS2 Nav2 mapping controllers, Cartesian SLAM algorithms, and lidar sensory inputs to benchmark path efficiency and SLAM map accuracy.",
    video: "/slam-simulation.mp4",
    github: "https://github.com/yashbansal/ros2-slam-simulation",
    specs: [
      { name: "OS / ROS Distro", value: "Ubuntu 22.04 / ROS2 Humble" },
      { name: "SLAM Engine", value: "Google Cartographer SLAM" },
      { name: "Simulation Core", value: "Gazebo Classic Node" },
      { name: "Path Planner", value: "Nav2 (NavFn / DWB local)" },
      { name: "Sensor Inputs", value: "2D Laser Scan + Wheel Odometry" },
      { name: "Visualizer Tool", value: "RViz2 Telemetry Node" }
    ],
    phases: [
      { title: "PHASE 01: Environment CAD Import", desc: "Imported industrial lab CAD models into Gazebo and generated Gazebo colliders." },
      { title: "PHASE 02: SLAM Node Config", desc: "Wired lidar odometry transforms. Tuned Cartographer parameters to minimize mapping drift." },
      { title: "PHASE 03: Nav2 Path Tuning", desc: "Configured DWB local planner costmaps. Allowed robot to clear obstacles and plan paths at 0.5m/s." }
    ],
    commits: [
      { date: "2026-05-26", msg: "feat: added customized costmap layers for Gazebo tables" },
      { date: "2026-05-18", msg: "fix: resolved TF /odom to /base_link transform jumps" },
      { date: "2026-05-10", msg: "chore: configured Cartographer node parameter YAML files" }
    ]
  }
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const projectId = params.id;
    if (projectId && PROJECTS_DETAILS_DATA[projectId]) {
      setProject(PROJECTS_DETAILS_DATA[projectId]);
    }
  }, [params.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => console.log("Video play failed:", err));
    }
  }, [project]);

  if (!project) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
        <span className={styles.loaderText}>RETRIEVING TELEMETRY DATA...</span>
      </div>
    );
  }

  return (
    <main className={styles.mainContainer}>
      
      {/* 1. Glassy Top-Level Nav Bar */}
      <header className={styles.detailHeader}>
        <button 
          onClick={() => router.push("/#projects-section")}
          className={styles.backBtn}
          data-cursor-hover
          data-cursor-text="BACK TO CORE"
        >
          <ArrowLeft size={16} />
          <span>BACK TO LAB VIEWPORT</span>
        </button>

        <div className={styles.projectCategory}>
          <span className={styles.pulsarDot} />
          {project.category}
        </div>
      </header>

      {/* 2. Grid Dashboard */}
      <div className={styles.contentGrid}>
        
        {/* Left Column: Visual Showcase & Specs */}
        <div className={styles.leftCol}>
          
          {/* Main Video Frame */}
          <motion.div 
            className={styles.mediaCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.hudOverlay}>
              <div className={styles.hudCornerTL} />
              <div className={styles.hudCornerTR} />
              <div className={styles.hudCornerBL} />
              <div className={styles.hudCornerBR} />
              <span className={styles.hudLabel}>{project.num} // VIDEO_FEED</span>
            </div>
            
            <video
              ref={videoRef}
              className={styles.videoPlayer}
              src={project.video}
              loop
              muted
              playsInline
              controls
              autoPlay
            />
          </motion.div>

          {/* Telemetry Specification Sheet */}
          <motion.div 
            className={styles.specsCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className={styles.cardTitleRow}>
              <Cpu size={15} className={styles.iconBlue} />
              <h3 className={styles.cardHeader}>MECHATRONIC TELEMETRY SPECS</h3>
            </div>
            <div className={styles.specsGrid}>
              {project.specs.map((spec, idx) => (
                <div key={idx} className={styles.specRow}>
                  <span className={styles.specName}>{spec.name}</span>
                  <span className={styles.specDot} />
                  <span className={styles.specValue}>{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Column: Descriptions, Phases & Git Commits */}
        <div className={styles.rightCol}>
          
          {/* Overview text */}
          <motion.div 
            className={styles.descriptionCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className={styles.projectTitle}>{project.title}</h1>
            <p className={styles.projectDescriptionText}>{project.desc}</p>
            
            {/* Quick Action Button links */}
            <div className={styles.actionRow}>
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.actionLink}
                data-cursor-hover
                data-cursor-text="GOTO REPO"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "2px" }}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span>GITHUB REPOSITORY</span>
              </a>
              <button 
                onClick={() => alert("Documentation payload packaged. Syncing download...")}
                className={`${styles.actionLink} ${styles.actionLinkAlt}`}
                data-cursor-hover
                data-cursor-text="DOWNLOAD PDF"
              >
                <FileText size={16} />
                <span>TECH DOCUMENTATION</span>
              </button>
            </div>
          </motion.div>

          {/* Build Phases Timeline */}
          <motion.div 
            className={styles.timelineCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.cardTitleRow}>
              <Compass size={15} className={styles.iconAmber} />
              <h3 className={styles.cardHeader}>ENGINEERING BUILD LIFECYCLE</h3>
            </div>
            <div className={styles.timelineList}>
              {project.phases.map((phase, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelinePoint}>
                    <div className={styles.pointDot} />
                    <div className={styles.pointLine} />
                  </div>
                  <div className={styles.timelineContent}>
                    <h4 className={styles.phaseTitle}>{phase.title}</h4>
                    <p className={styles.phaseDesc}>{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Git Commits Feed */}
          <motion.div 
            className={styles.gitCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className={styles.cardTitleRow}>
              <GitBranch size={15} className={styles.iconGreen} />
              <h3 className={styles.cardHeader}>PROJECT COMMIT LOGS (BRANCH: /MAIN)</h3>
            </div>
            <div className={styles.commitFeed}>
              {project.commits.map((commit, idx) => (
                <div key={idx} className={styles.commitRow}>
                  <span className={styles.commitDate}>{commit.date}</span>
                  <span className={styles.commitText}>&gt;&gt; {commit.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>

    </main>
  );
}
