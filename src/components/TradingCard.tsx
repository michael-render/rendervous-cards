import { motion } from 'framer-motion';
import { Zap, Target, Flame, Sparkles, Sword } from 'lucide-react';
import { TransformedCard, CardAnswers } from '@/lib/types';

import { getRendyForName } from '@/lib/rendyRegistry';
import rendyTemplate from '@/assets/rendy-template.png';

interface TradingCardProps {
  card: TransformedCard;
  answers: CardAnswers;
}

const TradingCard = ({ card, answers }: TradingCardProps) => {
  const themeClass = `card-theme-${card.theme}`;
  const rendySrc = getRendyForName(card.name);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, rotateY: -10 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`${themeClass} w-[340px] md:w-[380px] mx-auto`}
    >
      {/* Outer card shell — thick colored border like a real TCG card */}
      <div className="holographic-shimmer rounded-[14px] border-[8px] border-card-border animate-pulse-glow overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(180deg, hsl(var(--card-header-bg)), hsl(var(--card) / 0.95))' }}
      >

        {/* ─── HEADER BAR ─── compact, name left + energy right */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-card-glow">
              {card.archetypeTitle}
            </p>
            <h1
              className="font-display font-bold text-foreground leading-none"
              style={{
                fontSize: card.name.length > 14 ? `${Math.max(1, 1.75 - (card.name.length - 14) * 0.06)}rem` : '1.75rem',
              }}
            >
              {card.name}
            </h1>
          </div>
          {/* Rendy mascot — top right */}
          <div className="flex-shrink-0 ml-3">
            <motion.img
              src={rendySrc}
              alt="Rendy"
              className="w-9 h-9 md:w-11 md:h-11 drop-shadow-md"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* ─── ART WINDOW ─── large framed centerpiece like TCG */}
        <div className="mx-3 rounded-lg overflow-visible border-[4px] shadow-inner relative"
          style={{
            borderColor: 'hsl(var(--card-border) / 0.55)',
            background: 'linear-gradient(180deg, hsl(var(--card-header-bg) / 0.4), hsl(var(--card) / 0.2))',
          }}
        >
          <div className="aspect-[5/4] flex items-center justify-center relative overflow-hidden rounded-[4px]">
            <img
              src={answers.photoUrl || rendyTemplate}
              alt={card.name}
              className="w-full h-full object-cover"
            />
            {/* Sparkle overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-4 w-2 h-2 rounded-full bg-card-glow/50 animate-sparkle" />
              <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-card-glow/40 animate-sparkle" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-8 left-8 w-1.5 h-1.5 rounded-full bg-card-glow/40 animate-sparkle" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        {/* ─── STATS + INVENTORY ─── side by side layout */}
        {/* ─── STATS + INVENTORY ─── side by side layout */}
        <div className="flex px-3 pt-2.5 pb-1 gap-2">
          {/* Stat rows — left side, spaced to fill */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="stat-row">
              <div className="flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-card-glow flex-shrink-0" />
                <span className="stat-label">Special Ability</span>
              </div>
              <p className="stat-value pl-[1.125rem]">{card.specialAbility}</p>
            </div>
            <div className="stat-divider" />
            <div className="stat-row">
              <div className="flex items-center gap-1 mb-0.5">
                <Target className="w-3.5 h-3.5 text-card-glow flex-shrink-0" />
                <span className="stat-label">Side Quest</span>
              </div>
              <p className="stat-value pl-[1.125rem]">{card.sideQuest}</p>
            </div>
            <div className="stat-divider" />
            <div className="stat-row">
              <div className="flex items-center gap-1 mb-0.5">
                <Sword className="w-3.5 h-3.5 text-card-glow flex-shrink-0" />
                <span className="stat-label">Signature Move</span>
              </div>
              <p className="stat-value pl-[1.125rem]">{card.signatureMove}</p>
            </div>
            <div className="stat-divider" />
            <div className="stat-row">
              <div className="flex items-center gap-1 mb-0.5">
                <Flame className="w-3.5 h-3.5 text-card-glow flex-shrink-0" />
                <span className="stat-label">Power Source</span>
              </div>
              <p className="stat-value pl-[1.125rem]">{card.powerSource}</p>
            </div>
          </div>

          {/* Inventory — vertical right side */}
          <div className="flex-shrink-0 w-[72px] rounded-lg px-1 py-1.5 flex flex-col items-center gap-1"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card-border) / 0.12), hsl(var(--card-border) / 0.06))',
              border: '2px solid hsl(var(--card-border) / 0.3)',
            }}
          >
            {/* Horizontal "INVENTORY" label — top */}
            <div className="flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-card-glow flex-shrink-0" />
              <span className="font-display text-[7px] uppercase tracking-[0.08em] text-muted-foreground font-semibold whitespace-nowrap">
                Inventory
              </span>
            </div>
            {/* Items */}
            {card.inventoryItems.map((item, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-0.5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <div className="inventory-frame">
                  <span className="text-xl">{item.emoji}</span>
                </div>
                <span className="font-display text-[8px] text-muted-foreground max-w-[60px] text-center leading-tight">
                  {item.label.replace(/\b(and|or|the|a|an)\b/gi, '').replace(/\s+/g, ' ').trim()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-2" />
      </div>
    </motion.div>
  );
};

export default TradingCard;
