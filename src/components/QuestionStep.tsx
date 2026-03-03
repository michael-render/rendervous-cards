import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

interface QuestionStepProps {
  question: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  step: number;
  total: number;
  isTextarea?: boolean;
  subtitle?: string;
  isPhotoUpload?: boolean;
}

const QuestionStep = ({ question, placeholder, value, onChange, step, total, isTextarea, subtitle, isPhotoUpload }: QuestionStepProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="font-display text-sm text-muted-foreground">
          {step} of {total}
        </span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1 leading-snug">
        {question}
      </h2>
      {subtitle && (
        <p className="font-body text-sm text-muted-foreground mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}

      {isPhotoUpload ? (
        <div className="flex flex-col items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {value ? (
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <img
                src={value}
                alt="Your photo"
                className="w-40 h-40 rounded-2xl object-cover border-4 border-card-border shadow-lg"
              />
              <div className="absolute inset-0 rounded-2xl bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={() => fileRef.current?.click()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-40 h-40 rounded-2xl border-4 border-dashed border-card-border bg-card flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <Camera className="w-10 h-10" />
              <span className="font-display text-sm">Upload Photo</span>
            </motion.button>
          )}
          <p className="font-body text-xs text-muted-foreground">Tap to {value ? 'change' : 'upload'} your photo</p>
        </div>
      ) : isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-card-border bg-card px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none h-28"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-card-border bg-card px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      )}
    </motion.div>
  );
};

export default QuestionStep;
