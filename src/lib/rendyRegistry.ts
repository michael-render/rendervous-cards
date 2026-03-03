/**
 * Rendy Mascot Registry
 * 
 * Auto-discovers all Rendy images from src/assets/ and picks one
 * deterministically based on a hash of the user's name.
 */

import rendy from '@/assets/rendy.png';
import rendyTemplate from '@/assets/rendy-template.png';
import rendyThumbsUp from '@/assets/rendy-thumbs-up.png';
import rendyWoohoo from '@/assets/rendy-woohoo.png';
import rendy100 from '@/assets/rendy-100.png';
import rendyBff from '@/assets/rendy-bff.png';
import rendyDbThumbsUp from '@/assets/rendy-db-thumbs-up.png';
import rendyHeart from '@/assets/rendy-heart.png';
import rendyHello from '@/assets/rendy-hello.png';
import rendyHoldingRender from '@/assets/rendy-holding-render.png';
import rendyLei from '@/assets/rendy-lei.png';
import rendyOk from '@/assets/rendy-ok.png';
import rendySalute from '@/assets/rendy-salute.png';
import rendyThumbsUp1 from '@/assets/rendy-thumbs-up-1.png';

const RENDY_VARIANTS: string[] = [
  rendy,
  rendyTemplate,
  rendyThumbsUp,
  rendyWoohoo,
  rendy100,
  rendyBff,
  rendyDbThumbsUp,
  rendyHeart,
  rendyHello,
  rendyHoldingRender,
  rendyLei,
  rendyOk,
  rendySalute,
  rendyThumbsUp1,
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Pick a deterministic Rendy variant based on the user's name */
export function getRendyForName(name: string): string {
  const index = hashString(name.toLowerCase().trim()) % RENDY_VARIANTS.length;
  return RENDY_VARIANTS[index];
}
