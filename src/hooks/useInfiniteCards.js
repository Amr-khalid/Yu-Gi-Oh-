import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFilteredCards } from '@/lib/api';

const PAGE_SIZE = 24;

export function useInfiniteCards(params = {}) {
  return useInfiniteQuery({
    queryKey: ['cards', 'infinite', params],
    queryFn: ({ pageParam = 0 }) =>
      fetchFilteredCards({ ...params, num: PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + (page?.data?.length || 0),
        0
      );
      const total = lastPage?.meta?.total_rows || 0;
      if (totalFetched >= total) return undefined;
      return totalFetched;
    },
    staleTime: 5 * 60 * 1000,
    initialPageParam: 0,
  });
}
