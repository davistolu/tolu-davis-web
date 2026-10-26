import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  darkMode: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle drift lines
    const lineCount = 12;
    const lines = Array.from({ length: lineCount }, (_, i) => ({
      y: (height / lineCount) * i,
      speed: 0.08 + (i % 3) * 0.03,
      opacity: darkMode ? 0.025 : 0.035,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const strokeColor = darkMode ? '255, 255, 255' : '0, 0, 0';

      // 1. Subtle horizontal hairline grid lines drifting
      lines.forEach((line) => {
        line.y += line.speed;
        if (line.y > height + 2) line.y = -2;

        ctx.strokeStyle = `rgba(${strokeColor}, ${line.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(width, line.y);
        ctx.stroke();
      });

      // 2. Subtle cursor spotlight in pure neutral monochrome
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const spotGrad = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          320
        );
        const spotAlpha = darkMode ? 0.035 : 0.04;
        spotGrad.addColorStop(0, `rgba(${strokeColor}, ${spotAlpha})`);
        spotGrad.addColorStop(1, `rgba(${strokeColor}, 0)`);

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [darkMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Canvas */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          darkMode ? 'bg-[#09090b]' : 'bg-[#fafaf9]'
        }`}
      />

      {/* Precision Micro Dot Matrix */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: darkMode
            ? `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`
            : `radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Grain Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: darkMode ? 0.035 : 0.025 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Dynamic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default AnimatedBackground;