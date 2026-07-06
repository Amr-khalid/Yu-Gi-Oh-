'use client';
import { motion } from 'framer-motion';
import { statToPercent, formatStat } from '@/lib/cardUtils';
import { getAttributeTheme } from '@/lib/cardTheme';

function StatBar({ label, value, color, maxVal = 5000 }) {
  const percent = statToPercent(value, maxVal);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 font-display tracking-wider uppercase">{label}</span>
        <span className="text-sm font-bold font-display" style={{ color }}>
          {formatStat(value)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      {/* Power label */}
      {percent >= 80 && (
        <p className="text-[10px]" style={{ color }}>
          {percent >= 100 ? '⚡ MAXIMUM' : percent >= 90 ? '🔥 LEGENDARY' : '💥 POWERFUL'}
        </p>
      )}
    </div>
  );
}

function CircularStat({ label, value, max, color }) {
  const percent = Math.min((value / max) * 100, 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} strokeWidth="4" stroke="rgba(255,255,255,0.05)" fill="none" />
          <motion.circle
            cx="32" cy="32" r={radius}
            strokeWidth="4"
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-display font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-white/40 font-display tracking-wider uppercase">{label}</span>
    </div>
  );
}

export default function StatsBars({ card }) {
  const theme = getAttributeTheme(card?.attribute);
  const color = theme?.primary || '#7c3aed';

  return (
    <div className="space-y-4">
      {/* ATK / DEF bars */}
      {card.atk !== undefined && card.atk !== null && (
        <StatBar label="ATK" value={card.atk} color="#f59e0b" />
      )}
      {card.def !== undefined && card.def !== null && (
        <StatBar label="DEF" value={card.def} color="#06b6d4" />
      )}

      {/* Circular stats row */}
      {(card.level || card.scale || card.linkval) && (
        <div className="flex items-center justify-around pt-2">
          {card.level && (
            <CircularStat label="Level" value={card.level} max={12} color="#fbbf24" />
          )}
          {card.scale && (
            <CircularStat label="Scale" value={card.scale} max={13} color="#8b5cf6" />
          )}
          {card.linkval && (
            <CircularStat label="Link" value={card.linkval} max={8} color="#06b6d4" />
          )}
        </div>
      )}
    </div>
  );
}
