import { json } from "@sveltejs/kit";

export const prerender = false;

export async function GET() {
  try {
    const response = await fetch("/wordpacks.json");
    const files = await response.json();
    return json(files);
  } catch {
    return json([]);
  }
}
