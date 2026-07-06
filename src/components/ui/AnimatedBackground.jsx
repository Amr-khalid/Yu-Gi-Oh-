'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stars
    const STAR_COUNT = 180;
    const NEBULA_ORB_COUNT = 6;

    function createStar() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.2,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: ['#ffffff', '#c8b8ff', '#b8d8ff', '#ffd8b8'][
          Math.floor(Math.random() * 4)
        ],
      };
    }

    function createNebulaOrb() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 150,
        color: [
          'rgba(124,58,237,0.04)',
          'rgba(6,182,212,0.04)',
          'rgba(139,92,246,0.05)',
          'rgba(59,130,246,0.03)',
          'rgba(236,72,153,0.03)',
          'rgba(245,158,11,0.03)',
        ][Math.floor(Math.random() * 6)],
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.005 + 0.002,
      };
    }

    // Energy particles
    const ENERGY_COUNT = 50;
    function createEnergyParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.5 + 0.1,
        color: ['#7c3aed', '#06b6d4', '#f59e0b', '#8b5cf6'][
          Math.floor(Math.random() * 4)
        ],
        life: 1,
        decay: Math.random() * 0.002 + 0.001,
      };
    }

    let stars = Array.from({ length: STAR_COUNT }, createStar);
    let nebulas = Array.from({ length: NEBULA_ORB_COUNT }, createNebulaOrb);
    let energyParticles = Array.from({ length: ENERGY_COUNT }, createEnergyParticle);

    function draw(time) {
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      gradient.addColorStop(0, 'rgba(12,4,30,1)');
      gradient.addColorStop(0.5, 'rgba(8,2,20,1)');
      gradient.addColorStop(1, 'rgba(4,0,13,1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Mouse reactive glow
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 400);
      mouseGlow.addColorStop(0, 'rgba(124,58,237,0.06)');
      mouseGlow.addColorStop(0.5, 'rgba(6,182,212,0.02)');
      mouseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, width, height);

      // Nebula orbs
      nebulas.forEach((n) => {
        n.x += n.speedX;
        n.y += n.speedY;
        n.pulse += n.pulseSpeed;
        if (n.x < -n.radius) n.x = width + n.radius;
        if (n.x > width + n.radius) n.x = -n.radius;
        if (n.y < -n.radius) n.y = height + n.radius;
        if (n.y > height + n.radius) n.y = -n.radius;

        const scale = 1 + Math.sin(n.pulse) * 0.1;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * scale);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Stars
      stars.forEach((star) => {
        star.twinkle += star.twinkleSpeed;
        const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace(')', `,${twinkleOpacity})`).replace('rgb', 'rgba');
        if (!star.color.startsWith('rgba')) {
          ctx.globalAlpha = twinkleOpacity;
        }
        ctx.fillStyle = star.color;
        ctx.globalAlpha = twinkleOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Subtle star glow for bright ones
        if (star.opacity > 0.7) {
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
          grd.addColorStop(0, `rgba(255,255,255,${twinkleOpacity * 0.2})`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Energy particles
      energyParticles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= p.decay;

        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          energyParticles[i] = createEnergyParticle();
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.globalAlpha = p.opacity * p.life;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars = Array.from({ length: STAR_COUNT }, createStar);
      nebulas = Array.from({ length: NEBULA_ORB_COUNT }, createNebulaOrb);
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="bg-canvas"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ mixBlendMode: 'normal' }}
      />
      <div className="noise-overlay" />
      {/* Animated gradient streaks */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, rgba(124,58,237,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 70%, rgba(6,182,212,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 10%, rgba(139,92,246,0.04) 0%, transparent 70%)
          `,
        }}
      />
    </>
  );
}
