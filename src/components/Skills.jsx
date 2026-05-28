"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Skills.module.css';

const SKILLS_DATA = [
  {
    category: "Robotics Software",
    class: styles.catSoftware,
    skills: [
      { name: "ROS2 (Robot Operating System)", level: 90 },
      { name: "Nav2 / Cartographer SLAM", level: 85 },
      { name: "Python (Robotics Scripts)", level: 88 },
      { name: "C++ (Algorithmic Logic)", level: 82 }
    ],
    svgPath: "M0,35 Q40,10 80,35 T160,35 T240,35 T320,35 T400,35"
  },
  {
    category: "Mechanical Design",
    class: styles.catHardware,
    skills: [
      { name: "SolidWorks (Mechatronic CAD)", level: 92 },
      { name: "Ansys Structural FEA", level: 80 },
      { name: "Rapid Prototyping (3D Print/DFM)", level: 85 },
      { name: "Linkage & Actuation Design", level: 78 }
    ],
    svgPath: "M0,35 C50,0 75,70 120,35 C160,10 180,60 220,35 C260,20 280,50 320,35 C360,25 380,45 400,35"
  },
  {
    category: "Embedded & Control",
    class: styles.catControl,
    skills: [
      { name: "Control Systems (PID / Kinematics)", level: 88 },
      { name: "STM32 & Arduino Firmware", level: 90 },
      { name: "Sensor Fusion (IMU / Odometry)", level: 82 },
      { name: "IoT Protocols (ESP8266 WiFi)", level: 84 }
    ],
    svgPath: "M0,35 L40,35 L40,10 L80,10 L80,60 L120,60 L120,35 L160,35 L160,10 L200,10 L200,60 L240,60 L240,35 L400,35"
  }
];

export default function Skills() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-12%" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <section ref={containerRef} className={styles.sectionContainer} id="skills-section">
      <div className={styles.sectionHeader}>
        <span className={styles.subtitleCode}>// LOG_03: TELEMETRY</span>
        <h2 className={styles.titleLarge}>Engineering Competencies</h2>
      </div>

      <motion.div 
        className={styles.categories}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {SKILLS_DATA.map((cat, idx) => (
          <motion.div 
            key={idx} 
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.3 } }}
            className={`${styles.categoryCard} ${cat.class}`}
            data-cursor-hover
            data-cursor-text={`VIEW // ${cat.category.split(' ')[0].toUpperCase()}`}
          >
            {/* Background Oscilloscope SVG widget */}
            <svg className={styles.oscilloscopeBg} viewBox="0 0 400 70" preserveAspectRatio="none">
              <line x1="0" y1="35" x2="400" y2="35" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3,3" />
              <line x1="100" y1="0" x2="100" y2="70" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3,3" />
              <line x1="200" y1="0" x2="200" y2="70" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3,3" />
              <line x1="300" y1="0" x2="300" y2="70" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3,3" />
              <path
                d={cat.svgPath}
                fill="none"
                stroke={
                  cat.class.includes('catSoftware') ? THEME_COLOR_SOFTWARE() :
                  cat.class.includes('catHardware') ? THEME_COLOR_HARDWARE() :
                  THEME_COLOR_CONTROL()
                }
                strokeWidth="1.2"
                opacity="0.35"
              />
            </svg>

            <div className={styles.cardContent}>
              <h3 className={styles.categoryTitle}>
                <span className={styles.categoryDot} />
                {cat.category}
              </h3>

              <div className={styles.skillsList}>
                {cat.skills.map((skill, sIdx) => (
                  <div key={sIdx} className={styles.skillItem}>
                    <div className={styles.skillMeta}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <span className={styles.skillValue}>{skill.level}%</span>
                    </div>
                    <div className={styles.track}>
                      <motion.div
                        className={styles.bar}
                        initial={{ width: "0%" }}
                        animate={isInView ? { width: `${skill.level}%` } : { width: "0%" }}
                        transition={{ duration: 1.4, delay: 0.1 + (sIdx * 0.08), ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// Helpers for inline SVG stroke coloring mapping constants
function THEME_COLOR_SOFTWARE() { return '#00ff88'; }
function THEME_COLOR_HARDWARE() { return '#ff9a3c'; }
function THEME_COLOR_CONTROL()  { return '#00d4ff'; }
