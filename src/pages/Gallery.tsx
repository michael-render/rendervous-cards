import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Download, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import rendyTemplate from '@/assets/rendy-template.png';
import { fetchCards, thumbnailUrl, imageUrl } from '@/lib/api';
import { GalleryCard, THEME_BORDERS } from '@/lib/types';

const Gallery = () => {
  const [selected, setSelected] = useState<GalleryCard | null>(null);

  const { data: cards, isLoading, isError } = useQuery<GalleryCard[]>({
    queryKey: ['gallery-cards'],
    queryFn: fetchCards,
  });

  const hasCards = cards && cards.length > 0;

  const handleDownload = async (card: GalleryCard) => {
    try {
      const res = await fetch(imageUrl(card.id));
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${card.name}-card.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download card image.');
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Card Gallery</h1>
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create a Card
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground mb-2">Could not load cards</p>
            <p className="font-body text-sm text-muted-foreground">Please check your connection and try again.</p>
          </div>
        ) : hasCards ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
          >
            {cards.map((card, i) => (
              <motion.button
                key={card.id}
                onClick={() => setSelected(card)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-[3px] ${THEME_BORDERS[card.theme] || 'border-card-border'} shadow-sm hover:shadow-lg transition-all hover:scale-[1.05] cursor-pointer`}
              >
                <img
                  src={thumbnailUrl(card.id)}
                  alt={`${card.name}'s card`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                  <p className="font-display text-xs font-bold text-white leading-tight truncate">{card.name}</p>
                </div>
              </motion.button>
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
            <Link
              to="/create"
              className="rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
            >
              Create a Card
            </Link>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-card border-2 border-card-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className={`rounded-xl overflow-hidden border-4 ${THEME_BORDERS[selected.theme] || 'border-card-border'} shadow-2xl`}>
                <img
                  src={imageUrl(selected.id)}
                  alt={`${selected.name}'s card`}
                  className="w-full"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="font-display text-lg font-bold text-white">{selected.name}</p>
                <p className="font-body text-sm text-white/70 mb-4">{selected.archetype_title}</p>
                <motion.button
                  onClick={() => handleDownload(selected)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Card
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
