import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isExtraDeck } from '@/lib/cardUtils';

const MAX_MAIN = 60;
const MAX_EXTRA = 15;
const MAX_SIDE = 15;
const MAX_COPIES = 3;

const useCardStore = create(
  persist(
    (set, get) => ({
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Filters
      filters: {
        attribute: '',
        type: '',
        race: '',
        archetype: '',
        banlist: '',
        format: '',
        cardset: '',
        sort: 'name',
        atkMin: '',
        atkMax: '',
        defMin: '',
        defMax: '',
        level: '',
        scale: '',
        linkrating: '',
      },
      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),
      resetFilters: () =>
        set({
          filters: {
            attribute: '',
            type: '',
            race: '',
            archetype: '',
            banlist: '',
            format: '',
            cardset: '',
            sort: 'name',
            atkMin: '',
            atkMax: '',
            defMin: '',
            defMax: '',
            level: '',
            scale: '',
            linkrating: '',
          },
        }),

      // Active filter count
      getActiveFilterCount: () => {
        const { filters } = get();
        return Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;
      },

      // Favorites
      favorites: [],
      addFavorite: (card) =>
        set((state) => {
          if (state.favorites.find((c) => c.id === card.id)) return state;
          return { favorites: [...state.favorites, { ...card, savedAt: Date.now() }] };
        }),
      removeFavorite: (id) =>
        set((state) => ({ favorites: state.favorites.filter((c) => c.id !== id) })),
      isFavorite: (id) => get().favorites.some((c) => c.id === id),

      // Recently viewed
      recentlyViewed: [],
      addRecentlyViewed: (card) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((c) => c.id !== card.id);
          return { recentlyViewed: [card, ...filtered].slice(0, 20) };
        }),

      // Recent searches
      recentSearches: [],
      addRecentSearch: (query) =>
        set((state) => {
          if (!query.trim()) return state;
          const filtered = state.recentSearches.filter((s) => s !== query);
          return { recentSearches: [query, ...filtered].slice(0, 10) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Deck builder
      deck: {
        name: 'My Deck',
        main: [],
        extra: [],
        side: [],
      },
      setDeckName: (name) =>
        set((state) => ({ deck: { ...state.deck, name } })),

      addCardToDeck: (card) =>
        set((state) => {
          const { deck } = state;
          const zone = isExtraDeck(card.type) ? 'extra' : 'main';
          const currentZone = deck[zone];
          const total = currentZone.filter((c) => c.id === card.id).length;
          const zoneMax = zone === 'extra' ? MAX_EXTRA : MAX_MAIN;

          if (total >= MAX_COPIES) return state;
          if (currentZone.length >= zoneMax) return state;

          return {
            deck: {
              ...deck,
              [zone]: [...currentZone, card],
            },
          };
        }),

      removeCardFromDeck: (cardId, zone) =>
        set((state) => {
          const { deck } = state;
          const idx = deck[zone].findIndex((c) => c.id === cardId);
          if (idx === -1) return state;
          const newZone = [...deck[zone]];
          newZone.splice(idx, 1);
          return { deck: { ...deck, [zone]: newZone } };
        }),

      addCardToSide: (card) =>
        set((state) => {
          const { deck } = state;
          if (deck.side.length >= MAX_SIDE) return state;
          const total = deck.side.filter((c) => c.id === card.id).length;
          if (total >= MAX_COPIES) return state;
          return { deck: { ...deck, side: [...deck.side, card] } };
        }),

      clearDeck: () =>
        set({
          deck: { name: 'My Deck', main: [], extra: [], side: [] },
        }),

      importDeck: (deckData) => set({ deck: deckData }),

      // Collections / Folders
      collections: [],
      createCollection: (name) =>
        set((state) => ({
          collections: [
            ...state.collections,
            { id: Date.now(), name, cards: [], createdAt: Date.now() },
          ],
        })),
      addToCollection: (collectionId, card) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId && !col.cards.find((c) => c.id === card.id)
              ? { ...col, cards: [...col.cards, card] }
              : col
          ),
        })),
      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'yugioh-card-store',
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        recentSearches: state.recentSearches,
        deck: state.deck,
        collections: state.collections,
        filters: state.filters,
      }),
    }
  )
);

export default useCardStore;
