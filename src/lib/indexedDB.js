// IndexedDB wrapper for offline card caching
const DB_NAME = 'yugioh-explorer';
const DB_VERSION = 1;
const STORES = {
  cards: 'cards',
  favorites: 'favorites',
  searches: 'searches',
  deck: 'deck',
  settings: 'settings',
};

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.cards)) {
        const cardsStore = db.createObjectStore(STORES.cards, { keyPath: 'id' });
        cardsStore.createIndex('name', 'name', { unique: false });
        cardsStore.createIndex('type', 'type', { unique: false });
        cardsStore.createIndex('attribute', 'attribute', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.favorites)) {
        db.createObjectStore(STORES.favorites, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.searches)) {
        db.createObjectStore(STORES.searches, { keyPath: 'query' });
      }

      if (!db.objectStoreNames.contains(STORES.deck)) {
        db.createObjectStore(STORES.deck, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'key' });
      }
    };
  });
}

async function getStore(storeName, mode = 'readonly') {
  const db = await openDB();
  if (!db) return null;
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// Generic helpers
async function dbGet(storeName, key) {
  const store = await getStore(storeName);
  if (!store) return null;
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(storeName, value) {
  const store = await getStore(storeName, 'readwrite');
  if (!store) return;
  return new Promise((resolve, reject) => {
    const req = store.put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(storeName, key) {
  const store = await getStore(storeName, 'readwrite');
  if (!store) return;
  return new Promise((resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(storeName) {
  const store = await getStore(storeName);
  if (!store) return [];
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbClear(storeName) {
  const store = await getStore(storeName, 'readwrite');
  if (!store) return;
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- Cards Cache ---
export async function cacheCards(cards) {
  const db = await openDB();
  if (!db) return;
  const tx = db.transaction(STORES.cards, 'readwrite');
  const store = tx.objectStore(STORES.cards);
  for (const card of cards) {
    store.put(card);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedCard(id) {
  return dbGet(STORES.cards, id);
}

export async function getAllCachedCards() {
  return dbGetAll(STORES.cards);
}

// --- Favorites ---
export async function addFavorite(card) {
  return dbPut(STORES.favorites, { ...card, savedAt: Date.now() });
}

export async function removeFavorite(id) {
  return dbDelete(STORES.favorites, id);
}

export async function getFavorites() {
  return dbGetAll(STORES.favorites);
}

export async function isFavorite(id) {
  const card = await dbGet(STORES.favorites, id);
  return !!card;
}

// --- Recent Searches ---
export async function saveSearch(query) {
  return dbPut(STORES.searches, { query, timestamp: Date.now() });
}

export async function getRecentSearches(limit = 10) {
  const all = await dbGetAll(STORES.searches);
  return all
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export async function clearSearchHistory() {
  return dbClear(STORES.searches);
}

// --- Deck ---
export async function saveDeck(deck) {
  return dbPut(STORES.deck, { id: 'current', ...deck, savedAt: Date.now() });
}

export async function loadDeck() {
  return dbGet(STORES.deck, 'current');
}

// --- Settings ---
export async function saveSetting(key, value) {
  return dbPut(STORES.settings, { key, value });
}

export async function getSetting(key) {
  const entry = await dbGet(STORES.settings, key);
  return entry?.value;
}
