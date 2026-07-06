'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import useUIStore from '@/store/useUIStore';

export default function CustomCursor() {
  const { cursorType } = useUIStore();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const trailX = useSpring(mouseX, { damping: 40, stiffness: 200 });
  const trailY = useSpring(mouseY, { damping: 40, stiffness: 200 });

  useEffect(() => {
    const moveCursor = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [mouseX, mouseY]);

  const cursorStyles = {
    default: { width: 14, height: 14, bg: 'rgba(124,58,237,0.9)', scale: 1 },
    card: { width: 40, height: 40, bg: 'rgba(124,58,237,0.15)', scale: 1, border: '2px solid rgba(124,58,237,0.8)' },
    link: { width: 30, height: 30, bg: 'rgba(6,182,212,0.3)', scale: 1, border: '2px solid rgba(6,182,212,0.8)' },
    drag: { width: 50, height: 50, bg: 'rgba(245,158,11,0.15)', scale: 1, border: '2px solid rgba(245,158,11,0.7)' },
  };

  const style = cursorStyles[cursorType] || cursorStyles.default;

  return (
    <>
      {/* Trail */}
      <motion.div
        className="cursor-custom fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          width: 30,
          height: 30,
          background: 'transparent',
          border: '1px solid rgba(124,58,237,0.3)',
        }}
      />
      {/* Main dot */}
      <motion.div
        className="cursor-custom fixed top-0 left-0 pointer-events-none z-[10000] rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: style.width,
          height: style.height,
          background: style.bg,
          border: style.border || 'none',
          boxShadow: '0 0 15px rgba(124,58,237,0.5)',
        }}
        animate={{ scale: style.scale }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
