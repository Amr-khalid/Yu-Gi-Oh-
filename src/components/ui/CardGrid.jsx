'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';
import { GiCardPlay } from 'react-icons/gi';
import CardGridItem from './CardGridItem';
import FilterSidebar from './FilterSidebar';
import useUIStore from '@/store/useUIStore';
import useCardStore from '@/store/useCardStore';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="aspect-[59/86] shimmer" />
      <div className="p-3 bg-white/3 space-y-2">
        <div className="h-3 w-3/4 rounded shimmer" />
        <div className="h-2 w-1/2 rounded shimmer" />
      </div>
    </div>
  );
}

export default function CardGrid({
  cards = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  total = 0,
  isFiltering = false,
}) {
  const { filterSidebarOpen, toggleFilterSidebar, closeFilterSidebar, gridViewMode, setGridViewMode } = useUIStore();
  const { filters, getActiveFilterCount } = useCardStore();
  const loaderRef = useRef(null);
  const activeFilterCount = getActiveFilterCount();

  // Infinite scroll trigger
  useEffect(() => {
    if (!loaderRef.current || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const gridCols = gridViewMode === 'list'
    ? 'grid-cols-1 sm:grid-cols-1'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <div className="flex gap-6 relative">
      {/* Filter sidebar — desktop */}
      <AnimatePresence>
        {filterSidebarOpen && (
          <motion.aside
            className="hidden lg:block w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="sticky top-24 rounded-2xl p-5 h-[calc(100vh-120px)] overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <FilterSidebar onClose={closeFilterSidebar} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile filter panel */}
      <AnimatePresence>
        {filterSidebarOpen && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="h-full p-5 overflow-y-auto" style={{
              background: 'rgba(4,0,13,0.98)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(30px)',
            }}>
              <div className="mt-16">
                <FilterSidebar onClose={closeFilterSidebar} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filterSidebarOpen
                  ? 'bg-violet-600/20 border-violet-500/30 text-violet-300'
                  : 'glass border-white/10 text-white/60 hover:text-white'
              }`}
              onClick={toggleFilterSidebar}
              whileTap={{ scale: 0.95 }}
            >
              <FiFilter className="text-sm" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-violet-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>

            {/* Active filter chips */}
            <div className="flex items-center gap-1 flex-wrap">
              {Object.entries(filters).map(([key, val]) => {
                if (!val || key === 'sort') return null;
                return (
                  <motion.span
                    key={key}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    {val}
                  </motion.span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {total > 0 && (
              <span className="text-xs text-white/30 font-display hidden sm:block">
                {total.toLocaleString()} CARDS
              </span>
            )}
            <div className="flex items-center gap-1 glass rounded-xl p-1 border border-white/10">
              <button
                className={`p-1.5 rounded-lg transition-all ${gridViewMode === 'grid' ? 'bg-violet-600/30 text-violet-300' : 'text-white/30 hover:text-white'}`}
                onClick={() => setGridViewMode('grid')}
              >
                <FiGrid className="text-sm" />
              </button>
              <button
                className={`p-1.5 rounded-lg transition-all ${gridViewMode === 'list' ? 'bg-violet-600/30 text-violet-300' : 'text-white/30 hover:text-white'}`}
                onClick={() => setGridViewMode('list')}
              >
                <FiList className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {!loading && cards.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-32 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <GiCardPlay className="text-6xl text-violet-500/30 mb-4" />
            </motion.div>
            <p className="font-display text-xl text-white/20 tracking-wider mb-2">NO CARDS FOUND</p>
            <p className="text-sm text-white/20">Try adjusting your search or filters</p>
          </motion.div>
        )}

        {/* Grid */}
        <motion.div
          className={`grid ${gridCols} gap-3 md:gap-4`}
          variants={container}
          initial="hidden"
          animate="show"
          key={cards.length}
        >
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div key={card.id} variants={item} layout>
                <CardGridItem card={card} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Skeleton loaders */}
          {loading &&
            Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} />
            ))}
        </motion.div>

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="h-4 mt-8" />

        {/* Load more spinner */}
        {loading && cards.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
