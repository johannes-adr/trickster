import { json } from '@sveltejs/kit';
import { readdirSync } from 'fs';
import { resolve } from 'path';

export function GET() {
  try {
    const dir = resolve('static/data');
    const files = readdirSync(dir)
      .filter((f: string) => f.endsWith('.md'))
      .sort()
      .map((f: string) => ({
        name: f.replace('.md', ''),
        url: `/data/${f}`,
      }));
    return json(files);
  } catch {
    return json([]);
  }
}
