import { useQuery } from '@tanstack/react-query';
import { fetchCards, fetchFilteredCards, fetchTrendingCards, fetchNewestCards } from '@/lib/api';

// Fetch cards with filter params
export function useCards(params = {}, options = {}) {
  return useQuery({
    queryKey: ['cards', params],
    queryFn: () => fetchFilteredCards(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Fetch trending cards
export function useTrendingCards() {
  return useQuery({
    queryKey: ['cards', 'trending'],
    queryFn: fetchTrendingCards,
    staleTime: 10 * 60 * 1000,
  });
}

// Fetch newest cards
export function useNewestCards(num = 20) {
  return useQuery({
    queryKey: ['cards', 'newest', num],
    queryFn: () => fetchNewestCards(num),
    staleTime: 10 * 60 * 1000,
  });
}

// Fetch cards by archetype
export function useCardsByArchetype(archetype) {
  return useQuery({
    queryKey: ['cards', 'archetype', archetype],
    queryFn: () => fetchCards({ archetype }),
    staleTime: 10 * 60 * 1000,
    enabled: !!archetype,
  });
}

// Fetch cards by attribute
export function useCardsByAttribute(attribute) {
  return useQuery({
    queryKey: ['cards', 'attribute', attribute],
    queryFn: () => fetchCards({ attribute }),
    staleTime: 10 * 60 * 1000,
    enabled: !!attribute,
  });
}
