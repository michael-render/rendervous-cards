import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import rendyTemplate from '@/assets/rendy-template.png';

const Gallery = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl font-bold text-foreground">Card Gallery</h1>
        </div>

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
      </div>
    </div>
  );
};

export default Gallery;
