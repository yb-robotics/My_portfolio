import { useEffect } from 'react';
import gsap from 'gsap';

export default function useGSAPEntrance({
  containerRef,
  taglineRef,
  nameRef,
  subtitleRef,
  controlsRef,
  statusRef
}) {
  useEffect(() => {
    if (!containerRef || !containerRef.current) return;

    // Reset styles to avoid flashing on slow loads
    const container = containerRef.current;
    const tagline = taglineRef?.current;
    const name = nameRef?.current;
    const subtitle = subtitleRef?.current;
    const controls = controlsRef?.current;
    const status = statusRef?.current;

    // Set initial states
    gsap.set(container, { opacity: 0 });
    if (tagline) gsap.set(tagline, { opacity: 0, y: 20 });
    
    let nameParts = [];
    if (name) {
      nameParts = Array.from(name.children);
      if (nameParts.length > 0) {
        gsap.set(nameParts, { opacity: 0, y: 60 });
      } else {
        gsap.set(name, { opacity: 0, y: 60 });
      }
    }
    
    if (subtitle) gsap.set(subtitle, { opacity: 0, y: 25 });
    if (controls) gsap.set(controls, { opacity: 0, y: 15 });
    if (status) gsap.set(status, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // 1. Fade in the whole screen & video
    tl.to(container, {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out'
    });

    // 2. Tagline fades first
    if (tagline) {
      tl.to(tagline, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.6');
    }

    // 3. Name slides up staggered
    if (name) {
      const target = nameParts.length > 0 ? nameParts : name;
      tl.to(target, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.15
      }, '-=0.6');
    }

    // 4. Subtitle fades last
    if (subtitle) {
      tl.to(subtitle, {
        opacity: 0.8, // subtle dimness for subtext
        y: 0,
        duration: 0.8
      }, '-=0.6');
    }

    // 5. Controls and Status indicators fade in
    if (controls || status) {
      const elementsToFade = [];
      if (controls) elementsToFade.push(controls);
      if (status) elementsToFade.push(status);
      tl.to(elementsToFade, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1
      }, '-=0.4');
    }

    return () => {
      tl.kill();
    };
  }, [containerRef, taglineRef, nameRef, subtitleRef, controlsRef, statusRef]);
}
