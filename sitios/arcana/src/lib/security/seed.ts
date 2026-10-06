export function seedToIndex(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export function deriveSequenceFromSeed(levelSeed: string, count: number, pool: string[]): string[] {
  const sequence: string[] = [];
  for (let i = 0; i < count; i++) {
    sequence.push(pool[seedToIndex(`${levelSeed}:sym${i}`, pool.length)]);
  }
  return sequence;
}
