import { CardAnswers, TransformedCard } from './types';
import { oktaAuth } from './okta';

const DEFAULT_API_URL =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')
    ? 'https://rendervous-cards-api.onrender.com'
    : 'http://localhost:3001';

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export interface CardSummary {
  id: string;
  name: string;
  archetype_title: string;
  theme: string;
  created_at: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!oktaAuth) {
    throw new Error('Okta is not configured in the frontend');
  }

  const accessToken = await oktaAuth.getAccessToken();
  if (!accessToken) {
    throw new Error('Missing Okta access token');
  }

  return { Authorization: `Bearer ${accessToken}` };
}

export async function saveCard(
  card: TransformedCard,
  answers: CardAnswers,
  image: string,
): Promise<{ id: string; created_at: string }> {
  // Avoid sending large duplicate image data in answers.photoUrl.
  const { photoUrl: _photoUrl, ...answersWithoutPhoto } = answers;

  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/cards`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ card, answers: answersWithoutPhoto, image }),
  });

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to save card (${res.status}): ${details}`);
  }

  return res.json();
}

export async function listCards(limit = 100, offset = 0): Promise<CardSummary[]> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/cards?limit=${limit}&offset=${offset}`, {
    headers: authHeaders,
  });
  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to fetch cards (${res.status}): ${details}`);
  }
  return res.json();
}

export function getCardThumbnailUrl(cardId: string): string {
  return `${API_URL}/api/cards/${cardId}/thumbnail`;
}

export function getCardImageUrl(cardId: string): string {
  return `${API_URL}/api/cards/${cardId}/image`;
}

export async function deleteCard(cardId: string, adminToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/cards/${cardId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to delete card (${res.status}): ${details}`);
  }
}
