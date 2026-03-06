import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft, Save, Check, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import TradingCard from '@/components/TradingCard';
import GalleryLink from '@/components/GalleryLink';
import { transformAnswers } from '@/lib/cardTransforms';
import { CardAnswers, CARD_THEMES } from '@/lib/types';
import { saveCard } from '@/lib/api';

async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(`Unable to read uploaded image (${response.status})`);
  }

  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Unable to encode uploaded image'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to encode uploaded image'));
    reader.readAsDataURL(blob);
  });
}

async function getFallbackImage(photoUrl: string): Promise<string | null> {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('data:image/')) return photoUrl;
  if (photoUrl.startsWith('blob:')) return blobUrlToDataUrl(photoUrl);
  return null;
}

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

      let dataUrl: string;
      try {
        dataUrl = await toPng(cardRef.current, {
          pixelRatio: 2,
        });
      } catch (error) {
        // Fallback when DOM-to-image fails in some browser/runtime combinations.
        const fallbackImage = await getFallbackImage(answers.photoUrl);
        if (!fallbackImage) {
          throw error;
        }
        dataUrl = fallbackImage;
      }

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
    onError: (error) => {
      console.error('Failed to save card:', error);
      const message = error instanceof Error ? error.message : 'Failed to save card. Please try again.';
      toast.error(message);
    },
  });

  useEffect(() => {
    saveMutation.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeIndex]);

  const handleSave = useCallback(() => {
    if (!saveMutation.isPending) {
      saveMutation.mutate();
    }
  }, [saveMutation]);

  if (!answers || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="card-font-display text-xl text-muted-foreground mb-4">No card data found</p>
          <button
            onClick={() => navigate('/')}
            className="card-font-display text-primary underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <GalleryLink />
      {/* Background gradient fields */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 100% 70% at 70% 90%, hsl(335 50% 25% / 0.4) 0%, transparent 55%),
            radial-gradient(ellipse 80% 50% at 30% 10%, hsl(255 45% 22% / 0.5) 0%, transparent 50%)
          `,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="card-font-display text-2xl font-bold text-foreground">Your Card is Ready! 🎉</h1>
        </motion.div>

        <div ref={cardRef}>
          <TradingCard card={card} answers={answers} />
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <motion.button
            onClick={() => setThemeIndex(i => i + 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 card-font-display text-sm font-semibold text-white shadow-md transition-all"
            style={{
              background: 'linear-gradient(135deg, hsl(270 45% 40%), hsl(310 50% 45%))',
            }}
          >
            <RefreshCw className="w-4 h-4" /> Regenerate
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={saveMutation.isPending || saveMutation.isSuccess}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 card-font-display text-sm font-semibold text-white shadow-md transition-all disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, hsl(180 60% 35%), hsl(210 65% 40%))',
            }}
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
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 card-font-display text-sm font-semibold text-foreground transition-all"
            style={{
              border: '2px solid hsl(270 40% 35%)',
              background: 'hsl(250 30% 15% / 0.5)',
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Start Over
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
