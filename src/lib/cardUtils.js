// Card utility functions

// ATK power level classification
export function getATKPowerLevel(atk) {
  if (atk === null || atk === undefined || atk === '?') return 0;
  const val = parseInt(atk, 10);
  if (isNaN(val)) return 0;
  if (val >= 5000) return 5; // Legendary
  if (val >= 3000) return 4; // Massive
  if (val >= 2000) return 3; // Strong
  if (val >= 1000) return 2; // Medium
  return 1;                  // Weak
}

export function getATKPowerLabel(atk) {
  const level = getATKPowerLevel(atk);
  const labels = ['None', 'Weak', 'Medium', 'Strong', 'Massive', 'Legendary'];
  return labels[level];
}

export function getATKGlowConfig(atk) {
  const level = getATKPowerLevel(atk);
  return {
    0: { color: 'transparent', size: 0, intensity: 0 },
    1: { color: 'rgba(100,100,200,0.3)', size: 10, intensity: 0.2 },
    2: { color: 'rgba(80,180,255,0.4)', size: 20, intensity: 0.4 },
    3: { color: 'rgba(255,200,0,0.5)', size: 30, intensity: 0.6 },
    4: { color: 'rgba(255,80,0,0.6)', size: 50, intensity: 0.8 },
    5: { color: 'rgba(255,215,0,0.8)', size: 80, intensity: 1.0 },
  }[level] || { color: 'transparent', size: 0, intensity: 0 };
}

// Format ATK/DEF for display
export function formatStat(val) {
  if (val === null || val === undefined) return '?';
  if (val === '?') return '?';
  return parseInt(val, 10).toLocaleString();
}

// Get rarity color
export function getRarityColor(rarity) {
  if (!rarity) return '#aaa';
  const r = rarity.toLowerCase();
  if (r.includes('starlight')) return '#e8d5f5';
  if (r.includes('ghost') || r.includes('ultimate')) return '#d0f0f0';
  if (r.includes('secret')) return '#ff69b4';
  if (r.includes('ultra')) return '#ffd700';
  if (r.includes('super')) return '#c0c0c0';
  if (r.includes('rare')) return '#add8e6';
  return '#aaa';
}

// Get level/rank stars
export function getLevelStars(level) {
  if (!level) return '';
  return '★'.repeat(Math.min(parseInt(level, 10), 12));
}

// Format banlist status
export function formatBanStatus(banStatus) {
  const map = {
    'Banned': { label: 'Banned', color: '#ff2222', bg: '#3a0000' },
    'Limited': { label: 'Limited', color: '#ff8800', bg: '#3a1a00' },
    'Semi-Limited': { label: 'Semi', color: '#ffcc00', bg: '#3a3000' },
    'Unlimited': { label: 'Unlimited', color: '#44ff44', bg: '#003a00' },
  };
  return map[banStatus] || { label: 'Unlimited', color: '#44ff44', bg: '#003a00' };
}

// Get best price from card_prices array
export function getBestPrice(prices) {
  if (!prices || prices.length === 0) return null;
  const p = prices[0];
  const vals = [
    parseFloat(p.cardmarket_price),
    parseFloat(p.tcgplayer_price),
    parseFloat(p.ebay_price),
    parseFloat(p.amazon_price),
    parseFloat(p.coolstuffinc_price),
  ].filter((v) => v > 0);
  if (vals.length === 0) return null;
  return Math.min(...vals);
}

// Determine if card is a monster
export function isMonster(type) {
  return type && !type.toLowerCase().includes('spell') && !type.toLowerCase().includes('trap');
}

// Determine if card is in extra deck
export function isExtraDeck(type) {
  if (!type) return false;
  const t = type.toLowerCase();
  return t.includes('fusion') || t.includes('synchro') || t.includes('xyz') || t.includes('link');
}

// Determine if card is in side deck (generally same as main for game purposes)
export function getDeckZone(type) {
  if (isExtraDeck(type)) return 'extra';
  return 'main';
}

// Get card image URL with fallback
export function getCardImageUrl(card, size = 'normal') {
  const img = card?.card_images?.[0];
  if (!img) return '/card-back.jpg';
  if (size === 'small') return img.image_url_small;
  if (size === 'cropped') return img.image_url_cropped;
  return img.image_url;
}

// Truncate long descriptions
export function truncateDesc(desc, maxLen = 120) {
  if (!desc || desc.length <= maxLen) return desc;
  return desc.slice(0, maxLen).trimEnd() + '…';
}

// Generate similar card search params
export function getSimilarCardParams(card) {
  const params = {};
  if (card.attribute) params.attribute = card.attribute;
  if (card.race) params.race = card.race;
  if (card.archetype) params.archetype = card.archetype;
  return params;
}

// ATK / DEF bar percentage (max 5000)
export function statToPercent(val, max = 5000) {
  if (!val || val === '?') return 0;
  return Math.min((parseInt(val, 10) / max) * 100, 100);
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
