"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Projects.module.css';

const PROJECTS_DATA = [
  {
    id: "rocker-boggie-rover",
    num: "01 // MECHATRONICS",
    title: "Rocker-Boggie Suspension Rover",
    desc: "Designed and manufactured a planetary exploration rover with Rocker-Boggie suspension system. Performed structural FEA optimization and completed the full physical assembly.",
    video: "/rover-working.mp4",
    tags: ["SolidWorks", "3D Printing", "FEA", "CAD Design"],
    specs: { key1: "DRIVE", val1: "6-Wheel DC", key2: "WEIGHT", val2: "4.8kg", key3: "LOAD", val3: "8.0kg" }
  },
  {
    id: "esp32-robotic-arm",
    num: "02 // CONTROL SYSTEMS",
    title: "ESP32 Robotic Arm Bot",
    desc: "Constructed an autonomous articulated robotic arm mounted on a mobile chassis. Configured multi-axis kinematics and custom torque profiles for high-accuracy grasping tasks.",
    video: "/robotic-arm.mp4",
    tags: ["C++", "Kinematics", "ESP8266", "Motors"],
    specs: { key1: "DOF", val1: "4 + Gripper", key2: "REACH", val2: "450mm", key3: "MCU", val3: "ESP32" }
  },
  {
    id: "autonomous-firefighter",
    num: "03 // EMBEDDED FIRMWARE",
    title: "Autonomous Firefighter Bot",
    desc: "Developed a tracked firefighter crawler bot that detects infrared heat signatures of fires and navigates autonomously to deploy flame-extinguishing payloads.",
    video: "/firebot.mp4",
    tags: ["Embedded C", "Sensors", "Mechatronics", "PCB Design"],
    specs: { key1: "CHASSIS", val1: "Tracked", key2: "SENSOR", val2: "Flame-IR", key3: "DRIVE", val3: "Dual-H" }
  },
  {
    id: "ros2-slam-simulation",
    num: "04 // ROBOTICS SOFTWARE",
    title: "ROS2 SLAM Navigation Simulation",
    desc: "Built simulated environments in Gazebo to benchmark autonomous navigation stacks. Integrated Lidar data and Cartesian SLAM map optimization using the ROS2 Nav2 framework.",
    video: "/slam-simulation.mp4",
    tags: ["ROS2", "SLAM", "Gazebo", "Python", "Nav2"],
    specs: { key1: "STACK", val1: "Nav2", key2: "SLAM", val2: "Cartographer", key3: "SIM", val3: "Gazebo" }
  }
];

// Sub-component to isolate 3D tilt state for each project card
function ProjectCard({ proj, idx, activeCard, handleMouseEnter, handleMouseLeave }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const router = useRouter();

  // Mouse position inside card, normalized from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for springy, high-end feel
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { damping: 25, stiffness: 240 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { damping: 25, stiffness: 240 });
  
  const cardScale = useSpring(activeCard === idx ? 1.02 : 1, { damping: 30, stiffness: 300 });

  // Play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => console.log("Video autoplay failed:", err));
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleHoverStart = () => {
    handleMouseEnter(idx);
  };

  const handleHoverEnd = () => {
    x.set(0);
    y.set(0);
    handleMouseLeave(idx);
  };

  const handleCardClick = () => {
    router.push(`/projects/${proj.id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        scale: cardScale,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className={`${styles.card} ${activeCard === idx ? styles.cardActive : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onClick={handleCardClick}
      data-cursor-hover
      data-cursor-text={`DETAILS // ${proj.title.split(' ')[0].toUpperCase()}`}
    >
      {/* Blueprint Grid Background when Idle */}
      <div className={styles.blueprintBg} />

      {/* Hover Video Layer */}
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.projectVideo}
          src={proj.video}
          loop
          muted
          playsInline
          autoPlay
        />
      </div>

      {/* Content Overlays */}
      <div className={styles.cardOverlay} style={{ transform: "translateZ(30px)" }}>
        <div className={styles.cardHeader}>
          <div className={styles.techTags}>
            {proj.tags.map((tag, tIdx) => (
              <span key={tIdx} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <span className={styles.projectNum}>{proj.num}</span>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.projectTitle}>{proj.title}</h3>
          <p className={styles.projectDesc}>{proj.desc}</p>
          
          <div className={styles.specSheet}>
            <div className={styles.specItem}>
              {proj.specs.key1}: <span>{proj.specs.val1}</span>
            </div>
            <div className={styles.specItem}>
              {proj.specs.key2}: <span>{proj.specs.val2}</span>
            </div>
            <div className={styles.specItem}>
              {proj.specs.key3}: <span>{proj.specs.val3}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [activeCard, setActiveCard] = useState(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards = cardsRef.current.filter(Boolean);
    const triggers = [];

    // Set up ScrollTrigger stacking animations for cards 1, 2, 3
    for (let i = 1; i < cards.length; i++) {
      const prevCard = cards[i - 1];
      const currentCard = cards[i];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: currentCard,
          start: "top bottom", // when the top of the entering card hits the bottom of the viewport
          end: "top 80px",     // when it reaches its sticky position (80px top)
          scrub: true,
        }
      });

      // Animate previous card: scale down, move up, dim opacity
      tl.to(prevCard, {
        scale: 0.92,
        y: -24,
        opacity: 0.6,
        ease: "none"
      }, 0);

      // Animate current card: slide up and fade in
      tl.fromTo(currentCard,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, ease: "none" },
        0
      );

      triggers.push(tl.scrollTrigger);
    }

    return () => {
      triggers.forEach(t => t.kill());
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className={styles.sectionContainer} id="projects-section">
      <div className={styles.sectionHeader}>
        <span className={styles.subtitleCode}>// LOG_02: EXPERIMENTS</span>
        <h2 className={styles.titleLarge}>Robotics Projects</h2>
      </div>

      <div className={styles.stackContainer}>
        {PROJECTS_DATA.map((proj, idx) => (
          <div
            key={idx}
            ref={(el) => (cardsRef.current[idx] = el)}
            className={styles.cardContainer}
            style={{ 
              zIndex: idx + 1,
              opacity: idx === 0 ? 1 : 0 // prevent flashing on load
            }}
          >
            <ProjectCard
              proj={proj}
              idx={idx}
              activeCard={activeCard}
              handleMouseEnter={setActiveCard}
              handleMouseLeave={() => setActiveCard(null)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
