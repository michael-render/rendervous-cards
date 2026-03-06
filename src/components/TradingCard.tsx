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
      className={`${themeClass} w-[370px] md:w-[420px] mx-auto`}
    >
      {/* Gradient border wrapper */}
      <div
        className="rounded-[4px] p-[3px] animate-pulse-glow"
        style={{
          background: `linear-gradient(145deg, hsl(var(--card-glow) / 0.7), hsl(var(--card-border)), hsl(var(--card-glow) / 0.5))`,
        }}
      >
        {/* Outer card shell — layered gradient for color blocking */}
        <div
          className="holographic-shimmer rounded-[3px] overflow-hidden shadow-xl relative"
          style={{
            background: `hsl(var(--card-bg-from))`,
          }}
        >
          {/* Background gradient layers for color blocking effect */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse 120% 80% at 100% 100%, hsl(var(--card-bg-to)) 0%, transparent 60%),
              radial-gradient(ellipse 100% 60% at 80% 80%, hsl(var(--card-bg-via) / 0.8) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 20% 0%, hsl(var(--card-bg-from)) 0%, transparent 70%)
            `,
          }} />
          {/* Subtle diagonal light sweep */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `linear-gradient(135deg, hsl(0 0% 100% / 0.04) 0%, transparent 40%, hsl(var(--card-glow) / 0.08) 70%, transparent 100%)`,
          }} />

          {/* ─── HEADER BAR ─── */}
          <div className="relative z-[1] flex items-center justify-between px-5 pt-5 pb-2.5">
            <div className="min-w-0 flex-1">
              <p className="card-font-display text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: 'hsl(var(--card-glow))' }}
              >
                {card.archetypeTitle}
              </p>
              <h1
                className="card-font-display font-bold leading-none tracking-[-0.01em]"
                style={{
                  fontSize: card.name.length > 14 ? `${Math.max(1.1, 2 - (card.name.length - 14) * 0.06)}rem` : '2rem',
                  color: 'hsl(0 0% 100%)',
                }}
              >
                {card.name}
              </h1>
            </div>
            <div className="flex-shrink-0 ml-3">
              <motion.img
                src={rendySrc}
                alt="Rendy"
                className="w-11 h-11 md:w-13 md:h-13 drop-shadow-md"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* ─── PHOTO+INVENTORY (left) | STATS (right) ─── */}
          <div className="relative z-[1] flex px-4 pt-2 pb-4 gap-3.5">
            {/* Left column */}
            <div className="flex-shrink-0 w-[100px] flex flex-col">
              {/* Photo */}
              <div className="rounded-[3px] overflow-hidden shadow-inner relative"
                style={{
                  border: '2px solid hsl(var(--card-glow) / 0.35)',
                  background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.06), hsl(0 0% 100% / 0.02))',
                }}
              >
                <div className="aspect-square flex items-center justify-center relative overflow-hidden rounded-[2px]">
                  <img
                    src={answers.photoUrl || rendyTemplate}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full animate-sparkle"
                      style={{ background: 'hsl(var(--card-glow) / 0.6)' }} />
                    <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full animate-sparkle"
                      style={{ background: 'hsl(var(--card-glow) / 0.5)', animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>

              {/* Inventory panel */}
              <div className="mt-2.5 rounded-[3px] px-2 py-2.5 flex flex-col items-center gap-[16px]"
                style={{
                  background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.07), hsl(0 0% 100% / 0.03))',
                  border: '1px solid hsl(var(--card-glow) / 0.22)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--card-glow))' }} />
                  <span className="stat-label whitespace-nowrap">
                    Inventory
                  </span>
                </div>
                {card.inventoryItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center gap-0.5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                  >
                    <div className="inventory-frame w-[42px] h-[42px] flex items-center justify-center">
                      <span className="text-[28px]">{item.emoji}</span>
                    </div>
                    <span className="card-font-body text-[9.5px] max-w-[70px] text-center leading-tight"
                      style={{ color: 'hsl(0 0% 100% / 0.6)' }}
                    >
                      {item.label.replace(/\b(and|or|the|a|an)\b/gi, '').replace(/\s+/g, ' ').trim()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right column: stats */}
            <div className="flex-1 min-w-0 flex flex-col gap-2.5 py-0.5">
              <StatBlock
                icon={<Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--card-glow))' }} />}
                label="Special Ability"
                title={card.specialAbility}
                detail={card.specialAbilityDetail}
              />
              <div className="stat-divider" />
              <StatBlock
                icon={<Target className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--card-glow))' }} />}
                label="Side Quest"
                title={card.sideQuest}
                detail={card.sideQuestDetail}
              />
              <div className="stat-divider" />
              <StatBlock
                icon={<Sword className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--card-glow))' }} />}
                label="Signature Move"
                title={card.signatureMove}
                detail={card.signatureMoveDetail}
              />
              <div className="stat-divider" />
              <StatBlock
                icon={<Flame className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--card-glow))' }} />}
                label="Power Source"
                title={card.powerSource}
                detail={card.powerSourceDetail}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function StatBlock({ icon, label, title, detail }: { icon: React.ReactNode; label: string; title: string; detail: string }) {
  return (
    <div className="stat-row">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <p className="stat-value pl-[1.25rem] font-semibold">{title}</p>
      {detail && (
        <p className="pl-[1.25rem] card-font-body text-[12.5px] leading-snug mt-0.5"
          style={{ color: 'hsl(0 0% 100% / 0.78)' }}
        >
          {detail}
        </p>
      )}
    </div>
  );
}

export default TradingCard;
