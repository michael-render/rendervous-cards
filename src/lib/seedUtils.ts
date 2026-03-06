/**
 * Seed-based utilities shared across card generators.
 */

export function pickFromSeed(arr: string[], seed: number): string {
  return arr[Math.abs(seed) % arr.length];
}
