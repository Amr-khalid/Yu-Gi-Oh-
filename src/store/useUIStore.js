import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // Cursor
  cursorX: 0,
  cursorY: 0,
  cursorType: 'default', // 'default' | 'card' | 'link' | 'drag'
  setCursor: (x, y) => set({ cursorX: x, cursorY: y }),
  setCursorType: (type) => set({ cursorType: type }),

  // Active theme (for page-level attribute theming)
  activeTheme: null, // null = default cosmic theme
  setActiveTheme: (theme) => set({ activeTheme: theme }),

  // Sound
  soundEnabled: false,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  // Loading
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
  loadingMessage: '',
  setLoadingMessage: (msg) => set({ loadingMessage: msg }),

  // Modal
  modalCard: null,
  openModal: (card) => set({ modalCard: card }),
  closeModal: () => set({ modalCard: null }),

  // Filter sidebar
  filterSidebarOpen: false,
  toggleFilterSidebar: () =>
    set((state) => ({ filterSidebarOpen: !state.filterSidebarOpen })),
  closeFilterSidebar: () => set({ filterSidebarOpen: false }),

  // Search panel
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  // Mobile nav
  mobileNavOpen: false,
  toggleMobileNav: () =>
    set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

  // Fullscreen card
  fullscreenCard: null,
  openFullscreen: (card) => set({ fullscreenCard: card }),
  closeFullscreen: () => set({ fullscreenCard: null }),

  // Notifications toast
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // View mode for card grid
  gridViewMode: 'grid', // 'grid' | 'list' | 'masonry'
  setGridViewMode: (mode) => set({ gridViewMode: mode }),

  // Page transition
  pageTransitioning: false,
  setPageTransitioning: (val) => set({ pageTransitioning: val }),

  // Daily featured card
  dailyCard: null,
  setDailyCard: (card) => set({ dailyCard: card }),

  // Comparison
  compareCards: [],
  addToCompare: (card) =>
    set((state) => {
      if (state.compareCards.length >= 2) return state;
      if (state.compareCards.find((c) => c.id === card.id)) return state;
      return { compareCards: [...state.compareCards, card] };
    }),
  removeFromCompare: (id) =>
    set((state) => ({
      compareCards: state.compareCards.filter((c) => c.id !== id),
    })),
  clearCompare: () => set({ compareCards: [] }),
}));

export default useUIStore;
