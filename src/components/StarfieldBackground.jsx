"use client";

import React, { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

export default function StarfieldBackground() {
  const canvasRef = useRef(null);
  const simSectionRef = useRef(null);
  
  // Track scroll and velocity
  const scrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);

  // Retrieve scroll and velocity from Lenis context
  useLenis(({ scroll, velocity }) => {
    scrollYRef.current = scroll;
    scrollVelocityRef.current = velocity;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let stars = [];
    let shootingStars = [];
    let nebulaParticles = [];

    // Color interpolation function
    const interpolateColor = (baseR, baseG, baseB, targetR, targetG, targetB, factor) => {
      const r = Math.round(baseR + (targetR - baseR) * factor);
      const g = Math.round(baseG + (targetG - baseG) * factor);
      const b = Math.round(baseB + (targetB - baseB) * factor);
      return { r, g, b };
    };

    // Track viewport bounds
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initElements();
    };

    // Initialize stars and nebulae
    const initElements = () => {
      stars = [];
      nebulaParticles = [];
      shootingStars = [];

      // Exactly 150 stars split into 3 layers (50 each)
      const starsPerLayer = 50;
      const totalStars = starsPerLayer * 3;
      
      for (let i = 0; i < totalStars; i++) {
        const layer = Math.floor(i / starsPerLayer) + 1; // 1, 2, or 3
        let radius, baseOpacity;
        if (layer === 1) {
          radius = Math.random() * 0.8 + 1.1; // 1.1 - 1.9 (near)
          baseOpacity = 0.95;
        } else if (layer === 2) {
          radius = Math.random() * 0.5 + 0.6; // 0.6 - 1.1 (mid)
          baseOpacity = 0.75;
        } else {
          radius = Math.random() * 0.3 + 0.25; // 0.25 - 0.55 (far)
          baseOpacity = 0.5;
        }

        const isCyan = Math.random() > 0.8; // 20% cyan stars, 80% white stars
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          brightness: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          isColorShiftable: isCyan,
          // Color components
          r: isCyan ? 0 : 255,
          g: isCyan ? 212 : 255,
          b: isCyan ? 255 : 255,
          a: baseOpacity,
          layer,
        });
      }

      // Soft nebula gas clouds (drifting very slowly)
      const nebulaCount = 5;
      for (let i = 0; i < nebulaCount; i++) {
        const isPurple = i % 2 === 0;
        nebulaParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 150 + 100,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          // Base RGBA colors (purple or cyan)
          r: isPurple ? 139 : 6,
          g: isPurple ? 92 : 182,
          b: isPurple ? 246 : 212,
          a: isPurple ? 0.02 : 0.015,
        });
      }
    };

    // Spawn a shooting star periodically
    const spawnShootingStar = (velocity) => {
      const isHighVelocity = Math.abs(velocity) > 8;
      const spawnChance = isHighVelocity ? 0.12 : 0.01;
      const maxShootingStars = isHighVelocity ? 15 : 2;

      if (Math.random() < spawnChance && shootingStars.length < maxShootingStars) {
        const speedMultiplier = isHighVelocity ? 3.0 : 1.0;
        shootingStars.push({
          x: Math.random() * canvas.width * 0.7 + canvas.width * 0.3,
          y: 0,
          length: (Math.random() * 80 + 40) * (isHighVelocity ? 2.5 : 1.0),
          speed: (Math.random() * 8 + 4) * speedMultiplier,
          dx: (-Math.random() * 4 - 4) * speedMultiplier,
          dy: (Math.random() * 4 + 4) * speedMultiplier,
          opacity: 1.0,
          isHighVelocity,
        });
      }
    };

    // Primary render tick
    const draw = () => {
      // Clear canvas with space backdrop
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const velocity = scrollVelocityRef.current;

      // Calculate amber shifting factor near mechatronics section
      if (!simSectionRef.current && typeof document !== "undefined") {
        simSectionRef.current = document.getElementById("simulation-section");
      }

      let amberFactor = 0;
      if (simSectionRef.current) {
        const rect = simSectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const sectionCenter = rect.top + rect.height / 2;
        const distFromCenter = Math.abs(viewportHeight / 2 - sectionCenter);
        // Transition within 1.2x viewport height from section center
        const transitionRange = viewportHeight * 1.2;
        amberFactor = Math.max(0, Math.min(1, 1 - distFromCenter / transitionRange));
      }

      // Amber target color (Spline scene lighting)
      const targetAmber = { r: 255, g: 154, b: 60 };

      // 1. Draw Nebula Gas Glows
      nebulaParticles.forEach((gas) => {
        gas.x += gas.vx;
        gas.y += gas.vy;

        // Bounce off canvas boundaries
        if (gas.x < -gas.radius || gas.x > canvas.width + gas.radius) gas.vx *= -1;
        if (gas.y < -gas.radius || gas.y > canvas.height + gas.radius) gas.vy *= -1;

        // Interpolate colors towards amber
        let drawR = gas.r;
        let drawG = gas.g;
        let drawB = gas.b;
        if (amberFactor > 0) {
          const interpolated = interpolateColor(
            gas.r, gas.g, gas.b,
            targetAmber.r, targetAmber.g, targetAmber.b,
            amberFactor
          );
          drawR = interpolated.r;
          drawG = interpolated.g;
          drawB = interpolated.b;
        }

        const grad = ctx.createRadialGradient(gas.x, gas.y, 0, gas.x, gas.y, gas.radius);
        grad.addColorStop(0, `rgba(${drawR}, ${drawG}, ${drawB}, ${gas.a})`);
        grad.addColorStop(1, "rgba(5, 5, 8, 0)");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gas.x, gas.y, gas.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw & Twinkle Stars
      stars.forEach((star) => {
        // Multi-depth velocity response
        // Layer 1 (near): moves at 0.08x scroll velocity
        // Layer 2 (mid): moves at 0.04x scroll velocity
        // Layer 3 (far): moves at 0.01x scroll velocity
        let depthFactor = 0.01;
        if (star.layer === 1) depthFactor = 0.08;
        else if (star.layer === 2) depthFactor = 0.04;

        // Move star y position reactive to scroll velocity
        star.y += velocity * depthFactor;

        // Wrap around canvas height vertically (modulo-like boundaries check)
        if (star.y < 0) {
          star.y = canvas.height + (star.y % canvas.height);
        } else if (star.y > canvas.height) {
          star.y = star.y % canvas.height;
        }

        // Increment twinkle brightness state
        star.brightness += star.twinkleSpeed;
        if (star.brightness > 1 || star.brightness < 0) {
          star.twinkleSpeed *= -1;
        }

        // Interpolate hue from purple/cyan toward amber near SimulationLab
        let drawR = star.r;
        let drawG = star.g;
        let drawB = star.b;
        if (star.isColorShiftable && amberFactor > 0) {
          const interpolated = interpolateColor(
            star.r, star.g, star.b,
            targetAmber.r, targetAmber.g, targetAmber.b,
            amberFactor
          );
          drawR = interpolated.r;
          drawG = interpolated.g;
          drawB = interpolated.b;
        }

        const alpha = (star.brightness * 0.6 + 0.2) * star.a;

        // Draw star dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${drawR}, ${drawG}, ${drawB}, ${alpha.toFixed(2)})`;
        ctx.fill();
      });

      // 3. Draw & Advance Shooting Stars
      spawnShootingStar(velocity);
      shootingStars.forEach((star, index) => {
        star.x += star.dx;
        star.y += star.dy;
        
        // Decay faster on high velocity for warp feel
        star.opacity -= star.isHighVelocity ? 0.025 : 0.015;

        if (star.opacity <= 0 || star.x < 0 || star.y > canvas.height) {
          shootingStars.splice(index, 1);
          return;
        }

        // Draw trail
        const grad = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - star.dx * 2,
          star.y - star.dy * 2
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        
        // Interpolate shooting star cyan tail to amber if near mechatronics
        let tailColor = "0, 212, 255"; // cyan RGB
        if (amberFactor > 0) {
          const sh = interpolateColor(0, 212, 255, targetAmber.r, targetAmber.g, targetAmber.b, amberFactor);
          tailColor = `${sh.r}, ${sh.g}, ${sh.b}`;
        }
        grad.addColorStop(0.1, `rgba(${tailColor}, ${star.opacity * 0.8})`);
        grad.addColorStop(1, `rgba(${tailColor}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = star.isHighVelocity ? 2.2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.dx * 2, star.y + star.dy * 2);
        ctx.stroke();
      });

      // Decay velocity ref towards 0 per frame when scrolling stops
      scrollVelocityRef.current *= 0.92;
      if (Math.abs(scrollVelocityRef.current) < 0.01) {
        scrollVelocityRef.current = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
