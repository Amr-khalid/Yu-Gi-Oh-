'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';
import { GiBookmarklet } from 'react-icons/gi';
import useCardStore from '@/store/useCardStore';
import useUIStore from '@/store/useUIStore';
import { getCardImageUrl, formatStat } from '@/lib/cardUtils';
import { getAttributeTheme } from '@/lib/cardTheme';

export default function FavoritesPage() {
  const { favorites, removeFavorite, collections, createCollection } = useCardStore();
  const { addToast } = useUIStore();

  const handleExport = () => {
    const json = JSON.stringify(favorites, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorites.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Favorites exported!', 'success');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-display tracking-[0.4em] text-rose-400/60 mb-2 uppercase">✦ My Collection</p>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
              FAVORITES
              <span className="ml-3 text-rose-400 text-2xl">({favorites.length})</span>
            </h1>
            {favorites.length > 0 && (
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white/60 text-sm hover:text-white transition-all"
                onClick={handleExport}
                whileTap={{ scale: 0.95 }}
              >
                <FiDownload className="text-sm" /> Export
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-32 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FiHeart className="text-6xl text-rose-500/30 mb-4" />
            </motion.div>
            <p className="font-display text-xl text-white/20 tracking-wider mb-2">NO FAVORITES YET</p>
            <p className="text-sm text-white/20 mb-6">Start exploring cards and save your favorites</p>
            <Link href="/cards">
              <motion.button
                className="btn-primary px-6 py-3 rounded-xl text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Explore Cards
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Favorites grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AnimatePresence>
            {favorites.map((card, i) => {
              const theme = getAttributeTheme(card.attribute);
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group"
                >
                  <Link href={`/cards/${card.id}`}>
                    <motion.div
                      className="aspect-[59/86] rounded-xl overflow-hidden cursor-pointer border border-transparent group-hover:border-rose-500/30 transition-all"
                      whileHover={{ scale: 1.04, y: -4, boxShadow: `0 16px 40px ${theme.glow}` }}
                    >
                      <Image
                        src={getCardImageUrl(card, 'small')}
                        alt={card.name}
                        width={160}
                        height={235}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </motion.div>
                  </Link>
                  {/* Remove button */}
                  <motion.button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
                    onClick={() => {
                      removeFavorite(card.id);
                      addToast('Removed from favorites', 'info');
                    }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <FiTrash2 className="text-xs" />
                  </motion.button>
                  <p className="text-[10px] text-white/50 text-center mt-1.5 line-clamp-1 px-1">{card.name}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
