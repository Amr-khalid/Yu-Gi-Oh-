'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import CardGrid from '@/components/ui/CardGrid';
import useCardStore from '@/store/useCardStore';
import { fetchFilteredCards } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 24;

function CardsPageInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'name';

  const { filters, setFilter, searchQuery, setSearchQuery } = useCardStore();
  const [cards, setCards] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Use search params to initialize
  useEffect(() => {
    if (initialQ) setSearchQuery(initialQ);
    if (initialSort && initialSort !== filters.sort) setFilter('sort', initialSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedQuery = useDebounce(searchQuery, 350);

  const queryParams = useMemo(() => {
    let apiSort = undefined;
    if (filters.sort === 'atk') apiSort = 'atk';
    if (filters.sort === 'def') apiSort = 'def';
    if (filters.sort === 'new' || filters.sort === 'old') apiSort = 'id'; // use id as proxy for release age
    
    return {
      fname: debouncedQuery || undefined,
      attribute: filters.attribute || undefined,
      type: filters.type || undefined,
      race: filters.race || undefined,
      archetype: filters.archetype || undefined,
      level: filters.level || undefined,
      banlist: filters.banlist || undefined,
      sort: apiSort,
    };
  }, [debouncedQuery, filters]);

  // Initial / filter change fetch
  useEffect(() => {
    setCards([]);
    setOffset(0);
    setLoading(true);

    fetchFilteredCards({ ...queryParams, num: PAGE_SIZE, offset: 0 })
      .then((res) => {
        const data = res?.data || [];
        setCards(data);
        const tot = res?.meta?.total_rows || data.length;
        setTotal(tot);
        setHasMore(data.length === PAGE_SIZE && data.length < tot);
      })
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, [queryParams]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setLoading(true);

    fetchFilteredCards({ ...queryParams, num: PAGE_SIZE, offset: newOffset })
      .then((res) => {
        const data = res?.data || [];
        setCards((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Page Header */}
      <div className="relative px-4 sm:px-6 pt-24 pb-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-display tracking-[0.4em] text-violet-400/60 mb-2 uppercase">
            ✦ Card Database
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            CARD EXPLORER
          </h1>

          {/* Search bar */}
          <div className="max-w-2xl">
            <SearchBar
              placeholder="Search by name, archetype, description..."
              autoFocus={false}
            />
          </div>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <CardGrid
          cards={cards}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          total={total}
        />
      </div>
    </div>
  );
}

// Fallback skeleton while search params load
function CardsPageFallback() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="relative px-4 sm:px-6 pt-24 pb-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 rounded-lg shimmer mb-4" />
        <div className="h-12 max-w-2xl rounded-2xl shimmer" />
      </div>
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-[59/86] shimmer" />
              <div className="p-3 space-y-2 bg-white/3">
                <div className="h-3 w-3/4 rounded shimmer" />
                <div className="h-2 w-1/2 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={<CardsPageFallback />}>
      <CardsPageInner />
    </Suspense>
  );
}
