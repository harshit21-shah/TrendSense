/** Capitalize only the first character; leave the rest intact */
export function sentenceCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Convert "ai safety and security" → "AI Safety and Security" */
export function toTitleCase(s: string): string {
  const ALWAYS_UPPER = new Set(['ai', 'agi', 'llm', 'llms', 'ml', 'api', 'ui', 'ux', 'b2b', 'b2c', 'saas', 'nft', 'defi']);
  return s
    .split(' ')
    .map((word, i) => {
      const low = word.toLowerCase();
      if (ALWAYS_UPPER.has(low)) return word.toUpperCase();
      if (i === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      // minor words lowercase unless first
      const MINOR = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'up', 'as']);
      if (MINOR.has(low)) return low;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
