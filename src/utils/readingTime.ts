// Vietnamese is written syllable by syllable, so a "word" here is a syllable; ~220/min is a comfortable pace.
const WORDS_PER_MINUTE = 220;

/** Estimated reading time in whole minutes (min 1) for a Markdown body; HTML tags and URLs are ignored. */
export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*_>`\[\]|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
