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

const cardsListCache = new Map<string, { etag: string; data: CardSummary[] }>();

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

function mergeHeaders(
  authHeaders: Record<string, string>,
  headers?: HeadersInit,
): Headers {
  const merged = new Headers(headers || {});
  Object.entries(authHeaders).forEach(([key, value]) => {
    merged.set(key, value);
  });
  return merged;
}

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  return fetch(input, {
    ...init,
    headers: mergeHeaders(authHeaders, init.headers),
  });
}

export async function saveCard(
  card: TransformedCard,
  answers: CardAnswers,
  image: string,
): Promise<{ id: string; created_at: string }> {
  // Avoid sending large duplicate image data in answers.photoUrl.
  const { photoUrl: _photoUrl, ...answersWithoutPhoto } = answers;

  const res = await authedFetch(`${API_URL}/api/cards`, {
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

export async function listCards(limit = 100, offset = 0): Promise<CardSummary[]> {
  const cacheKey = `${limit}:${offset}`;
  const cached = cardsListCache.get(cacheKey);

  const headers: HeadersInit = {};
  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  const res = await authedFetch(`${API_URL}/api/cards?limit=${limit}&offset=${offset}`, { headers });

  if (res.status === 304) {
    return cached?.data ?? [];
  }

  if (!res.ok) {
    const details = await res.text().catch(() => '');
    throw new Error(`Failed to fetch cards (${res.status}): ${details}`);
  }

  const data = (await res.json()) as CardSummary[];
  const etag = res.headers.get('etag');
  if (etag) {
    cardsListCache.set(cacheKey, { etag, data });
  } else {
    cardsListCache.delete(cacheKey);
  }

  return data;
}

export function getCardThumbnailUrl(cardId: string): string {
  return `${API_URL}/api/cards/${cardId}/thumbnail`;
}

export function getCardImageUrl(cardId: string): string {
  return `${API_URL}/api/cards/${cardId}/image`;
}

export async function fetchCardAssetBlob(cardId: string, variant: 'thumbnail' | 'image'): Promise<Blob> {
  const path = variant === 'thumbnail' ? getCardThumbnailUrl(cardId) : getCardImageUrl(cardId);
  let res = await authedFetch(path);

  // Some older cards may not have thumbnails; try full image before failing.
  if (!res.ok && res.status === 404 && variant === 'thumbnail') {
    res = await authedFetch(getCardImageUrl(cardId));
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${variant} (${res.status})`);
  }
  return res.blob();
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
