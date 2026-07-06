'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
  GiFlame, GiLightningTrio, GiCrystalBall, GiSwordBrandish,
  GiCardRandom, GiTrophyCup,
} from 'react-icons/gi';
import { FiSearch, FiChevronRight, FiZap } from 'react-icons/fi';
import { fetchRandomCard, fetchTrendingCards, fetchNewestCards } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { getAttributeTheme, getFrameTheme } from '@/lib/cardTheme';
import { formatStat, getATKPowerLevel } from '@/lib/cardUtils';
import useCardStore from '@/store/useCardStore';
import useUIStore from '@/store/useUIStore';
import CardGridItem from '@/components/ui/CardGridItem';
import SearchBar from '@/components/ui/SearchBar';

const HeroCard3D = dynamic(() => import('@/components/three/HeroCard3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-72 rounded-xl bg-white/5 animate-pulse" />
    </div>
  ),
});

const QUICK_ACTIONS = [
  { label: 'Trending', icon: GiFlame, href: '/cards?sort=atk', color: '#ff4500' },
  { label: 'Random Card', icon: GiCardRandom, action: 'random', color: '#7c3aed' },
  { label: 'Popular Archetypes', icon: GiCrystalBall, href: '/cards?tab=archetypes', color: '#06b6d4' },
  { label: 'Latest Cards', icon: GiLightningTrio, href: '/cards?sort=new', color: '#22c55e' },
  { label: 'Most Powerful', icon: GiTrophyCup, href: '/leaderboards', color: '#f59e0b' },
];

export default function HomePage() {
  const router = useRouter();
  const [dailyCard, setDailyCard] = useState(null);
  const [trendingCards, setTrendingCards] = useState([]);
  const [newestCards, setNewestCards] = useState([]);
  const [strongMonsters, setStrongMonsters] = useState([]);
  const [strongIndex, setStrongIndex] = useState(0);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const { setDailyCard: storeDailyCard } = useUIStore();
  const { addRecentlyViewed } = useCardStore();

  // Auto-rotate slideshow every 7 seconds
  useEffect(() => {
    if (strongMonsters.length === 0) return;
    const interval = setInterval(() => {
      setStrongIndex((prev) => (prev + 1) % strongMonsters.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [strongMonsters]);

  useEffect(() => {
    // Fetch daily featured card
    fetchRandomCard().then((card) => {
      setDailyCard(card);
      storeDailyCard(card);
    }).catch(() => {});

    // Fetch top 5 strongest monsters
    fetchTrendingCards().then((res) => {
      const sorted = (res?.data || [])
        .filter(c => c.atk && !isNaN(c.atk))
        .sort((a, b) => parseInt(b.atk) - parseInt(a.atk))
        .slice(0, 5);
      setStrongMonsters(sorted);
      setTrendingCards(res?.data?.slice(0, 6) || []);
    }).catch(() => {});

    // Fetch newest
    fetchNewestCards(6).then((res) => {
      setNewestCards(res?.data?.slice(0, 6) || []);
    }).catch(() => {});
  }, []);

  const handleRandomCard = async () => {
    setLoadingRandom(true);
    try {
      const card = await fetchRandomCard();
      router.push(`/cards/${card.id}`);
    } finally {
      setLoadingRandom(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'random') handleRandomCard();
  };

  const theme = dailyCard?.attribute
    ? getAttributeTheme(dailyCard.attribute)
    : null;

  return (
    <div className="relative min-h-screen pb-24 md:pb-0">
      {/* Hero section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        {/* Cinematic heading */}
        <motion.div
          className="text-center mb-6 z-10 relative"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.p
            className="text-xs font-display tracking-[0.4em] text-violet-400/70 mb-3 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ✦ Ultimate Card Experience ✦
          </motion.p>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
            <span className="block text-white">YU-GI-OH</span>
            <span
              className="block text-white"
              style={{
                textShadow: '0 1px 0 #ccc, 0 2px 0 #c5c5c5, 0 3px 0 #bbb, 0 4px 0 #b0b0b0, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
              }}
            >
              CARD EXPLORER
            </span>
          </h1>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto font-light">
            Explore 12,000+ cards in stunning 3D. Build decks. Discover legends.
          </p>
        </motion.div>

        {/* 5 Strongest Monsters Slideshow - Rotates every 7 seconds */}
        <div className="relative z-10 w-full max-w-5xl mb-12">
          <div className="glass rounded-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden bg-black/40 backdrop-blur-md">
            <div className="absolute top-4 left-4 z-20">
              <span className="px-3 py-1 rounded-full text-[10px] font-display font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                🏆 LEGENDARY MONSTERS SHIELD
              </span>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-8 min-h-[360px]">
              {/* Rotating 3D Hero Card Display */}
              <div className="relative w-56 h-80 flex-shrink-0 group">
                <AnimatePresence mode="wait">
                  {strongMonsters[strongIndex] && (
                    <motion.div
                      key={strongMonsters[strongIndex].id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.8, x: -50, rotateY: -30 }}
                      animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 50, rotateY: 30 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      {/* Image Fallback Render */}
                      <div className="absolute inset-0 z-0 flex items-center justify-center p-4 pointer-events-none">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                          <Image
                            src={strongMonsters[strongIndex].card_images?.[0]?.image_url}
                            alt={strongMonsters[strongIndex].name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>

                      {/* Transparent 3D Overlay */}
                      <div className="absolute inset-0 z-10 pointer-events-auto mix-blend-screen opacity-90">
                        <HeroCard3D card={strongMonsters[strongIndex]} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Monster Stats and Info panel */}
              <div className="flex-1 w-full min-w-0">
                <AnimatePresence mode="wait">
                  {strongMonsters[strongIndex] && (
                    <motion.div
                      key={strongMonsters[strongIndex].id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="font-display text-2xl md:text-3xl font-black text-white leading-tight">
                          {strongMonsters[strongIndex].name}
                        </h3>
                        <p className="text-xs font-display tracking-widest text-violet-400/80 mt-1 uppercase">
                          ✦ {strongMonsters[strongIndex].race} / {strongMonsters[strongIndex].type}
                        </p>
                      </div>

                      <div className="flex gap-6">
                        <div>
                          <p className="text-[10px] text-white/30 font-display tracking-wider mb-0.5">ATTACK POWER</p>
                          <p className="font-display text-2xl font-black text-amber-400">
                            {formatStat(strongMonsters[strongIndex].atk)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 font-display tracking-wider mb-0.5">DEFENSE POWER</p>
                          <p className="font-display text-2xl font-black text-cyan-400">
                            {formatStat(strongMonsters[strongIndex].def)}
                          </p>
                        </div>
                        {strongMonsters[strongIndex].level && (
                          <div>
                            <p className="text-[10px] text-white/30 font-display tracking-wider mb-0.5">STAR LEVEL</p>
                            <p className="font-display text-2xl font-black text-yellow-300">
                              ★ {strongMonsters[strongIndex].level}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-white/50 leading-relaxed line-clamp-3">
                        {strongMonsters[strongIndex].desc}
                      </p>

                      <div className="flex items-center gap-3">
                        <Link href={`/cards/${strongMonsters[strongIndex].id}`}>
                          <motion.button
                            className="btn-primary px-5 py-2.5 rounded-xl text-xs flex items-center gap-2"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <FiZap />
                            Summon Details
                          </motion.button>
                        </Link>
                        
                        {/* Selector dots */}
                        <div className="flex gap-1.5 ml-auto">
                          {strongMonsters.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setStrongIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                idx === strongIndex ? 'bg-amber-400 w-5' : 'bg-white/20 hover:bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Card + Info row */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 w-full max-w-5xl">
          {/* 3D Card */}
          <motion.div
            className="relative w-64 h-96 lg:w-72 lg:h-[420px] flex-shrink-0 group"
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          >
            {/* Image Fallback Render */}
            <div className="absolute inset-0 z-0 flex items-center justify-center p-4 pointer-events-none">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={dailyCard?.card_images?.[0]?.image_url}
                  alt={dailyCard?.name || "Featured Card"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            {/* Transparent 3D Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-auto mix-blend-screen opacity-90">
              <HeroCard3D card={dailyCard} />
            </div>
          </motion.div>

          {/* Card Info */}
          {dailyCard && (
            <motion.div
              className="flex-1 max-w-lg"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="glass rounded-2xl p-6 border border-white/10">
                <p className="text-xs font-display tracking-[0.3em] text-amber-400/70 mb-2 uppercase">
                  ✦ Daily Featured Card
                </p>
                <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-2">
                  {dailyCard.name}
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {dailyCard.attribute && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium border"
                      style={{
                        color: theme?.primary,
                        borderColor: theme?.primary + '44',
                        background: theme?.primary + '18',
                      }}
                    >
                      {dailyCard.attribute}
                    </span>
                  )}
                  {dailyCard.race && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-white/10 text-white/60">
                      {dailyCard.race}
                    </span>
                  )}
                  {dailyCard.type && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-white/10 text-white/60">
                      {dailyCard.humanReadableCardType || dailyCard.type}
                    </span>
                  )}
                </div>

                {/* ATK / DEF */}
                {(dailyCard.atk !== undefined || dailyCard.def !== undefined) && (
                  <div className="flex gap-4 mb-3">
                    {dailyCard.atk !== undefined && (
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">ATK</p>
                        <p className="font-display text-lg font-bold text-amber-400">
                          {formatStat(dailyCard.atk)}
                        </p>
                      </div>
                    )}
                    {dailyCard.def !== undefined && (
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">DEF</p>
                        <p className="font-display text-lg font-bold text-cyan-400">
                          {formatStat(dailyCard.def)}
                        </p>
                      </div>
                    )}
                    {dailyCard.level && (
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Level</p>
                        <p className="font-display text-lg font-bold text-yellow-300">
                          ★ {dailyCard.level}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-4">
                  {dailyCard.desc}
                </p>

                <Link href={`/cards/${dailyCard.id}`}>
                  <motion.button
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiZap />
                    View Full Details
                    <FiChevronRight />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search Bar */}
        <motion.div
          className="relative z-10 w-full max-w-2xl mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <SearchBar autoFocus={false} placeholder="Search any Yu-Gi-Oh! card..." large />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="relative z-10 flex flex-wrap justify-center gap-2 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {QUICK_ACTIONS.map(({ label, icon: Icon, href, action, color }) =>
            href ? (
              <Link key={label} href={href}>
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/70 text-sm hover:text-white hover:border-white/20 transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ '--hover-glow': color }}
                >
                  <Icon style={{ color }} />
                  {label}
                </motion.button>
              </Link>
            ) : (
              <motion.button
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/70 text-sm hover:text-white hover:border-white/20 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action)}
                disabled={loadingRandom}
              >
                <Icon style={{ color }} className={loadingRandom ? 'animate-spin' : ''} />
                {label}
              </motion.button>
            )
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-xs font-display tracking-widest">SCROLL TO EXPLORE</p>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* Trending Cards Section */}
      {trendingCards.length > 0 && (
        <section className="relative z-10 px-4 sm:px-6 py-12 max-w-7xl mx-auto">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <GiFlame className="text-2xl text-orange-500" />
              <h2 className="font-display text-2xl font-bold tracking-wider text-white">
                TRENDING CARDS
              </h2>
            </div>
            <Link href="/cards?sort=atk">
              <motion.button
                className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors font-display tracking-wider"
                whileHover={{ x: 3 }}
              >
                View All <FiChevronRight />
              </motion.button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {trendingCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <CardGridItem card={card} compact />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Newest Cards Section */}
      {newestCards.length > 0 && (
        <section className="relative z-10 px-4 sm:px-6 py-12 max-w-7xl mx-auto">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <GiLightningTrio className="text-2xl text-cyan-400" />
              <h2 className="font-display text-2xl font-bold tracking-wider text-white">
                LATEST CARDS
              </h2>
            </div>
            <Link href="/cards?sort=new">
              <motion.button
                className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors font-display tracking-wider"
                whileHover={{ x: 3 }}
              >
                View All <FiChevronRight />
              </motion.button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {newestCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <CardGridItem card={card} compact />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Stats Banner */}
      <motion.section
        className="relative z-10 px-4 sm:px-6 py-16 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="glass rounded-3xl border border-white/10 p-8 md:p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 50%, #f59e0b 100%)',
            }}
          />
          <div className="relative z-10">
            <p className="font-display text-xs tracking-[0.4em] text-violet-400/70 mb-3 uppercase">
              ✦ The Ultimate Database ✦
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Every Card. Every Format. Every Era.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {[
                { label: 'Total Cards', value: '12,000+', color: '#7c3aed' },
                { label: 'Card Types', value: '20+', color: '#06b6d4' },
                { label: 'Archetypes', value: '800+', color: '#f59e0b' },
                { label: 'Card Sets', value: '500+', color: '#22c55e' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="font-display text-3xl md:text-4xl font-black" style={{ color }}>
                    {value}
                  </p>
                  <p className="text-white/40 text-sm mt-1 font-display tracking-wider">{label}</p>
                </div>
              ))}
            </div>
            <Link href="/cards">
              <motion.button
                className="btn-primary mt-8 px-8 py-3 rounded-2xl text-base inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <GiCrystalBall />
                Start Exploring
                <FiChevronRight />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
