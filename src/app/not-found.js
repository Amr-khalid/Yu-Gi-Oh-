'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GiCardPlay } from 'react-icons/gi';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Animated card */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-8"
      >
        <div className="w-32 h-44 rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-950 border border-violet-500/30 flex items-center justify-center shadow-2xl shadow-violet-500/20">
          <GiCardPlay className="text-5xl text-violet-400/50" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-display tracking-[0.4em] text-violet-400/60 mb-3 uppercase">Card Not Found</p>
        <h1 className="font-display text-7xl sm:text-9xl font-black text-transparent bg-clip-text mb-4"
          style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
        >
          404
        </h1>
        <p className="text-white/40 text-lg mb-8">
          This card has been removed from the game...
        </p>
        <Link href="/">
          <motion.button
            className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiArrowLeft /> Return to Safety
          </motion.button>
        </Link>
      </motion.div>

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ['#7c3aed', '#06b6d4', '#f59e0b'][i % 3],
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
