import type { WordEntry } from './types';

export function parseWords(markdown: string): WordEntry[] {
  const lines = markdown.split('\n');
  const entries: WordEntry[] = [];
  let currentCategory = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('# ')) {
      currentCategory = line.slice(2).trim();
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Entry missing colon: "${line}"`);
    }

    const word = line.slice(0, colonIndex).trim();
    const hint = line.slice(colonIndex + 1).trim();

    if (!word) {
      throw new Error(`Empty word in entry: "${line}"`);
    }
    if (!currentCategory) {
      throw new Error(`Entry "${word}" appears before any category header`);
    }

    entries.push({ category: currentCategory, word, hint });
  }

  return entries;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
