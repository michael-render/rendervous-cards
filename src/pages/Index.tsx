import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import rendyWoohoo from '@/assets/rendy-woohoo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-coral-light/40 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-lavender-light/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-mint-light/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 max-w-md"
      >
        <motion.img
          src={rendyWoohoo}
          alt="Rendy the Raccoon"
          className="w-36 h-36 mx-auto mb-6 drop-shadow-lg"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
          Render
          <br />
          <span className="text-primary">Stat Cards</span>
        </h1>

        <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">
          Answer a few fun questions and get your own collectible trading card! ✨
        </p>

        <motion.button
          onClick={() => navigate('/create')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-lg font-bold text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        >
          <Sparkles className="w-5 h-5" />
          Create My Card
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Index;
