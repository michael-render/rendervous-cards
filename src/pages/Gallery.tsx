import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Download, Sparkles, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import rendyTemplate from '@/assets/rendy-template.png';
import { CardSummary, getCardImageUrl, getCardThumbnailUrl, listCards } from '@/lib/api';
import GalleryLink from '@/components/GalleryLink';

const Gallery = () => {
  const navigate = useNavigate();
  const { data: cards = [], isLoading, isError, error } = useQuery({
    queryKey: ['cards'],
    queryFn: () => listCards(100, 0),
  });
  const [selectedCard, setSelectedCard] = useState<CardSummary | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!selectedCard) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCard(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedCard]);

  const handleDownload = async () => {
    if (!selectedCard || isDownloading) return;

    try {
      setIsDownloading(true);
      const response = await fetch(getCardImageUrl(selectedCard.id));
      if (!response.ok) {
        throw new Error(`Failed to download card (${response.status})`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${selectedCard.name.replace(/\s+/g, '-').toLowerCase()}-card.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 relative">
      <GalleryLink />
      {/* Background gradient fields */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 70% 80%, hsl(335 50% 25% / 0.35) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 30% 20%, hsl(260 45% 22% / 0.4) 0%, transparent 50%)
          `,
        }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="card-font-display text-3xl font-bold text-foreground">Card Gallery</h1>
          <motion.button
            onClick={() => navigate('/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 card-font-display text-sm font-semibold text-white shadow-md transition-all"
            style={{
              background: 'linear-gradient(135deg, hsl(280 50% 45%), hsl(310 55% 50%), hsl(340 55% 50%))',
            }}
          >
            <Sparkles className="h-4 w-4" />
            Create New Card
          </motion.button>
        </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <p className="card-font-display text-xl text-muted-foreground">Loading cards...</p>
          </motion.div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <p className="card-font-display text-xl text-muted-foreground mb-2">Unable to load gallery</p>
            <p className="card-font-body text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Please try again.'}
            </p>
          </motion.div>
        )}

        {!isLoading && !isError && cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <img src={rendyTemplate} alt="Rendy" className="w-24 h-24 opacity-50 mb-4" />
            <p className="card-font-display text-xl text-muted-foreground mb-2">No cards yet!</p>
            <p className="card-font-body text-sm text-muted-foreground mb-6">
              Be the first to create and submit your trading card.
            </p>
            <motion.button
              onClick={() => navigate('/create')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl px-6 py-3 card-font-display text-sm font-bold text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(280 50% 45%), hsl(310 55% 50%), hsl(340 55% 50%))',
              }}
            >
              Create a Card
            </motion.button>
          </motion.div>
        )}

        {!isLoading && !isError && cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {cards.map((card) => (
              <article
                key={card.id}
                className="rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                <img
                  src={getCardThumbnailUrl(card.id)}
                  alt={`${card.name} card`}
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h2 className="card-font-display text-lg text-foreground leading-tight">{card.name}</h2>
                  <p className="card-font-body text-sm text-muted-foreground mt-1">{card.archetype_title}</p>
                </div>
              </article>
            ))}
          </motion.div>
        )}
      </div>

      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-white/20 bg-[hsl(250_30%_12%)] p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute right-3 top-3 rounded-md p-1 text-white/80 hover:text-white"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            <img
              src={getCardImageUrl(selectedCard.id)}
              alt={`${selectedCard.name} full card`}
              className="w-full rounded-lg object-cover"
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="card-font-display text-lg text-foreground truncate">{selectedCard.name}</p>
                <p className="card-font-body text-sm text-muted-foreground truncate">{selectedCard.archetype_title}</p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 card-font-display text-sm font-semibold text-white disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, hsl(180 60% 35%), hsl(210 65% 40%))',
                }}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
