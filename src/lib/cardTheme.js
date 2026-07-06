// Card attribute → visual theme mapping
export const ATTRIBUTE_THEMES = {
  FIRE: {
    primary: '#ff4500',
    secondary: '#ff8c00',
    accent: '#ffd700',
    glow: 'rgba(255, 69, 0, 0.6)',
    bg: 'from-red-950 via-orange-950 to-red-900',
    particle: '#ff6b35',
    aura: '#ff4500',
    shadow: 'rgba(255, 69, 0, 0.4)',
    name: 'Fire',
    emoji: '🔥',
  },
  WATER: {
    primary: '#00bfff',
    secondary: '#006994',
    accent: '#7fffd4',
    glow: 'rgba(0, 191, 255, 0.6)',
    bg: 'from-blue-950 via-cyan-950 to-blue-900',
    particle: '#00d4ff',
    aura: '#00bfff',
    shadow: 'rgba(0, 191, 255, 0.4)',
    name: 'Water',
    emoji: '💧',
  },
  EARTH: {
    primary: '#8b6914',
    secondary: '#4a3728',
    accent: '#c8a96e',
    glow: 'rgba(139, 105, 20, 0.6)',
    bg: 'from-amber-950 via-stone-950 to-amber-900',
    particle: '#c8a96e',
    aura: '#8b6914',
    shadow: 'rgba(139, 105, 20, 0.4)',
    name: 'Earth',
    emoji: '⛰️',
  },
  WIND: {
    primary: '#00fa9a',
    secondary: '#006400',
    accent: '#adff2f',
    glow: 'rgba(0, 250, 154, 0.6)',
    bg: 'from-emerald-950 via-green-950 to-teal-900',
    particle: '#7fff00',
    aura: '#00fa9a',
    shadow: 'rgba(0, 250, 154, 0.4)',
    name: 'Wind',
    emoji: '🌪️',
  },
  LIGHT: {
    primary: '#ffd700',
    secondary: '#fff8dc',
    accent: '#fffacd',
    glow: 'rgba(255, 215, 0, 0.8)',
    bg: 'from-yellow-950 via-amber-900 to-yellow-900',
    particle: '#ffed4e',
    aura: '#ffd700',
    shadow: 'rgba(255, 215, 0, 0.5)',
    name: 'Light',
    emoji: '✨',
  },
  DARK: {
    primary: '#9b59b6',
    secondary: '#2c1654',
    accent: '#e056fd',
    glow: 'rgba(155, 89, 182, 0.7)',
    bg: 'from-purple-950 via-violet-950 to-indigo-950',
    particle: '#c678dd',
    aura: '#9b59b6',
    shadow: 'rgba(155, 89, 182, 0.5)',
    name: 'Dark',
    emoji: '🌑',
  },
  DIVINE: {
    primary: '#ffd700',
    secondary: '#ff8c00',
    accent: '#ffffff',
    glow: 'rgba(255, 215, 0, 0.9)',
    bg: 'from-amber-900 via-yellow-800 to-orange-900',
    particle: '#ffffff',
    aura: '#ffd700',
    shadow: 'rgba(255, 215, 0, 0.6)',
    name: 'Divine',
    emoji: '⚡',
  },
};

// Card frame type → theme
export const FRAME_THEMES = {
  effect: {
    border: '#c96a00',
    gradient: 'from-orange-900 to-amber-950',
    label: 'Effect Monster',
  },
  normal: {
    border: '#d4b483',
    gradient: 'from-amber-900 to-yellow-950',
    label: 'Normal Monster',
  },
  ritual: {
    border: '#4a6fa5',
    gradient: 'from-blue-900 to-indigo-950',
    label: 'Ritual Monster',
  },
  fusion: {
    border: '#7f5ca5',
    gradient: 'from-purple-900 to-violet-950',
    label: 'Fusion Monster',
  },
  synchro: {
    border: '#e8e8e8',
    gradient: 'from-gray-700 to-slate-900',
    label: 'Synchro Monster',
  },
  xyz: {
    border: '#1a1a1a',
    gradient: 'from-gray-950 to-black',
    label: 'XYZ Monster',
  },
  link: {
    border: '#00008b',
    gradient: 'from-blue-950 to-indigo-950',
    label: 'Link Monster',
  },
  pendulum: {
    border: '#4fc3f7',
    gradient: 'from-cyan-900 to-emerald-950',
    label: 'Pendulum Monster',
  },
  spell: {
    border: '#1abc9c',
    gradient: 'from-teal-900 to-emerald-950',
    label: 'Spell Card',
  },
  trap: {
    border: '#b44f8b',
    gradient: 'from-pink-900 to-rose-950',
    label: 'Trap Card',
  },
  token: {
    border: '#808080',
    gradient: 'from-gray-700 to-slate-800',
    label: 'Token',
  },
  skill: {
    border: '#4169e1',
    gradient: 'from-blue-800 to-indigo-900',
    label: 'Skill Card',
  },
};

export function getAttributeTheme(attribute) {
  return ATTRIBUTE_THEMES[attribute?.toUpperCase()] || ATTRIBUTE_THEMES.DARK;
}

export function getFrameTheme(frameType) {
  const key = frameType?.toLowerCase().replace('_pendulum', '').replace('_effect', '') || 'effect';
  return FRAME_THEMES[key] || FRAME_THEMES.effect;
}

export function getCardTypeColor(type) {
  if (!type) return '#888';
  const t = type.toLowerCase();
  if (t.includes('spell')) return '#1abc9c';
  if (t.includes('trap')) return '#b44f8b';
  if (t.includes('fusion')) return '#7f5ca5';
  if (t.includes('synchro')) return '#b8b8b8';
  if (t.includes('xyz')) return '#555';
  if (t.includes('link')) return '#1a52c9';
  if (t.includes('ritual')) return '#4a6fa5';
  if (t.includes('pendulum')) return '#4fc3f7';
  return '#c96a00'; // effect/normal monster
}
