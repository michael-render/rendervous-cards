import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import QuestionStep from '@/components/QuestionStep';
import { CardAnswers } from '@/lib/types';
import rendyThumbsUp from '@/assets/rendy-thumbs-up.png';

const QUESTIONS = [
  { key: 'name', question: "What's your name?", placeholder: 'e.g. Rendy Raccoon' },
  { key: 'role', question: "What do you do at Render?", subtitle: "This can be literal, metaphorical, or vibes-based.", placeholder: 'e.g. I keep the deploys flowing' },
  { key: 'photoUrl', question: "Upload a photo of yourself", subtitle: "This will be used as your card illustration", placeholder: '', isPhotoUpload: true },
  { key: 'hobby', question: "What do you like to do for fun?", placeholder: 'e.g. I bake elaborate cakes' },
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
      {/* Background gradient fields */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 90% 60% at 90% 90%, hsl(330 50% 25% / 0.4) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 10% 10%, hsl(255 45% 22% / 0.5) 0%, transparent 50%)
          `,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <motion.img
          src={rendyThumbsUp}
          alt="Rendy"
          className="w-16 h-16 mx-auto mb-4"
          style={{ filter: 'drop-shadow(0 0 12px hsl(270 50% 55% / 0.6))' }}
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
            className="inline-flex items-center gap-1 card-font-display text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <motion.button
            onClick={handleNext}
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.05 } : {}}
            whileTap={canProceed ? { scale: 0.95 } : {}}
            className="inline-flex items-center gap-1 rounded-none px-6 py-2.5 card-font-display text-sm font-bold text-white shadow-md disabled:opacity-40 transition-all"
            style={{
              background: canProceed
                ? 'linear-gradient(135deg, hsl(280 50% 45%), hsl(310 55% 50%), hsl(340 55% 50%))'
                : 'hsl(250 30% 25%)',
            }}
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
