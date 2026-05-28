"use client";

import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-section');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine active section based on scroll offset
      const sections = ['hero-section', 'projects-section', 'contact-section'];
      const scrollPos = window.scrollY + 200; // Offset

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <a href="#hero-section" onClick={(e) => handleNavClick(e, 'hero-section')} className={styles.logo}>
        <span className={styles.statusDot} />
        YB // ROBOTICS
      </a>

      <nav className={styles.nav}>
        <a
          href="#hero-section"
          onClick={(e) => handleNavClick(e, 'hero-section')}
          className={`${styles.navLink} ${activeSection === 'hero-section' ? styles.activeLink : ''}`}
        >
          <span>01 // </span>HERO
        </a>
        <a
          href="#projects-section"
          onClick={(e) => handleNavClick(e, 'projects-section')}
          className={`${styles.navLink} ${activeSection === 'projects-section' ? styles.activeLink : ''}`}
        >
          <span>02 // </span>PROJECTS
        </a>
        <a
          href="#contact-section"
          onClick={(e) => handleNavClick(e, 'contact-section')}
          className={styles.contactBtn}
        >
          CONNECT_
        </a>
      </nav>
    </header>
  );
}
