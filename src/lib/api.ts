import { CardAnswers, TransformedCard, GalleryCard } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function saveCard(
  card: TransformedCard,
  answers: CardAnswers,
  image: string
): Promise<{ id: string; created_at: string }> {
  const res = await fetch(`${API_URL}/api/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card, answers, image }),
  });
  if (!res.ok) throw new Error('Failed to save card');
  return res.json();
}

export async function fetchCards(): Promise<GalleryCard[]> {
  const res = await fetch(`${API_URL}/api/cards`);
  if (!res.ok) throw new Error('Failed to fetch cards');
  return res.json();
}

export function thumbnailUrl(id: string): string {
  return `${API_URL}/api/cards/${id}/thumbnail`;
}

export function imageUrl(id: string): string {
  return `${API_URL}/api/cards/${id}/image`;
}
