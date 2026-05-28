"use client";

import React, { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Hide standard cursor
    document.body.style.cursor = "none";

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Start offscreen
    dot.style.transform = "translate3d(-100px, -100px, 0)";
    ring.style.transform = "translate3d(-100px, -100px, 0)";
    dot.style.opacity = "0";
    ring.style.opacity = "0";

    const onMouseMove = (e) => {
      // Direct CSS styling update on mousemove event (fastest execution loop)
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      ring.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      
      // Make visible once cursor enters window bounds
      if (dot.style.opacity === "0") {
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Detect interactive elements to trigger hover sizing
      const interactiveEl = target.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor-hover]"
      );

      if (interactiveEl) {
        ring.classList.add(styles.cursorRingHovered);
        dot.classList.add(styles.cursorDotHovered);
      } else {
        ring.classList.remove(styles.cursorRingHovered);
        dot.classList.remove(styles.cursorDotHovered);
      }
    };

    const onMouseLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onMouseEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  return (
    <>
      {/* 1. Interactive Outer Reticle Ring */}
      <div
        ref={ringRef}
        className={styles.cursorRing}
      >
        <div className={styles.reticleTickTop} />
        <div className={styles.reticleTickBottom} />
        <div className={styles.reticleTickLeft} />
        <div className={styles.reticleTickRight} />
        <div className={styles.innerDashedCircle} />
      </div>

      {/* 2. Center Target Dot */}
      <div
        ref={dotRef}
        className={styles.cursorDot}
      />
    </>
  );
}
