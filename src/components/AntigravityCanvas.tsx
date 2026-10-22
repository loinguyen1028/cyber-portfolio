import React, { useEffect, useRef } from 'react';

// ==========================================
// 1. ANTIGRAVITY PARTICLE & CYBER GRID CANVAS (PERMANENT ZERO-G BOOSTED + CURSOR FOLLOW SWARM)
// ==========================================
const AntigravityCanvas = ({ bgImage, bgOpacity = 0.85, bgBrightness = 0.28, bgBlur = 0, physics }) => {
  const canvasRef = useRef(null);
  const speedMultiplier = physics?.particleSpeed ?? 1.65;
  const maxParticles = physics?.particleDensity ?? 110;
  const attractRadius = physics?.attractionRadius ?? 340;
  const attractStrength = physics?.attractionForce ?? 0.48;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Smoothly interpolated cursor tracker for fluid swarm motion
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
      radius: attractRadius,
      pulse: 0
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const colors = ['#00f3ff', '#10b981', '#a855f7', '#38bdf8'];
    const particleCount = Math.min(maxParticles, 170);

    const particles = Array.from({ length: particleCount }, () => {
      const baseVx = (Math.random() - 0.5) * 1.6;
      const baseVy = (Math.random() - 0.5) * 1.6 - 0.35;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        size: Math.random() * 2.5 + 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.65 + 0.35,
        pulse: Math.random() * Math.PI * 2,
        orbitDirection: Math.random() > 0.5 ? 1 : -1
      };
    });

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth cursor interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.16;
      mouse.y += (mouse.targetY - mouse.y) * 0.16;
      mouse.pulse += 0.06;

      // Subtle Moving Space Grid
      gridOffset = (gridOffset + 0.45 * speedMultiplier) % 60;
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.045)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gridOffset; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Cyber HUD Gravity Target around Cursor when active
      if (mouse.active) {
        ctx.save();
        const ringRadius = 24 + Math.sin(mouse.pulse) * 4;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f3ff';
        ctx.fill();

        // Outer faint gravity well boundary
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 5, mouse.x, mouse.y, mouse.radius * 0.65);
        grad.addColorStop(0, 'rgba(0, 243, 255, 0.09)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & Draw Particles (Cursor-Following Swarm Physics)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += 0.05;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius && dist > 1) {
            const pullFactor = (1 - dist / mouse.radius) * attractStrength;
            const angle = Math.atan2(dy, dx);

            // Inner orbital zone so particles swirl around the cursor instead of collapsing to 1 pixel
            if (dist > 36) {
              p.vx += Math.cos(angle) * pullFactor * 0.85;
              p.vy += Math.sin(angle) * pullFactor * 0.85;
            } else {
              // Gentle outward cushion + tangential swirl right near the cursor tip
              p.vx -= Math.cos(angle) * 0.22;
              p.vy -= Math.sin(angle) * 0.22;
            }

            // Add subtle vortex/orbital tangential velocity around the cursor
            const tangentAngle = angle + (Math.PI / 2) * p.orbitDirection;
            p.vx += Math.cos(tangentAngle) * pullFactor * 0.28;
            p.vy += Math.sin(tangentAngle) * pullFactor * 0.28;

            // Draw glowing tether line from cursor to nearby captured particles
            if (dist < mouse.radius * 0.72) {
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(p.x, p.y);
              const tetherAlpha = (1 - dist / (mouse.radius * 0.72)) * 0.38;
              ctx.strokeStyle = `rgba(0, 243, 255, ${tetherAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          } else {
            // Very gentle global pull so distant particles slowly drift toward cursor area
            const globalAngle = Math.atan2(dy, dx);
            p.vx += Math.cos(globalAngle) * 0.015 * attractStrength;
            p.vy += Math.sin(globalAngle) * 0.015 * attractStrength;
          }
        }

        // Smooth velocity damping & blend back toward base zero-g drift
        p.vx = p.vx * 0.94 + p.baseVx * 0.06 * speedMultiplier;
        p.vy = p.vy * 0.94 + p.baseVy * 0.06 * speedMultiplier;

        p.x += p.vx;
        p.y += p.vy;

        // Screen Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw Glowing Particle Node
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + Math.sin(p.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();

        // Neural SOC Mesh Connections between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ldx = p.x - p2.x;
          const ldy = p.y - p2.y;
          const ldist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (ldist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - ldist / 140) * 0.24;
            ctx.strokeStyle = `rgba(0, 243, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [speedMultiplier, maxParticles, attractRadius, attractStrength]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05060a]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105"
        style={{
          backgroundImage: `url("${bgImage}")`,
          filter: `brightness(${bgBrightness}) contrast(1.18) saturate(1.15) blur(${bgBlur}px)`,
          opacity: bgOpacity
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 65% 32%, rgba(0, 243, 255, 0.14) 0%, rgba(10, 14, 26, 0.82) 52%, rgba(5, 6, 10, 0.96) 100%)'
        }}
      />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 243, 255, 0.08) 3px)'
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default AntigravityCanvas;
