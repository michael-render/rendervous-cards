/**
 * Slack Emoji Asset Registry
 *
 * Maps Slack-style emoji names (e.g. ":cat-nodding:") to uploaded image assets.
 * To add a new emoji, drop the image into src/assets/emoji/ and add an entry here.
 *
 * Usage:
 *   resolveEmojiAsset(":cat-nodding:") → { type: 'image', src: '/assets/emoji/cat-nodding.png' }
 *   resolveEmojiAsset(":unknown:")      → { type: 'fallback', name: 'unknown' }
 */

// Eagerly import all emoji images from the emoji asset folder.
// Vite's import.meta.glob with eager: true gives us a static map at build time.
const emojiModules = import.meta.glob<{ default: string }>(
  '../assets/emoji/*.{png,jpg,jpeg,gif,webp,svg,avif}',
  { eager: true }
);

// Build a lookup: filename (without extension) → resolved URL
const emojiAssetMap: Record<string, string> = {};

for (const [path, mod] of Object.entries(emojiModules)) {
  // path looks like "../assets/emoji/cat-nodding.png"
  const filename = path.split('/').pop() ?? '';
  const name = filename.replace(/\.[^.]+$/, '').toLowerCase();
  if (name) {
    emojiAssetMap[name] = mod.default;
  }
}

/**
 * Strip surrounding colons from a Slack-style emoji name.
 * ":cat-nodding:" → "cat-nodding"
 * "cat-nodding"   → "cat-nodding"
 */
function stripColons(input: string): string {
  return input.replace(/^:+|:+$/g, '').trim().toLowerCase();
}

export type EmojiResolution =
  | { type: 'image'; src: string; name: string }
  | { type: 'fallback'; name: string };

/**
 * Resolve a user's emoji input to either an uploaded asset image or a fallback.
 */
export function resolveEmojiAsset(input: string): EmojiResolution {
  const name = stripColons(input);

  if (!name) {
    return { type: 'fallback', name: 'energy' };
  }

  const src = emojiAssetMap[name];
  if (src) {
    return { type: 'image', src, name };
  }

  return { type: 'fallback', name };
}

/** Check if any emoji assets have been uploaded at all */
export function hasEmojiAssets(): boolean {
  return Object.keys(emojiAssetMap).length > 0;
}

/** List all available emoji asset names (for debugging / autocomplete) */
export function listEmojiAssets(): string[] {
  return Object.keys(emojiAssetMap);
}
