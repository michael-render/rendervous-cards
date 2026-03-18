import { ImgHTMLAttributes, useEffect, useState } from 'react';
import { fetchCardAssetBlob } from '@/lib/api';

const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

interface AuthedCardImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  cardId: string;
  variant: 'thumbnail' | 'image';
}

const AuthedCardImage = ({ cardId, variant, alt, className, ...rest }: AuthedCardImageProps) => {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    let nextObjectUrl = '';

    fetchCardAssetBlob(cardId, variant)
      .then((blob) => {
        if (!active) return;
        nextObjectUrl = URL.createObjectURL(blob);
        setSrc(nextObjectUrl);
      })
      .catch((err) => {
        console.error(`Failed to load ${variant} for card ${cardId}:`, err);
      });

    return () => {
      active = false;
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [cardId, variant]);

  return <img src={src || EMPTY_PIXEL} alt={alt} className={className} {...rest} />;
};

export default AuthedCardImage;
