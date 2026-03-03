import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import rendyTemplate from '@/assets/rendy-template.png';
import { fetchCards, thumbnailUrl, imageUrl } from '@/lib/api';
import { GalleryCard } from '@/lib/types';

const THEME_BORDER: Record<string, string> = {
  coral: 'border-coral',
  mint: 'border-mint',
  sky: 'border-sky',
  lavender: 'border-lavender',
  peach: 'border-peach',
};

const Gallery = () => {
  const navigate = useNavigate();
  const { data: cards, isLoading } = useQuery<GalleryCard[]>({
    queryKey: ['gallery-cards'],
    queryFn: fetchCards,
  });

  const hasCards = cards && cards.length > 0;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl font-bold text-foreground">Card Gallery</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : hasCards ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {cards.map((card, i) => (
              <motion.a
                key={card.id}
                href={imageUrl(card.id)}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-4 ${THEME_BORDER[card.theme] || 'border-card-border'} shadow-md hover:shadow-xl transition-all hover:scale-[1.03]`}
              >
                <img
                  src={thumbnailUrl(card.id)}
                  alt={`${card.name}'s card`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                  <p className="font-display text-sm font-bold text-white leading-tight">{card.name}</p>
                  <p className="font-body text-xs text-white/70">{card.archetype_title}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <img src={rendyTemplate} alt="Rendy" className="w-24 h-24 opacity-50 mb-4" />
            <p className="font-display text-xl text-muted-foreground mb-2">No cards yet!</p>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Be the first to create and submit your trading card.
            </p>
            <motion.button
              onClick={() => navigate('/create')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-lg"
            >
              Create a Card
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
