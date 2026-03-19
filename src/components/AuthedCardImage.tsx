import { ImgHTMLAttributes, useEffect, useRef, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { fetchCardAssetBlob } from '@/lib/api';

const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

interface AuthedCardImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  cardId: string;
  variant: 'thumbnail' | 'image';
}

const AuthedCardImage = ({ cardId, variant, alt, className, ...rest }: AuthedCardImageProps) => {
  const [src, setSrc] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [shouldLoad, setShouldLoad] = useState(rest.loading === 'eager');
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (shouldLoad) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          setShouldLoad(true);
        }
      },
      { rootMargin: '300px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    setSrc('');
    setStatus(shouldLoad ? 'loading' : 'idle');
  }, [cardId, variant, shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;

    let active = true;
    let nextObjectUrl = '';

    setStatus('loading');
    fetchCardAssetBlob(cardId, variant)
      .then((blob) => {
        if (!active) return;
        nextObjectUrl = URL.createObjectURL(blob);
        setSrc(nextObjectUrl);
        setStatus('loaded');
      })
      .catch((err) => {
        console.error(`Failed to load ${variant} for card ${cardId}:`, err);
        if (active) setStatus('error');
      });

    return () => {
      active = false;
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [cardId, variant, shouldLoad]);

  return (
    <span ref={containerRef} className="relative block">
      <img src={src || EMPTY_PIXEL} alt={alt} className={className} {...rest} />
      {(status === 'idle' || status === 'loading') && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white/75">
          <Loader2 className="h-5 w-5 animate-spin" />
        </span>
      )}
      {status === 'error' && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white/75">
          <ImageOff className="h-5 w-5" />
        </span>
      )}
    </span>
  );
};

export default AuthedCardImage;
