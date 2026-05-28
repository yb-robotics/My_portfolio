import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function useGSAPGigsEntrance(containerRef, cardsClassName) {
  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll(cardsClassName);
    if (!cards || cards.length === 0) return;

    // Set initial states
    gsap.set(cards, {
      opacity: 0,
      y: 50,
      rotateX: 8,
      transformPerspective: 1000,
    });

    const anim = gsap.to(cards, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "power3.out",
      overwrite: "auto",
    });

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [containerRef, cardsClassName]);
}
