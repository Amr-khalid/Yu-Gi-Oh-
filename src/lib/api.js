import axios from 'axios';

const BASE_URL = '/api/v7';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Cache in memory to avoid duplicate requests
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Fetch cards with any query params
export async function fetchCards(params = {}) {
  const key = JSON.stringify({ endpoint: 'cardinfo', params });
  const cached = getCached(key);
  if (cached) return cached;

  const response = await apiClient.get('/cardinfo.php', { params });
  const data = response.data;
  setCached(key, data);
  return data;
}

// Fetch a single card by ID
export async function fetchCardById(id) {
  const key = `card-${id}`;
  const cached = getCached(key);
  if (cached) return cached;

  const response = await apiClient.get('/cardinfo.php', { params: { id } });
  const data = response.data?.data?.[0] || null;
  setCached(key, data);
  return data;
}

// Fetch card by exact name
export async function fetchCardByName(name) {
  const key = `card-name-${name}`;
  const cached = getCached(key);
  if (cached) return cached;

  const response = await apiClient.get('/cardinfo.php', { params: { name } });
  const data = response.data?.data?.[0] || null;
  setCached(key, data);
  return data;
}

// Fuzzy name search (fname)
export async function searchCardsByName(fname, extraParams = {}) {
  const key = `search-${fname}-${JSON.stringify(extraParams)}`;
  const cached = getCached(key);
  if (cached) return cached;

  const response = await apiClient.get('/cardinfo.php', {
    params: { fname, ...extraParams },
  });
  const data = response.data;
  setCached(key, data);
  return data;
}

// Fetch all archetypes
export async function fetchArchetypes() {
  const key = 'archetypes';
  const cached = getCached(key);
  if (cached) return cached;

  const response = await apiClient.get('/archetypes.php');
  const data = response.data;
  setCached(key, data);
  return data;
}

// Fetch card sets
export async function fetchCardSets() {
  const key = 'cardsets';
  const cached = getCached(key);
  if (cached) return cached;

  const response = await apiClient.get('/cardsets.php');
  const data = response.data;
  setCached(key, data);
  return data;
}

// Fetch cards with full filters
export async function fetchFilteredCards({
  fname,
  type,
  race,
  attribute,
  archetype,
  level,
  atk,
  def,
  linkrating,
  scale,
  banlist,
  format,
  cardset,
  sort,
  num,
  offset,
} = {}) {
  const params = {};
  if (fname) params.fname = fname;
  if (type) params.type = type;
  if (race) params.race = race;
  if (attribute) params.attribute = attribute;
  if (archetype) params.archetype = archetype;
  if (level) params.level = level;
  if (atk) params.atk = atk;
  if (def) params.def = def;
  if (linkrating) params.linkrating = linkrating;
  if (scale) params.scale = scale;
  if (banlist) params.banlist = banlist;
  if (format) params.format = format;
  if (cardset) params.cardset = cardset;
  if (sort) params.sort = sort;
  if (num) params.num = num;
  if (offset !== undefined) params.offset = offset;

  return fetchCards(params);
}

// Fetch random card
export async function fetchRandomCard() {
  const response = await apiClient.get('/randomcard.php');
  return response.data;
}

// Fetch cards by archetype
export async function fetchCardsByArchetype(archetype) {
  return fetchCards({ archetype });
}

// Get trending / popular cards (highest ATK monsters as proxy)
export async function fetchTrendingCards() {
  return fetchCards({ sort: 'atk', num: 20, type: 'Effect Monster' });
}

// Get newest cards (sorted by ID descending as proxy for new, or API default)
export async function fetchNewestCards(num = 20) {
  return fetchCards({ sort: 'id', num });
}

export default apiClient;
