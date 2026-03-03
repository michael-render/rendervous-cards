import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchCards, thumbnailUrl, deleteCard } from '@/lib/api';
import { GalleryCard } from '@/lib/types';

const THEME_BORDER: Record<string, string> = {
  coral: 'border-coral',
  mint: 'border-mint',
  sky: 'border-sky',
  lavender: 'border-lavender',
  peach: 'border-peach',
};

const GalleryManage = () => {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: cards, isLoading } = useQuery<GalleryCard[]>({
    queryKey: ['gallery-cards'],
    queryFn: fetchCards,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<GalleryCard[]>(['gallery-cards'], (old) =>
        old ? old.filter((c) => c.id !== id) : []
      );
      setConfirmId(null);
      toast.success('Card deleted');
    },
    onError: () => {
      toast.error('Failed to delete card');
    },
  });

  const hasCards = cards && cards.length > 0;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Manage Cards</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : hasCards ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`relative rounded-lg overflow-hidden border-[3px] ${THEME_BORDER[card.theme] || 'border-card-border'} shadow-sm`}
              >
                <div className="aspect-[3/4]">
                  <img
                    src={thumbnailUrl(card.id)}
                    alt={`${card.name}'s card`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                  <p className="font-display text-sm font-bold text-white leading-tight truncate">{card.name}</p>
                  <p className="font-body text-xs text-white/60 truncate">{card.archetype_title}</p>
                </div>

                {/* Delete button */}
                <AnimatePresence mode="wait">
                  {confirmId === card.id ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-3"
                    >
                      <p className="font-display text-sm font-semibold text-white text-center">Delete this card?</p>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => deleteMutation.mutate(card.id)}
                          disabled={deleteMutation.isPending}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 font-display text-xs font-semibold text-white disabled:opacity-70"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </motion.button>
                        <motion.button
                          onClick={() => setConfirmId(null)}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg border border-white/30 px-3 py-1.5 font-display text-xs font-semibold text-white"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="trash"
                      onClick={() => setConfirmId(card.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white/80 hover:text-red-400 hover:bg-black/70 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-muted-foreground mb-2">No cards to manage</p>
            <p className="font-body text-sm text-muted-foreground">
              Cards you create will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryManage;
