import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import rendyTemplate from '@/assets/rendy-template.png';

const Gallery = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-12 relative">
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
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="card-font-display text-3xl font-bold text-foreground">Card Gallery</h1>
        </div>

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
      </div>
    </div>
  );
};

export default Gallery;
