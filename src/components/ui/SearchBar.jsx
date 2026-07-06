'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { GiFlame } from 'react-icons/gi';
import { searchCardsByName } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import useCardStore from '@/store/useCardStore';
import { getCardImageUrl } from '@/lib/cardUtils';
import Image from 'next/image';

const TRENDING = [
  'Blue-Eyes White Dragon', 'Dark Magician', 'Exodia',
  'Seto Kaiba', 'Yugi Muto', 'Red-Eyes Dragon',
];

export default function SearchBar({ autoFocus = false, placeholder = 'Search cards...', large = false }) {
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches, setSearchQuery } = useCardStore();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 280);

  // Fetch autocomplete
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchCardsByName(debouncedQuery, { num: 8 })
      .then((res) => setResults(res?.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavigate = useCallback((term) => {
    if (!term) return;
    addRecentSearch(term);
    setSearchQuery(term);
    setFocused(false);
    setQuery('');
    router.push(`/cards?q=${encodeURIComponent(term)}`);
  }, [addRecentSearch, setSearchQuery, router]);

  const handleCardSelect = useCallback((card) => {
    addRecentSearch(card.name);
    setFocused(false);
    setQuery('');
    router.push(`/cards/${card.id}`);
  }, [addRecentSearch, router]);

  const handleKeyDown = (e) => {
    const total = results.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleCardSelect(results[selectedIndex]);
      } else if (query.trim()) {
        handleNavigate(query.trim());
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  const showDropdown = focused && (query.length > 0 || recentSearches.length > 0);
  const heightClass = large ? 'h-14 text-base' : 'h-11 text-sm';
  const iconSize = large ? 'text-xl' : 'text-base';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <motion.div
        className="relative"
        animate={{ scale: focused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`relative flex items-center ${heightClass} rounded-2xl transition-all duration-300 ${
            focused
              ? 'shadow-[0_0_0_2px_rgba(124,58,237,0.5),0_0_30px_rgba(124,58,237,0.2)]'
              : 'shadow-none'
          }`}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: focused ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <FiSearch className={`absolute left-4 ${iconSize} text-white/40 transition-colors ${focused ? 'text-violet-400' : ''}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`w-full ${heightClass} bg-transparent pl-11 pr-12 text-white placeholder-white/30 font-medium outline-none`}
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              >
                <FiX className="text-sm" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(10,4,28,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(30px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
            }}
          >
            {/* Autocomplete results */}
            {results.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-display tracking-[0.3em] text-white/30 px-3 py-2 uppercase">
                  Search Results
                </p>
                {results.map((card, i) => (
                  <motion.button
                    key={card.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      i === selectedIndex ? 'bg-violet-600/20' : 'hover:bg-white/5'
                    }`}
                    onClick={() => handleCardSelect(card)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-10 rounded flex-shrink-0 overflow-hidden bg-white/5">
                      <Image
                        src={getCardImageUrl(card, 'small')}
                        alt={card.name}
                        width={32}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {card.name.split(new RegExp(`(${query})`, 'gi')).map((part, j) =>
                          part.toLowerCase() === query.toLowerCase() ? (
                            <span key={j} className="text-violet-400">{part}</span>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                      <p className="text-[11px] text-white/40">{card.humanReadableCardType || card.type}</p>
                    </div>
                    <FiArrowRight className="text-white/20 flex-shrink-0" />
                  </motion.button>
                ))}
                {query && (
                  <motion.button
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left mt-1 border-t border-white/5"
                    onClick={() => handleNavigate(query)}
                  >
                    <FiSearch className="text-violet-400 text-sm" />
                    <span className="text-sm text-white/60">
                      Search all results for <span className="text-white font-medium">"{query}"</span>
                    </span>
                  </motion.button>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="p-4 flex items-center gap-2 text-white/40 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                Searching...
              </div>
            )}

            {/* Empty query — show trending + history */}
            {!query && (
              <div className="p-3 space-y-1">
                {/* Recent */}
                {recentSearches.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <p className="text-[10px] font-display tracking-[0.3em] text-white/30 uppercase">
                        Recent
                      </p>
                      <button
                        className="text-[10px] text-white/20 hover:text-white/50 transition-colors"
                        onClick={clearRecentSearches}
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.slice(0, 5).map((s) => (
                      <button
                        key={s}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                        onClick={() => handleNavigate(s)}
                      >
                        <FiClock className="text-white/25 text-sm flex-shrink-0" />
                        <span className="text-sm text-white/60">{s}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Trending */}
                <div>
                  <p className="text-[10px] font-display tracking-[0.3em] text-white/30 px-2 mb-2 uppercase">
                    Trending
                  </p>
                  {TRENDING.map((term) => (
                    <button
                      key={term}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left"
                      onClick={() => handleNavigate(term)}
                    >
                      <GiFlame className="text-orange-400 text-sm flex-shrink-0" />
                      <span className="text-sm text-white/60">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
