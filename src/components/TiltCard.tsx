import React, { useState, useRef } from 'react';

// ==========================================
// 2. INTERACTIVE 3D TILT CARD WITH GLOW SPOTLIGHT
// ==========================================
const TiltCard = ({ children, className = '', glowColor = 'rgba(0, 243, 255, 0.22)', tiltIntensity = 7 }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
    const rotateY = ((x - centerX) / centerX) * tiltIntensity;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
    );
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlowPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: glowPos.opacity === 0 ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.08s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className={`relative overflow-hidden rounded-2xl bg-[#0c101a]/80 backdrop-blur-xl border border-white/10 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: glowPos.opacity,
          background: `radial-gradient(450px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export default TiltCard;
