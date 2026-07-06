'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  GiCardPlay, GiSwordBrandish, GiTrophyCup,
  GiBookmarklet, GiMagnifyingGlass,
} from 'react-icons/gi';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import useUIStore from '@/store/useUIStore';
import useCardStore from '@/store/useCardStore';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: GiCardPlay },
  { href: '/cards', label: 'Explorer', icon: GiMagnifyingGlass },
  { href: '/deck-builder', label: 'Deck Builder', icon: GiSwordBrandish },
  { href: '/leaderboards', label: 'Leaderboards', icon: GiTrophyCup },
  { href: '/favorites', label: 'Favorites', icon: GiBookmarklet },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { favorites } = useCardStore();
  const { deck } = useCardStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? 'glass border-b border-white/10 py-3'
              : 'bg-transparent py-5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <GiCardPlay className="text-white text-xl" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity" />
              </motion.div>
              <div className="hidden sm:block">
                <p className="font-display text-sm font-bold tracking-widest text-white leading-none">
                  YU-GI-OH
                </p>
                <p className="text-[10px] tracking-[0.3em] text-violet-300/70 font-light leading-none mt-0.5">
                  ULTIMATE EXPLORER
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href}>
                    <motion.div
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'text-white'
                          : 'text-white/50 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600/20 to-cyan-500/20 border border-violet-500/30"
                          layoutId="nav-active"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className="text-base relative z-10" />
                      <span className="font-display text-xs tracking-wider relative z-10">
                        {label}
                      </span>
                      {href === '/favorites' && favorites.length > 0 && (
                        <span className="relative z-10 bg-violet-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {favorites.length > 9 ? '9+' : favorites.length}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Deck count badge */}
              {deck.main.length > 0 && (
                <Link href="/deck-builder">
                  <motion.div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-amber-500/30 text-amber-400 text-xs font-display tracking-wider"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <GiSwordBrandish />
                    <span>{deck.main.length}/{deck.extra.length + deck.side.length}</span>
                  </motion.div>
                </Link>
              )}

              {/* Mobile menu button */}
              <motion.button
                className="md:hidden relative z-10 p-2 rounded-lg glass"
                onClick={() => setMobileOpen(!mobileOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {mobileOpen ? (
                  <HiX className="text-white text-xl" />
                ) : (
                  <HiOutlineMenuAlt3 className="text-white text-xl" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[#04000d]/95 backdrop-blur-2xl"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="relative z-10 flex flex-col gap-2 p-6"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {NAV_LINKS.map(({ href, label, icon: Icon }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      pathname === href
                        ? 'border-violet-500/40 bg-violet-500/10 text-white'
                        : 'border-white/5 text-white/60 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <Icon className="text-2xl text-violet-400" />
                    <span className="font-display text-lg tracking-wider">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav md:hidden flex items-center justify-around py-2 px-2">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-violet-400' : 'text-white/40'
                }`}
                whileTap={{ scale: 0.85 }}
              >
                <Icon className="text-xl" />
                <span className="text-[10px] font-display tracking-wider">{label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 rounded-full bg-violet-400"
                    layoutId="mobile-nav-dot"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
