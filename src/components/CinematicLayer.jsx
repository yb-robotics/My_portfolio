"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME } from '../constants/theme';

export default function CinematicLayer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Determine performance tier (mobile vs desktop)
    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 50 : 140;
    const maxLines = isMobile ? 35 : 90;

    // Setup Scene
    const scene = new THREE.Scene();

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 15;

    // Setup WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Color definitions
    const colorBlue = new THREE.Color(THEME.colors.electricBlue);
    const colorAmber = new THREE.Color(THEME.colors.warmAmber);

    // Particle geometries
    const particlesData = [];
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      // Boundaries spread
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 12;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Classify particles: 15% move in constrained circular arcs (Robotics Joint Trajectories)
      const isArc = i < maxParticles * 0.15;
      const arcSpeed = (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1);
      const arcRadius = Math.random() * 2.5 + 1.5;
      // Fixed center to rotate around, creating local joint armatures
      const arcCenter = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      );

      particlesData.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.015,
        vz: (Math.random() - 0.5) * 0.01,
        color: Math.random() > 0.45 ? colorBlue : colorAmber,
        isArc,
        arcSpeed,
        arcRadius,
        arcCenter,
        theta: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        amp: Math.random() * 0.15 + 0.04, // subtle hover oscillation amplitude
        scatterX: 0,
        scatterY: 0,
        scatterZ: 0
      });

      const col = particlesData[i].color;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular particle texture generator to avoid downloading assets
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 16;
    canvasTexture.height = 16;
    const ctx = canvasTexture.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const texture = new THREE.CanvasTexture(canvasTexture);

    // Particle Shader Material (additive blending, depth testing disabled)
    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.16 : 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: texture
    });

    const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlePoints);

    // Lines representation for PCB traces
    const linePositions = new Float32Array(maxLines * 2 * 3);
    const lineColors = new Float32Array(maxLines * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Mouse Tracking values
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      lastX: 0,
      lastY: 0,
      velocity: 0
    };

    // Project screen mouse onto Z=0 plane for physics interaction
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(999, 999, 0);

    const onMouseMove = (event) => {
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;

      // Mouse speed calculation
      const dx = event.clientX - mouse.lastX;
      const dy = event.clientY - mouse.lastY;
      mouse.velocity = Math.sqrt(dx * dx + dy * dy);
      mouse.lastX = event.clientX;
      mouse.lastY = event.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize Handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Core Animation loop
    let animId;
    const clock = new THREE.Clock();

    const tick = () => {
      animId = requestAnimationFrame(tick);

      const delta = clock.getDelta();
      // Cap delta-time in case tab is out-of-focus
      const dt = Math.min(delta, 0.1);
      const time = clock.getElapsedTime();

      // Smooth mouse lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Camera parallax
      camera.position.x += (mouse.x * 2.2 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 1.6 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Interpolate mouse velocity decline
      mouse.velocity *= 0.94;

      // Unproject mouse coordinates to 3D plane
      const mouseVector = new THREE.Vector2(mouse.x, mouse.y);
      raycaster.setFromCamera(mouseVector, camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);

      const posAttr = particleGeometry.attributes.position;

      // Update positions
      for (let i = 0; i < maxParticles; i++) {
        const p = particlesData[i];

        if (p.isArc) {
          // Circular trajectory rotation (robot arms movement simulation)
          p.theta += p.arcSpeed * dt * 8;
          const targetX = p.arcCenter.x + Math.cos(p.theta) * p.arcRadius;
          const targetY = p.arcCenter.y + Math.sin(p.theta) * p.arcRadius;
          const targetZ = p.arcCenter.z + Math.sin(p.theta * 1.5) * (p.arcRadius * 0.2);

          p.x += (targetX - p.x) * 0.08;
          p.y += (targetY - p.y) * 0.08;
          p.z += (targetZ - p.z) * 0.08;
        } else {
          // Normal floating physics
          p.x += p.vx * dt * 15;
          p.y += p.vy * dt * 15;
          p.z += p.vz * dt * 15;

          // Boundary bounce checks
          const bX = 15;
          const bY = 9;
          const bZ = 6;
          if (p.x < -bX || p.x > bX) p.vx *= -1;
          if (p.y < -bY || p.y > bY) p.vy *= -1;
          if (p.z < -bZ || p.z > bZ) p.vz *= -1;
        }

        // Sine wave oscillations (idle state movement)
        const sineOscX = Math.sin(time * 0.4 + p.phase) * p.amp;
        const sineOscY = Math.cos(time * 0.35 + p.phase) * p.amp;

        // Mouse velocity reactive scatter (repulsion force)
        const dx = p.x - mouse3D.x;
        const dy = p.y - mouse3D.y;
        const dz = p.z - mouse3D.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 4.5) {
          // Force scales with proximity and mouse speed
          const pushForce = (4.5 - dist) * 0.07 * (1.0 + mouse.velocity * 0.05);
          p.scatterX += (dx / dist) * pushForce;
          p.scatterY += (dy / dist) * pushForce;
          p.scatterZ += (dz / dist) * pushForce;
        }

        // Slow return to original state
        p.scatterX *= 0.91;
        p.scatterY *= 0.91;
        p.scatterZ *= 0.91;

        // Apply back to buffer position attributes
        posAttr.setXYZ(
          i,
          p.x + sineOscX + p.scatterX,
          p.y + sineOscY + p.scatterY,
          p.z + p.scatterZ
        );
      }

      particleGeometry.attributes.position.needsUpdate = true;

      // Update Lines (PCB trace connection system)
      let lineIndex = 0;
      const linePosAttr = lineGeometry.attributes.position;
      const lineColAttr = lineGeometry.attributes.color;

      // Clean the line matrices
      for (let k = 0; k < maxLines * 2 * 3; k++) {
        linePositions[k] = 0;
        lineColors[k] = 0;
      }

      // Check distance thresholds between particles and draw links
      const checkRange = isMobile ? 3.0 : 3.8;
      
      for (let i = 0; i < maxParticles; i++) {
        if (lineIndex >= maxLines) break;

        const piX = posAttr.getX(i);
        const piY = posAttr.getY(i);
        const piZ = posAttr.getZ(i);

        for (let j = i + 1; j < maxParticles; j++) {
          if (lineIndex >= maxLines) break;

          const pjX = posAttr.getX(j);
          const pjY = posAttr.getY(j);
          const pjZ = posAttr.getZ(j);

          const dx = piX - pjX;
          const dy = piY - pjY;
          const dz = piZ - pjZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < checkRange) {
            const idx = lineIndex * 2;

            // Set line points
            linePosAttr.setXYZ(idx, piX, piY, piZ);
            linePosAttr.setXYZ(idx + 1, pjX, pjY, pjZ);

            // Calculate opacity based on distance (closer = brighter)
            const alpha = 1.0 - dist / checkRange;
            const p1Color = particlesData[i].color;
            const p2Color = particlesData[j].color;

            // Set color values, dimmed for ambient feel
            lineColAttr.setXYZ(idx, p1Color.r * alpha * 0.45, p1Color.g * alpha * 0.45, p1Color.b * alpha * 0.45);
            lineColAttr.setXYZ(idx + 1, p2Color.r * alpha * 0.45, p2Color.g * alpha * 0.45, p2Color.b * alpha * 0.45);

            lineIndex++;
          }
        }
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Render Scene
      renderer.render(scene, camera);
    };

    tick();

    // Clean up Three.js components on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  );
}
