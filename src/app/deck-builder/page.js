'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiTrash2, FiDownload, FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { GiSwordBrandish, GiShield, GiCardPlay } from 'react-icons/gi';
import SearchBar from '@/components/ui/SearchBar';
import useCardStore from '@/store/useCardStore';
import useUIStore from '@/store/useUIStore';
import { searchCardsByName, fetchCards } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { getCardImageUrl, formatStat, isExtraDeck } from '@/lib/cardUtils';
import { getAttributeTheme, getCardTypeColor } from '@/lib/cardTheme';

function DeckZone({ title, cards, zone, color, maxCount }) {
  const { removeCardFromDeck } = useCardStore();
  const filled = cards.length;

  return (
    <div className="glass rounded-2xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm tracking-wider" style={{ color }}>
          {title}
        </h3>
        <span className="text-xs text-white/40 font-display">
          {filled}/{maxCount}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/5 mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${(filled / maxCount) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      {/* Card list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        <AnimatePresence>
          {cards.map((card, i) => {
            const theme = getAttributeTheme(card.attribute);
            return (
              <motion.div
                key={`${card.id}-${i}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 group transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.02 }}
              >
                <div className="w-7 h-9 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={getCardImageUrl(card, 'small')}
                    alt={card.name}
                    width={28}
                    height={36}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 truncate">{card.name}</p>
                  {card.atk !== undefined && (
                    <p className="text-[10px] text-amber-400/60">{formatStat(card.atk)}</p>
                  )}
                </div>
                <button
                  className="p-1 opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                  onClick={() => removeCardFromDeck(card.id, zone)}
                >
                  <FiX className="text-xs" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {!filled && (
          <p className="text-center text-white/20 text-xs py-4 font-display tracking-wider">EMPTY</p>
        )}
      </div>
    </div>
  );
}

function DeckStats({ deck }) {
  const allCards = [...deck.main, ...deck.extra];
  const monsters = allCards.filter((c) => !c.type?.toLowerCase().includes('spell') && !c.type?.toLowerCase().includes('trap'));
  const spells = allCards.filter((c) => c.type?.toLowerCase().includes('spell'));
  const traps = allCards.filter((c) => c.type?.toLowerCase().includes('trap'));
  const avgAtk = monsters.length
    ? Math.round(monsters.reduce((s, c) => s + (parseInt(c.atk, 10) || 0), 0) / monsters.length)
    : 0;

  return (
    <div className="glass rounded-2xl p-4 border border-white/5">
      <p className="font-display text-xs tracking-[0.2em] text-white/30 mb-3 uppercase">Deck Stats</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Monsters', value: monsters.length, color: '#f59e0b' },
          { label: 'Spells', value: spells.length, color: '#1abc9c' },
          { label: 'Traps', value: traps.length, color: '#b44f8b' },
          { label: 'Avg ATK', value: avgAtk.toLocaleString(), color: '#06b6d4' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-2 rounded-xl bg-white/3">
            <p className="font-display text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-white/30">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DeckBuilderPage() {
  const { deck, addCardToDeck, clearDeck } = useCardStore();
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [defaultCards, setDefaultCards] = useState([]);
  const [searching, setSearching] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 350);

  // Fetch default LIGHT cards on mount
  useEffect(() => {
    fetchCards({ attribute: 'LIGHT', num: 20, offset: 0 })
      .then((res) => {
        setDefaultCards(res?.data || []);
        setSearchResults(res?.data || []);
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setSearchResults(defaultCards);
      return;
    }
    setSearching(true);
    try {
      // Fetch with attribute=LIGHT and double-check with client-side filter
      const res = await searchCardsByName(q, { num: 20, offset: 0, attribute: 'LIGHT' });
      const cards = res?.data || [];
      const lightCards = cards.filter(c => c.attribute === 'LIGHT');
      setSearchResults(lightCards);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [defaultCards]);

  // auto-search on debounce
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults(defaultCards);
    } else {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery, defaultCards, handleSearch]);

  const handleAddCard = (card) => {
    addCardToDeck(card);
    addToast(`${card.name} added to deck`, 'success');
  };

  const handleExport = () => {
    const json = JSON.stringify(deck, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name || 'deck'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Deck exported!', 'success');
  };

  const totalCards = deck.main.length + deck.extra.length + deck.side.length;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-display tracking-[0.4em] text-violet-400/60 mb-2 uppercase">✦ Deck Builder</p>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
              {deck.name || 'MY DECK'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/30 font-display">{totalCards} cards</span>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white/60 text-sm hover:text-white transition-all"
                onClick={handleExport}
                whileTap={{ scale: 0.95 }}
              >
                <FiDownload className="text-sm" /> Export
              </motion.button>
              <motion.button
                className="p-2 rounded-xl glass border border-red-500/20 text-red-400/60 hover:text-red-400 transition-all"
                onClick={() => { clearDeck(); addToast('Deck cleared', 'info'); }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 className="text-sm" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search input */}
            <div className="relative mb-4">
              <div className="relative flex items-center h-12 rounded-2xl glass border border-white/10 focus-within:border-violet-500/50 transition-all">
                <FiSearch className="absolute left-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search cards to add..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full h-full bg-transparent pl-11 pr-4 text-white text-sm outline-none placeholder-white/30"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                />
              </div>
            </div>

            {/* Results */}
            {searching ? (
              <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                Searching...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {searchResults.map((card, i) => {
                    const theme = getAttributeTheme(card.attribute);
                    return (
                      <motion.div
                        key={card.id}
                        className="relative group cursor-pointer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleAddCard(card)}
                        whileHover={{ scale: 1.05, y: -3 }}
                      >
                        <div
                          className="aspect-[59/86] rounded-xl overflow-hidden border border-transparent group-hover:border-violet-500/40 transition-all"
                          style={{ boxShadow: `0 0 0 0 ${theme.glow}` }}
                        >
                          <Image
                            src={getCardImageUrl(card, 'small')}
                            alt={card.name}
                            width={140}
                            height={204}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        {/* Add overlay */}
                        <div className="absolute inset-0 rounded-xl bg-violet-600/0 group-hover:bg-violet-600/20 flex items-center justify-center transition-all">
                          <FiPlus className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-all" />
                        </div>
                        <p className="text-[10px] text-white/60 mt-1 text-center line-clamp-1">{card.name}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Deck Panel */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DeckStats deck={deck} />
            <DeckZone title="MAIN DECK" cards={deck.main} zone="main" color="#7c3aed" maxCount={60} />
            <DeckZone title="EXTRA DECK" cards={deck.extra} zone="extra" color="#06b6d4" maxCount={15} />
            <DeckZone title="SIDE DECK" cards={deck.side} zone="side" color="#f59e0b" maxCount={15} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
