import { useQuery } from '@tanstack/react-query';
import { fetchCardById, fetchCards } from '@/lib/api';
import { getSimilarCardParams } from '@/lib/cardUtils';

// Fetch single card by ID
export function useCardDetail(id) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => fetchCardById(id),
    staleTime: 30 * 60 * 1000,
    enabled: !!id,
  });
}

// Fetch similar cards based on a given card's properties
export function useSimilarCards(card, limit = 12) {
  const params = card ? getSimilarCardParams(card) : null;

  return useQuery({
    queryKey: ['cards', 'similar', card?.id],
    queryFn: async () => {
      const result = await fetchCards(params);
      // Filter out the card itself and limit
      const cards = result?.data?.filter((c) => c.id !== card?.id).slice(0, limit);
      return { ...result, data: cards };
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!card && !!params,
  });
}
