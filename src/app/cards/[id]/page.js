'use client';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiPlus, FiExternalLink, FiChevronLeft, FiDollarSign } from 'react-icons/fi';
import { GiSwordBrandish, GiShield, GiStarFormation } from 'react-icons/gi';
import { fetchCardById } from '@/lib/api';
import { getAttributeTheme, getFrameTheme, getCardTypeColor } from '@/lib/cardTheme';
import {
  formatStat, formatBanStatus, getBestPrice, getLevelStars,
  getATKPowerLevel, getCardImageUrl, isMonster,
} from '@/lib/cardUtils';
import useCardStore from '@/store/useCardStore';
import useUIStore from '@/store/useUIStore';
import StatsBars from '@/components/ui/StatsBars';
import SimilarCards from '@/components/ui/SimilarCards';

const CardScene = dynamic(() => import('@/components/three/CardScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-56 h-80 rounded-2xl shimmer" />
    </div>
  ),
});



export default function CardDetailPage({ params }) {
  const { id } = use(params);

  const { addFavorite, removeFavorite, isFavorite, addCardToDeck, addRecentlyViewed } = useCardStore();
  const { addToast } = useUIStore();

  // State
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchCardById(id)
      .then((c) => {
        setCard(c);
        if (c) addRecentlyViewed(c);
      })
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="h-[600px] rounded-3xl shimmer" />
          <div className="space-y-4">
            {[80, 60, 90, 70, 65, 75, 55, 85].map((w, i) => (
              <div key={i} className="h-6 rounded-lg shimmer" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return notFound();
  }

  const theme = getAttributeTheme(card.attribute);
  const banInfo = formatBanStatus(card.banlist_info?.ban_tcg);
  const price = getBestPrice(card.card_prices);
  const isFav = isFavorite(card.id);
  const monster = isMonster(card.type);
  const powerLevel = getATKPowerLevel(card.atk);
  const images = card.card_images || [];
  const currentImage = images[selectedImage];

  return (
    <div
      className="min-h-screen pb-24 md:pb-0"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 20% 20%, ${theme.primary}08 0%, transparent 60%),
                     radial-gradient(ellipse 60% 50% at 80% 80%, ${theme.primary}05 0%, transparent 60%)`,
      }}
    >
      {/* Back nav */}
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto mb-8">
        <Link href="/cards">
          <motion.button
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors font-display tracking-wider"
            whileHover={{ x: -3 }}
          >
            <FiChevronLeft /> BACK TO EXPLORER
          </motion.button>
        </Link>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-16 items-start">
          {/* LEFT — 3D Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="sticky top-24"
          >
            {/* 3D Canvas */}
            <div
              className="h-[500px] sm:h-[600px] rounded-3xl overflow-hidden relative"
              style={{
                background: `radial-gradient(ellipse at center, ${theme.primary}12 0%, rgba(4,0,13,0.8) 70%)`,
                border: `1px solid ${theme.primary}25`,
                boxShadow: `0 0 60px ${theme.primary}15, inset 0 0 60px ${theme.primary}05`,
              }}
            >
              <CardScene card={{ ...card, card_images: [{ image_url: currentImage?.image_url }] }} />

              {/* Power level badge */}
              {powerLevel >= 3 && (
                <div className="absolute top-4 right-4">
                  <motion.div
                    className="px-3 py-1.5 rounded-full text-xs font-display font-bold tracking-wider"
                    style={{
                      background: theme.glow,
                      color: theme.primary,
                      border: `1px solid ${theme.primary}50`,
                      boxShadow: `0 0 20px ${theme.glow}`,
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {powerLevel === 5 ? '⚡ LEGENDARY' : powerLevel === 4 ? '🔥 MASSIVE' : '💥 STRONG'}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Alternate artworks */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {images.map((img, i) => (
                  <motion.button
                    key={img.id}
                    className="relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-all"
                    style={{ borderColor: i === selectedImage ? theme.primary : 'transparent' }}
                    onClick={() => setSelectedImage(i)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image src={img.image_url_small} alt={`Art ${i + 1}`} fill className="object-cover" unoptimized />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT — Card Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Type + Attribute badges */}
            <div className="flex flex-wrap gap-2">
              {card.attribute && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-display font-bold tracking-wider border"
                  style={{ color: theme.primary, borderColor: theme.primary + '40', background: theme.primary + '15' }}
                >
                  {card.attribute} {theme.emoji}
                </span>
              )}
              {card.humanReadableCardType && (
                <span className="px-3 py-1 rounded-full text-xs font-display tracking-wider border border-white/10 text-white/50">
                  {card.humanReadableCardType}
                </span>
              )}
              {card.race && (
                <span className="px-3 py-1 rounded-full text-xs font-display tracking-wider border border-white/10 text-white/50">
                  {card.race}
                </span>
              )}
              {card.archetype && (
                <Link href={`/cards?archetype=${encodeURIComponent(card.archetype)}`}>
                  <span className="px-3 py-1 rounded-full text-xs font-display tracking-wider border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer">
                    ✦ {card.archetype}
                  </span>
                </Link>
              )}
              {banInfo.label !== 'Unlimited' && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-display font-bold tracking-wider"
                  style={{ color: banInfo.color, background: banInfo.bg, border: `1px solid ${banInfo.color}40` }}
                >
                  ⚠ {banInfo.label}
                </span>
              )}
            </div>

            {/* Card Name */}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight" style={{ textShadow: `0 0 40px ${theme.primary}40` }}>
                {card.name}
              </h1>
              {card.archetype && (
                <p className="text-sm text-white/30 mt-1">Archetype: {card.archetype}</p>
              )}
            </div>

            {/* ATK / DEF / Level */}
            {monster && (
              <div className="grid grid-cols-3 gap-3">
                {card.atk !== undefined && (
                  <div
                    className="glass rounded-xl p-3 text-center border"
                    style={{ borderColor: '#f59e0b22' }}
                  >
                    <p className="text-[10px] text-white/30 font-display tracking-wider mb-1">ATK</p>
                    <p className="font-display text-xl font-black text-amber-400">{formatStat(card.atk)}</p>
                  </div>
                )}
                {card.def !== undefined && (
                  <div className="glass rounded-xl p-3 text-center border border-cyan-500/20">
                    <p className="text-[10px] text-white/30 font-display tracking-wider mb-1">DEF</p>
                    <p className="font-display text-xl font-black text-cyan-400">{formatStat(card.def)}</p>
                  </div>
                )}
                {(card.level || card.linkval || card.scale) && (
                  <div className="glass rounded-xl p-3 text-center border border-amber-500/20">
                    <p className="text-[10px] text-white/30 font-display tracking-wider mb-1">
                      {card.linkval ? 'LINK' : card.scale ? 'SCALE' : 'LEVEL'}
                    </p>
                    <p className="font-display text-xl font-black text-yellow-300">
                      {card.linkval || card.scale || card.level}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stats Bars */}
            {monster && (card.atk !== undefined || card.def !== undefined) && (
              <div className="glass rounded-2xl p-5 border border-white/5">
                <p className="text-[10px] font-display tracking-[0.3em] text-white/30 mb-4 uppercase">Power Stats</p>
                <StatsBars card={card} />
              </div>
            )}

            {/* Description */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <p className="text-[10px] font-display tracking-[0.3em] text-white/30 mb-3 uppercase">Card Text</p>
              <p className="text-sm text-white/70 leading-relaxed">{card.desc}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                onClick={() => {
                  addCardToDeck(card);
                  addToast(`${card.name} added to deck`, 'success');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GiSwordBrandish /> Add to Deck
              </motion.button>
              <motion.button
                className="px-5 py-3 rounded-xl glass border border-white/10 transition-all"
                onClick={() => {
                  if (isFav) {
                    removeFavorite(card.id);
                    addToast('Removed from favorites', 'info');
                  } else {
                    addFavorite(card);
                    addToast('Added to favorites ♥', 'success');
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: isFav ? '#ef4444' : 'rgba(255,255,255,0.5)' }}
              >
                <FiHeart className="text-lg" style={{ fill: isFav ? '#ef4444' : 'none' }} />
              </motion.button>
              {card.ygoprodeck_url && (
                <a href={card.ygoprodeck_url} target="_blank" rel="noopener noreferrer">
                  <motion.button
                    className="px-5 py-3 rounded-xl glass border border-white/10 text-white/40 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiExternalLink className="text-lg" />
                  </motion.button>
                </a>
              )}
            </div>

            {/* Price */}
            {card.card_prices && card.card_prices.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/5">
                <p className="text-[10px] font-display tracking-[0.3em] text-white/30 mb-4 uppercase flex items-center gap-2">
                  <FiDollarSign className="text-amber-400" /> Market Prices
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Cardmarket', key: 'cardmarket_price', color: '#22c55e' },
                    { label: 'TCGPlayer', key: 'tcgplayer_price', color: '#06b6d4' },
                    { label: 'eBay', key: 'ebay_price', color: '#f59e0b' },
                    { label: 'Amazon', key: 'amazon_price', color: '#ff4500' },
                  ].map(({ label, key, color }) => {
                    const val = parseFloat(card.card_prices[0][key]);
                    if (!val) return null;
                    return (
                      <div key={key} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/3">
                        <span className="text-xs text-white/40">{label}</span>
                        <span className="text-sm font-bold font-display" style={{ color }}>${val.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Card Sets */}
            {card.card_sets && card.card_sets.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/5">
                <p className="text-[10px] font-display tracking-[0.3em] text-white/30 mb-4 uppercase">Card Sets</p>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {card.card_sets.map((set, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-xs font-medium text-white/80">{set.set_name}</p>
                        <p className="text-[10px] text-white/30">{set.set_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#add8e6' }}>{set.set_rarity}</p>
                        {set.set_price && parseFloat(set.set_price) > 0 && (
                          <p className="text-[10px] text-amber-400">${parseFloat(set.set_price).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card ID */}
            <div className="flex items-center gap-2 text-xs text-white/20 font-display tracking-wider">
              <span>CARD ID: {card.id}</span>
            </div>

            {/* Similar Cards */}
            <div>
              <SimilarCards card={card} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
