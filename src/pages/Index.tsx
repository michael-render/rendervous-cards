import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import rendyWoohoo from '@/assets/rendy-woohoo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient fields */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 100% 70% at 80% 100%, hsl(340 55% 30% / 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 20% 0%, hsl(250 50% 25% / 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 50%, hsl(280 40% 20% / 0.4) 0%, transparent 60%)
          `,
        }} />
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

        <h1 className="card-font-display text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight tracking-tight">
          Render
          <br />
          <span className="bg-gradient-to-r from-[hsl(310,55%,60%)] to-[hsl(345,60%,65%)] bg-clip-text text-transparent">Trading Cards</span>
        </h1>

        <p className="card-font-body text-lg text-muted-foreground mb-8 leading-relaxed">
          Answer a few questions to mint your own collectible trading card! ✨
        </p>

        <motion.button
          onClick={() => navigate('/create')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-none px-8 py-4 card-font-display text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, hsl(280 50% 45%), hsl(310 55% 50%), hsl(340 55% 50%))',
          }}
        >
          <Sparkles className="w-5 h-5" />
          Create My Card
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Index;
