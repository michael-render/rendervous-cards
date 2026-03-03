import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuestionStep from '@/components/QuestionStep';
import { CardAnswers } from '@/lib/types';
import rendyThumbsUp from '@/assets/rendy-thumbs-up.png';

const QUESTIONS = [
  { key: 'name', question: "What's your name?", placeholder: 'e.g. Alex Chen' },
  { key: 'role', question: "What's your role at Render?", subtitle: "(Used to generate your card's character title — not shown verbatim)", placeholder: 'e.g. Product Designer' },
  { key: 'photoUrl', question: "Upload a photo of yourself", subtitle: "This will be used as your card illustration", placeholder: '', isPhotoUpload: true },
  { key: 'hobby', question: "What do you like to do outside of work?", placeholder: 'e.g. I bake elaborate cakes' },
  { key: 'unpopularOpinion', question: "What's your most #unpopular-opinion?", placeholder: 'e.g. Pizza is overrated' },
  { key: 'workHack', question: "What's a work hack you swear by?", placeholder: 'e.g. Color-coded calendar blocks' },
  
  { key: 'desertIslandItems', question: "3 non-essentials you'd bring to a desert island?", placeholder: 'e.g. guitar, sketchbook, hot sauce' },
  { key: 'mundaneSuperpower', question: "What's your mundane superpower?", placeholder: 'e.g. Always finds the best parking spot' },
  { key: 'motivation', question: "What motivates you?", placeholder: 'e.g. Helping people succeed' },
] as const;

const CreateCard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = QUESTIONS[step];
  const value = answers[current.key] || '';
  const isLast = step === QUESTIONS.length - 1;
  const canProceed = value.trim().length > 0;

  const handleChange = useCallback((val: string) => {
    setAnswers(prev => ({ ...prev, [current.key]: val }));
  }, [current.key]);

  const handleNext = () => {
    if (!canProceed) return;
    if (isLast) {
      const cardAnswers: CardAnswers = {
        name: answers.name || '',
        role: answers.role || '',
        photoUrl: answers.photoUrl || '',
        hobby: answers.hobby || '',
        unpopularOpinion: answers.unpopularOpinion || '',
        workHack: answers.workHack || '',
        
        desertIslandItems: answers.desertIslandItems || '',
        mundaneSuperpower: answers.mundaneSuperpower || '',
        motivation: answers.motivation || '',
      };
      navigate('/preview', { state: { answers: cardAnswers } });
    } else {
      setStep(s => s + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed) handleNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative" onKeyDown={handleKeyDown}>
      {/* Gallery link */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutGrid className="w-4 h-4" /> Gallery
        </Link>
      </div>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-peach-light/30 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-36 h-36 rounded-full bg-sky-light/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <motion.img
          src={rendyThumbsUp}
          alt="Rendy"
          className="w-16 h-16 mx-auto mb-4 opacity-70"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <AnimatePresence mode="wait">
          <QuestionStep
            key={step}
            question={current.question}
            placeholder={current.placeholder}
            value={value}
            onChange={handleChange}
            step={step + 1}
            total={QUESTIONS.length}
            isTextarea={'isTextarea' in current ? (current as any).isTextarea : false}
            subtitle={'subtitle' in current ? (current as any).subtitle : undefined}
            isPhotoUpload={'isPhotoUpload' in current ? (current as any).isPhotoUpload : false}
          />
        </AnimatePresence>

        <div className="flex justify-between mt-6 max-w-lg mx-auto">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 font-display text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <motion.button
            onClick={handleNext}
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.05 } : {}}
            whileTap={canProceed ? { scale: 0.95 } : {}}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-6 py-2.5 font-display text-sm font-bold text-primary-foreground shadow-md disabled:opacity-40 transition-all"
          >
            {isLast ? (
              <>
                <Sparkles className="w-4 h-4" /> Generate Card
              </>
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CreateCard;
