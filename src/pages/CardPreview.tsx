import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import TradingCard from '@/components/TradingCard';
import { transformAnswers } from '@/lib/cardTransforms';
import { CardAnswers, CARD_THEMES } from '@/lib/types';

const CardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers as CardAnswers | undefined;
  const [themeIndex, setThemeIndex] = useState(0);

  const card = useMemo(() => {
    if (!answers) return null;
    return transformAnswers(answers, themeIndex % CARD_THEMES.length, themeIndex);
  }, [answers, themeIndex]);

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

        <TradingCard card={card} answers={answers} />

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
