import { motion } from 'framer-motion';
import { resolveEmojiAsset } from '@/lib/emojiRegistry';

interface EnergyBadgeProps {
  emojiInput: string;
}

/**
 * Renders the Energy badge in the card header corner.
 * - If a matching Slack emoji asset exists → render that image.
 * - Otherwise → render a pastel sticker fallback with initials.
 * Never renders raw emoji text.
 */
const EnergyBadge = ({ emojiInput }: EnergyBadgeProps) => {
  const resolved = resolveEmojiAsset(emojiInput);

  return (
    <motion.div
      className="w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-md animate-badge-wobble overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, hsl(var(--card-header-bg)), hsl(var(--card-border) / 0.35))',
        border: '3px solid hsl(var(--card-border) / 0.6)',
        transform: 'rotate(-6deg)',
      }}
    >
      {resolved.type === 'image' ? (
        <img
          src={resolved.src}
          alt={resolved.name}
          className="w-7 h-7 md:w-9 md:h-9 object-contain"
          draggable={false}
        />
      ) : (
        /* Fallback: pastel sticker with first letter(s) */
        <div
          className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center font-display text-xs md:text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card-glow) / 0.3), hsl(var(--card-header-bg)))',
            color: 'hsl(var(--card-glow))',
          }}
        >
          {resolved.name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </motion.div>
  );
};

export default EnergyBadge;
