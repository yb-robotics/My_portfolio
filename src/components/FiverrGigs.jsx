"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Clock, CheckCircle2, ShoppingBag, Radio } from "lucide-react";
import styles from "./FiverrGigs.module.css";

import useGSAPGigsEntrance from "../hooks/useGSAPGigsEntrance";

const GIGS_DATA = [
  {
    title: "ROS2 Autonomous Navigation & SLAM Setup",
    desc: "Complete setup of ROS2 Humble/Iron navigation stacks. I configure URDF descriptions, tune Cartographer SLAM nodes, map physical spaces, and program Nav2 local path planners in Gazebo.",
    price: "295",
    delivery: "7 Days",
    rating: "5.0",
    reviews: "48",
    bullets: [
      "Dynamic URDF/Xacro configuration",
      "Cartographer SLAM parameter tuning",
      "Nav2 costmap & DWB path planner setup",
      "Full Gazebo simulation environment"
    ],
    fiverrUrl: "https://fiverr.com"
  },
  {
    title: "Mechatronic 3D CAD Design & DFM in SolidWorks",
    desc: "Mechanical linkages, chassis framing, and assembly layouts designed for physical manufacturing. I perform structural FEA load buckling analyses and optimize parts for DFM 3D printing.",
    price: "185",
    delivery: "5 Days",
    rating: "5.0",
    reviews: "36",
    bullets: [
      "SolidWorks 3D parts & assembly models",
      "DFM optimization (3D Print/CNC/Laser)",
      "Ansys structural FEA stress tests",
      "2D technical engineering drawings"
    ],
    fiverrUrl: "https://fiverr.com"
  },
  {
    title: "Custom Embedded Firmware & PID Control Loops",
    desc: "High-accuracy embedded code written in C/C++ for STM32, Arduino, and ESP32. I wire MPU IMU sensor fusion filter loops, custom PID motor actuators, and ESP-NOW communication vectors.",
    price: "145",
    delivery: "4 Days",
    rating: "4.9",
    reviews: "52",
    bullets: [
      "STM32 / ESP32 C++ firmware code",
      "Closed-loop PID velocity control tuning",
      "IMU sensor fusion (Complementary/Kalman)",
      "Wireless IoT modules (WebSockets/WiFi)"
    ],
    fiverrUrl: "https://fiverr.com"
  }
];

export default function FiverrGigs() {
  const containerRef = useRef(null);

  // Hook up GSAP ScrollTrigger entrance
  useGSAPGigsEntrance(containerRef, `.${styles.cardContainer}`);

  return (
    <section ref={containerRef} className={styles.sectionContainer} id="gigs-section">
      
      <div className={styles.sectionHeader}>
        <span className={styles.subtitleCode}>// LOG_03.C: COMMISSIONS</span>
        <h2 className={styles.titleLarge}>Freelance Services</h2>
      </div>

      <div className={styles.gigsGrid}>
        {GIGS_DATA.map((gig, idx) => (
          <div key={idx} className={styles.cardContainer}>
            <motion.div 
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={styles.gigCard}
            >
              {/* Holographic Header bar */}
              <div className={styles.gigHeader}>
                <div className={styles.ratingBox}>
                  <Star size={12} fill="#ffcc00" stroke="#ffcc00" />
                  <span className={styles.ratingValue}>{gig.rating}</span>
                  <span className={styles.reviewCount}>({gig.reviews})</span>
                </div>
                <div className={styles.activePulse}>
                  <Radio size={12} className={styles.pulseIcon} />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Service details */}
              <div className={styles.gigBody}>
                <h3 className={styles.gigTitle}>{gig.title}</h3>
                <p className={styles.gigDesc}>{gig.desc}</p>

                {/* Deliverables checklist */}
                <div className={styles.bulletList}>
                  {gig.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className={styles.bulletRow}>
                      <CheckCircle2 size={13} className={styles.checkIcon} />
                      <span className={styles.bulletText}>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer pricing info */}
              <div className={styles.gigFooter}>
                <div className={styles.detailsRow}>
                  <div className={styles.deliveryInfo}>
                    <Clock size={13} />
                    <span>{gig.delivery}</span>
                  </div>
                  <div className={styles.priceInfo}>
                    <span className={styles.priceLabel}>STARTING AT:</span>
                    <span className={styles.priceValue}>${gig.price}</span>
                  </div>
                </div>

                <a 
                  href={gig.fiverrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fiverrBtn}
                  data-cursor-hover
                  data-cursor-text="ORDER GIG"
                >
                  <ShoppingBag size={14} />
                  <span>ORDER ON FIVERR</span>
                </a>
              </div>

            </motion.div>
          </div>
        ))}
      </div>

    </section>
  );
}
