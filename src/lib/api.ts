import { CardAnswers, TransformedCard } from './types';

const DEFAULT_API_URL =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')
    ? 'https://rendervous-cards-api.onrender.com'
    : 'http://localhost:3001';

const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export async function saveCard(
  card: TransformedCard,
  answers: CardAnswers,
  image: string,
): Promise<{ id: string; created_at: string }> {
  // Avoid sending large duplicate image data in answers.photoUrl.
  const { photoUrl: _photoUrl, ...answersWithoutPhoto } = answers;

  const res = await fetch(`${API_URL}/api/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card, answers: answersWithoutPhoto, image }),
  });

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to save card (${res.status}): ${details}`);
  }

  return res.json();
}
