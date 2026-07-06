'use client';
import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';
import { GiSwordBrandish } from 'react-icons/gi';
import { getCardImageUrl, formatStat, getATKPowerLevel } from '@/lib/cardUtils';
import { getAttributeTheme, getFrameTheme, getCardTypeColor } from '@/lib/cardTheme';
import useCardStore from '@/store/useCardStore';
import useUIStore from '@/store/useUIStore';

export default function CardGridItem({ card, compact = false }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { addFavorite, removeFavorite, isFavorite, addCardToDeck, addRecentlyViewed } = useCardStore();
  const { addToast } = useUIStore();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 400, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const theme = getAttributeTheme(card.attribute);
  const frameTheme = getFrameTheme(card.frameType);
  const powerLevel = getATKPowerLevel(card.atk);
  const isFav = isFavorite(card.id);
  const imageUrl = getCardImageUrl(card, 'small');

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(card.id);
      addToast(`Removed ${card.name} from favorites`, 'info');
    } else {
      addFavorite(card);
      addToast(`Added ${card.name} to favorites! ♥`, 'success');
    }
  };

  const handleAddToDeck = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addCardToDeck(card);
    addToast(`Added ${card.name} to deck`, 'success');
  };

  // Glow color based on attribute
  const glowColor = theme?.glow || 'rgba(124,58,237,0.3)';

  if (compact) {
    return (
      <Link href={`/cards/${card.id}`} onClick={() => addRecentlyViewed(card)}>
        <motion.div
          className="relative rounded-xl overflow-hidden cursor-pointer group"
          style={{ transformStyle: 'preserve-3d' }}
          whileHover={{ scale: 1.06, y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="aspect-[59/86] relative">
            <Image
              src={imageUrl}
              alt={card.name}
              fill
              className="object-cover"
              unoptimized
              sizes="160px"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(to top, ${glowColor} 0%, transparent 50%)`,
              }}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 foil-overlay" />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
          >
            <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{card.name}</p>
          </div>
          {/* Glow border on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{ boxShadow: hovered ? `0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}` : 'none' }}
          />
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/cards/${card.id}`} onClick={() => addRecentlyViewed(card)}>
      <motion.div
        ref={cardRef}
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          perspective: 1000,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.03,
          boxShadow: `0 20px 60px ${glowColor}, 0 0 30px ${glowColor}`,
          zIndex: 10,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Card image */}
        <div className="aspect-[59/86] relative">
          <Image
            src={imageUrl}
            alt={card.name}
            fill
            className="object-cover"
            unoptimized
            sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 200px"
          />

          {/* Dynamic foil highlight — uses CSS variables updated by mouse position */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${hovered ? '50%' : '50%'} 50%, rgba(255,255,255,0.12) 0%, transparent 65%)`,
              opacity: hovered ? 1 : 0,
              mixBlendMode: 'screen',
            }}
          />

          {/* Attribute glow overlay bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${glowColor} 0%, transparent 100%)`,
              opacity: hovered ? 0.6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* ATK power aura for high-power cards */}
          {powerLevel >= 4 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 ${powerLevel * 15}px ${glowColor}`,
                animation: powerLevel >= 5 ? 'legendaryGlow 2s ease-in-out infinite' : 'pulseGlow 3s ease-in-out infinite',
              }}
            />
          )}

          {/* Level stars */}
          {card.level && (
            <div className="absolute top-2 left-2">
              <span className="text-amber-400 text-[9px] leading-none drop-shadow-lg">
                {'★'.repeat(Math.min(card.level, 8))}
              </span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 right-2">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: getCardTypeColor(card.type) + '33',
                color: getCardTypeColor(card.type),
                border: `1px solid ${getCardTypeColor(card.type)}44`,
                backdropFilter: 'blur(4px)',
              }}
            >
              {card.frameType?.toUpperCase() || 'CARD'}
            </span>
          </div>
        </div>

        {/* Card footer info */}
        <div
          className="p-3 relative"
          style={{
            background: `linear-gradient(to bottom, rgba(10,4,28,0.95), rgba(4,0,13,0.98))`,
            borderTop: `1px solid ${glowColor}`,
          }}
        >
          <h3 className="text-white text-xs font-semibold line-clamp-1 mb-1">{card.name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {card.atk !== undefined && (
                <span className="text-amber-400 text-[10px] font-display font-bold">
                  ATK {formatStat(card.atk)}
                </span>
              )}
              {card.attribute && (
                <span className="text-[9px]" style={{ color: theme.primary }}>
                  {card.attribute}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <motion.button
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                onClick={handleFavorite}
                whileTap={{ scale: 0.85 }}
              >
                <FiHeart
                  className="text-sm"
                  style={{ color: isFav ? '#ef4444' : 'rgba(255,255,255,0.3)', fill: isFav ? '#ef4444' : 'none' }}
                />
              </motion.button>
              <motion.button
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                onClick={handleAddToDeck}
                whileTap={{ scale: 0.85 }}
              >
                <GiSwordBrandish className="text-sm text-white/30 hover:text-violet-400 transition-colors" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none border-gradient"
          style={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
}
