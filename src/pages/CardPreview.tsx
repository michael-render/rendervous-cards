import { useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft, Save, Check, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import TradingCard from '@/components/TradingCard';
import { transformAnswers } from '@/lib/cardTransforms';
import { CardAnswers, CARD_THEMES } from '@/lib/types';
import { saveCard } from '@/lib/api';

const CardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers as CardAnswers | undefined;
  const [themeIndex, setThemeIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const card = useMemo(() => {
    if (!answers) return null;
    return transformAnswers(answers, themeIndex % CARD_THEMES.length, themeIndex);
  }, [answers, themeIndex]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!cardRef.current || !card || !answers) throw new Error('No card to save');

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      return saveCard(card, answers, dataUrl);
    },
    onSuccess: () => {
      toast.success('Card saved to Gallery!', {
        action: {
          label: 'View Gallery',
          onClick: () => navigate('/gallery'),
        },
      });
    },
    onError: () => {
      toast.error('Failed to save card. Please try again.');
    },
  });

  const handleSave = useCallback(() => {
    if (!saveMutation.isPending) {
      saveMutation.mutate();
    }
  }, [saveMutation]);

  if (!answers || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-xl text-muted-foreground mb-4">No card data found</p>
          <button
            onClick={() => navigate('/')}
            className="font-display text-primary underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-56 h-56 rounded-full bg-coral-light/30 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-mint-light/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">Your Card is Ready! 🎉</h1>
        </motion.div>

        <div ref={cardRef}>
          <TradingCard card={card} answers={answers} />
        </div>

        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <motion.button
            onClick={() => setThemeIndex(i => i + 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-display text-sm font-semibold text-accent-foreground shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Regenerate
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={saveMutation.isPending || saveMutation.isSuccess}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground shadow-md transition-all disabled:opacity-70"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saveMutation.isSuccess ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save to Gallery</>
            )}
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-card-border px-5 py-2.5 font-display text-sm font-semibold text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Start Over
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
