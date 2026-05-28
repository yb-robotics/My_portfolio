"use client";

import React, { useRef } from "react";
import { useLenis } from "lenis/react";
import styles from "./ScrollProgressBar.module.css";

export default function ScrollProgressBar() {
  const barRef = useRef(null);

  useLenis(({ progress }) => {
    if (barRef.current) {
      barRef.current.style.width = `${progress * 100}%`;
    }
  });

  return <div ref={barRef} className={styles.progressBar} />;
}
