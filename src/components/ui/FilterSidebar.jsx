'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSliders, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import useCardStore from '@/store/useCardStore';
import useUIStore from '@/store/useUIStore';

const ATTRIBUTES = ['DARK', 'LIGHT', 'EARTH', 'WATER', 'FIRE', 'WIND', 'DIVINE'];
const CARD_TYPES = [
  'Effect Monster', 'Normal Monster', 'Fusion Monster', 'Synchro Monster',
  'XYZ Monster', 'Link Monster', 'Ritual Monster', 'Pendulum Effect Monster',
  'Spell Card', 'Trap Card',
];
const RACES = [
  'Warrior', 'Spellcaster', 'Dragon', 'Zombie', 'Machine', 'Fiend',
  'Fairy', 'Beast', 'Aqua', 'Pyro', 'Reptile', 'Thunder', 'Rock',
  'Insect', 'Plant', 'Sea Serpent', 'Dinosaur', 'Beast-Warrior',
  'Winged Beast', 'Fish', 'Psychic', 'Cyberse',
];
const BANLIST_OPTIONS = ['Banned', 'Limited', 'Semi-Limited'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Alphabetical (A-Z)' },
  { value: 'atk', label: 'Highest ATK' },
  { value: 'def', label: 'Highest DEF' },
  { value: 'new', label: 'Newest First' },
  { value: 'old', label: 'Oldest First' },
];

const ATTRIBUTE_COLORS = {
  DARK: '#9b59b6',
  LIGHT: '#ffd700',
  EARTH: '#8b6914',
  WATER: '#00bfff',
  FIRE: '#ff4500',
  WIND: '#00fa9a',
  DIVINE: '#ff8c00',
};

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full mb-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-display tracking-[0.2em] text-white/50 uppercase">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="text-white/30 text-sm" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterSidebar({ onClose }) {
  const { filters, setFilter, resetFilters, getActiveFilterCount } = useCardStore();
  const { filterSidebarOpen } = useUIStore();
  const activeCount = getActiveFilterCount();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {filterSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiSliders className="text-violet-400 text-lg" />
            <h3 className="font-display text-sm tracking-wider text-white">FILTERS</h3>
            {activeCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <motion.button
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                onClick={resetFilters}
                whileTap={{ scale: 0.9 }}
              >
                <FiRefreshCw className="text-xs" />
                Clear
              </motion.button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden">
                <FiX className="text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <FilterSection title="Sort By">
          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-violet-500/50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: '#0a0014' }}>
                {o.label}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* Attribute */}
        <FilterSection title="Attribute">
          <div className="flex flex-wrap gap-2">
            {ATTRIBUTES.map((attr) => {
              const isActive = filters.attribute === attr;
              const color = ATTRIBUTE_COLORS[attr] || '#888';
              return (
                <motion.button
                  key={attr}
                  className="px-3 py-1.5 rounded-xl text-xs font-display tracking-wider transition-all border"
                  style={{
                    background: isActive ? color + '25' : 'transparent',
                    borderColor: isActive ? color + '80' : 'rgba(255,255,255,0.1)',
                    color: isActive ? color : 'rgba(255,255,255,0.5)',
                  }}
                  onClick={() => setFilter('attribute', isActive ? '' : attr)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {attr}
                </motion.button>
              );
            })}
          </div>
        </FilterSection>

        {/* Card Type */}
        <FilterSection title="Card Type" defaultOpen={false}>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {CARD_TYPES.map((type) => {
              const isActive = filters.type === type;
              return (
                <button
                  key={type}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-all ${
                    isActive ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                  onClick={() => setFilter('type', isActive ? '' : type)}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Race */}
        <FilterSection title="Race / Type" defaultOpen={false}>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {RACES.map((race) => {
              const isActive = filters.race === race;
              return (
                <button
                  key={race}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-all ${
                    isActive ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                  onClick={() => setFilter('race', isActive ? '' : race)}
                >
                  {race}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* ATK Range */}
        <FilterSection title="ATK Range" defaultOpen={false}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.atkMin}
              onChange={(e) => setFilter('atkMin', e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-violet-500/50 placeholder-white/20"
            />
            <span className="text-white/30 text-xs">–</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.atkMax}
              onChange={(e) => setFilter('atkMax', e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-violet-500/50 placeholder-white/20"
            />
          </div>
        </FilterSection>

        {/* Level */}
        <FilterSection title="Level / Rank" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((lvl) => {
              const isActive = filters.level === String(lvl);
              return (
                <motion.button
                  key={lvl}
                  className={`w-8 h-8 rounded-lg text-xs font-display font-bold transition-all ${
                    isActive ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                  onClick={() => setFilter('level', isActive ? '' : String(lvl))}
                  whileTap={{ scale: 0.9 }}
                >
                  {lvl}
                </motion.button>
              );
            })}
          </div>
        </FilterSection>

        {/* Banlist */}
        <FilterSection title="Banlist Status" defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {BANLIST_OPTIONS.map((status) => {
              const isActive = filters.banlist === status;
              const colors = { Banned: '#ef4444', Limited: '#f59e0b', 'Semi-Limited': '#fbbf24' };
              const color = colors[status];
              return (
                <button
                  key={status}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-all border ${
                    isActive ? '' : 'border-transparent hover:bg-white/5'
                  }`}
                  style={isActive ? {
                    background: color + '15',
                    borderColor: color + '40',
                    color,
                  } : { color: 'rgba(255,255,255,0.5)' }}
                  onClick={() => setFilter('banlist', isActive ? '' : status)}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Archetype input */}
        <FilterSection title="Archetype" defaultOpen={false}>
          <input
            type="text"
            placeholder="e.g. Blue-Eyes, HERO..."
            value={filters.archetype}
            onChange={(e) => setFilter('archetype', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-violet-500/50 placeholder-white/20"
          />
        </FilterSection>
      </div>
    </>
  );
}
