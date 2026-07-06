'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { GiTrophyCup, GiSwordBrandish, GiDiamonds } from 'react-icons/gi';
import { FiTrendingUp, FiStar, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { fetchCards } from '@/lib/api';
import { getCardImageUrl, formatStat, getBestPrice } from '@/lib/cardUtils';
import { getAttributeTheme } from '@/lib/cardTheme';

const TABS = [
  { id: 'atk', label: 'Highest ATK', icon: GiSwordBrandish, color: '#f59e0b', params: { sort: 'atk', type: 'Effect Monster', num: 20 } },
  { id: 'newest', label: 'Newest Cards', icon: FiCalendar, color: '#22c55e', params: { sort: 'new', num: 20 } },
  { id: 'price', label: 'Most Expensive', icon: FiDollarSign, color: '#06b6d4', params: { num: 50 } },
  { id: 'dark', label: 'DARK Monsters', icon: GiDiamonds, color: '#9b59b6', params: { attribute: 'DARK', num: 20 } },
  { id: 'divine', label: 'Divine Cards', icon: GiTrophyCup, color: '#ffd700', params: { attribute: 'DIVINE', num: 20 } },
];

function RankCard({ card, rank, color }) {
  const theme = getAttributeTheme(card.attribute);
  const price = getBestPrice(card.card_prices);
  return (
    <Link href={`/cards/${card.id}`}>
      <motion.div
        className="flex items-center gap-4 px-4 py-3 rounded-xl glass border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
        whileHover={{ x: 4, boxShadow: `0 8px 30px ${theme.glow}` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.04 }}
      >
        {/* Rank number */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm flex-shrink-0"
          style={{
            background: rank <= 2 ? color + '30' : 'rgba(255,255,255,0.05)',
            color: rank <= 2 ? color : 'rgba(255,255,255,0.3)',
            border: rank <= 2 ? `1px solid ${color}40` : '1px solid transparent',
          }}
        >
          {rank + 1}
        </div>

        {/* Card image */}
        <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={getCardImageUrl(card, 'small')}
            alt={card.name}
            width={40}
            height={56}
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">{card.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {card.attribute && (
              <span className="text-[10px]" style={{ color: theme.primary }}>{card.attribute}</span>
            )}
            {card.race && <span className="text-[10px] text-white/30">{card.race}</span>}
          </div>
        </div>

        {/* Stat */}
        <div className="text-right flex-shrink-0">
          {card.atk !== undefined && (
            <p className="font-display text-sm font-bold text-amber-400">{formatStat(card.atk)}</p>
          )}
          {price && (
            <p className="text-xs text-emerald-400">${price.toFixed(2)}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('atk');
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(false);

  const currentTab = TABS.find((t) => t.id === activeTab);

  useEffect(() => {
    if (cards[activeTab]) return;
    setLoading(true);
    fetchCards(currentTab.params)
      .then((res) => {
        let data = res?.data || [];

        // For price tab, sort by best price
        if (activeTab === 'price') {
          data = data
            .filter((c) => getBestPrice(c.card_prices) > 0)
            .sort((a, b) => getBestPrice(b.card_prices) - getBestPrice(a.card_prices))
            .slice(0, 20);
        }

        setCards((prev) => ({ ...prev, [activeTab]: data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const currentCards = cards[activeTab] || [];

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="pt-24 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-display tracking-[0.4em] text-amber-400/60 mb-2 uppercase">✦ Rankings</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-2">LEADERBOARDS</h1>
          <p className="text-white/40 text-sm">The most powerful cards in the Yu-Gi-Oh universe</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map(({ id, label, icon: Icon, color }) => (
            <motion.button
              key={id}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display tracking-wider transition-all border ${
                activeTab === id ? '' : 'glass border-white/10 text-white/50 hover:text-white'
              }`}
              style={activeTab === id ? {
                background: color + '20',
                borderColor: color + '50',
                color,
              } : {}}
              onClick={() => setActiveTab(id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="text-base" />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Podium (top 3) */}
        {currentCards.length >= 3 && (
          <motion.div
            className="grid grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={activeTab}
          >
            {[1, 0, 2].map((rank) => {
              const card = currentCards[rank];
              if (!card) return null;
              const theme = getAttributeTheme(card.attribute);
              const heights = { 0: 'h-44', 1: 'h-36', 2: 'h-32' };
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <motion.div
                    className={`${heights[rank]} rounded-2xl overflow-hidden relative cursor-pointer group border`}
                    style={{ borderColor: theme.primary + '30', boxShadow: `0 8px 30px ${theme.glow}` }}
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rank * 0.1 }}
                  >
                    <Image
                      src={getCardImageUrl(card, 'small')}
                      alt={card.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)` }} />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-lg">{medals[rank]}</p>
                      <p className="text-white text-xs font-medium line-clamp-1">{card.name}</p>
                      {card.atk !== undefined && (
                        <p className="text-amber-400 text-xs font-display font-bold">ATK {formatStat(card.atk)}</p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}

        {/* Full list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {currentCards.map((card, i) => (
              <RankCard
                key={card.id}
                card={card}
                rank={i}
                color={currentTab?.color || '#7c3aed'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
