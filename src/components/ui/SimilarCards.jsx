'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import { fetchCards } from '@/lib/api';
import { getCardImageUrl } from '@/lib/cardUtils';
import { getAttributeTheme } from '@/lib/cardTheme';
import Image from 'next/image';

export default function SimilarCards({ card }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!card) return;
    const params = {};
    if (card.archetype) params.archetype = card.archetype;
    else if (card.attribute) params.attribute = card.attribute;

    fetchCards({ ...params, num: 8 })
      .then((res) => {
        const filtered = (res?.data || []).filter((c) => c.id !== card.id).slice(0, 6);
        setSimilar(filtered);
      })
      .catch(() => setSimilar([]))
      .finally(() => setLoading(false));
  }, [card?.id]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[59/86] rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!similar.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm tracking-wider text-white/60 uppercase">Similar Cards</h3>
        {card.archetype && (
          <Link href={`/cards?archetype=${encodeURIComponent(card.archetype)}`}>
            <span className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View All <FiChevronRight />
            </span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {similar.map((c, i) => {
          const theme = getAttributeTheme(c.attribute);
          return (
            <Link key={c.id} href={`/cards/${c.id}`}>
              <motion.div
                className="relative aspect-[59/86] rounded-xl overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.06, y: -4, boxShadow: `0 12px 30px ${theme.glow}` }}
              >
                <Image
                  src={getCardImageUrl(c, 'small')}
                  alt={c.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                  sizes="100px"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${theme.glow} 0%, transparent 50%)` }}
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
