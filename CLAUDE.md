# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Framework**: SvelteKit (Svelte 5) with TailwindCSS v4
- **Deployment**: Static site (`adapter-static`, fully prerendered — no server)
- **Add-ons**: tailwindcss, mcp

## Commands

```bash
npm run dev          # Generate wordpacks.json then start dev server
npm run build        # Generate wordpacks.json then build for production
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
```

> `scripts/generate-wordpacks.js` must run before dev/build — it scans `static/data/*.md` and writes `static/wordpacks.json`, which the app fetches at runtime.

## Architecture

The app is a single-page party game ("Trickster / Imposter") with no backend. All state lives in a singleton Svelte 5 class exported from `src/lib/game.svelte.ts`.

### Game flow (state machine)

`GameState` (in `src/lib/types.ts`) drives which component is rendered in `src/routes/+page.svelte`:

```
HOME → SELECT_PLAYER_COUNT → ENTER_PLAYER_NAMES → SET_OPTIONS
  → PASS_AROUND (reveal word one-by-one) → DISCUSSION
  → VOTING (optional) → RESULTS
```

`game.state` is the single source of truth. Components call methods on `game` to advance the state (e.g. `game.confirmOptions(...)`, `game.advanceReveal()`, `game.castVote(...)`).

### Key files

| File | Purpose |
|------|---------|
| `src/lib/game.svelte.ts` | Singleton `Game` class — all game state and transitions using Svelte 5 `$state` runes |
| `src/lib/types.ts` | `GameState`, `Player`, `Settings`, `Round`, `WordEntry` types |
| `src/lib/parser.ts` | Parses word pack Markdown files; `pickRandom`, `shuffleArray` helpers |
| `src/lib/cookies.ts` | Browser cookie helpers (persists last-used word pack URL) |
| `src/lib/components/SetOptions.svelte` | Fetches `wordpacks.json`, loads Markdown word packs, handles category filtering |
| `static/data/*.md` | Word pack files — one file per language/theme |

### Word pack format

Word pack files live in `static/data/` and follow this Markdown convention:

```markdown
# Category Name
Word: hint text for the imposter
AnotherWord: another hint
```

`parseWords()` in `src/lib/parser.ts` converts these to `WordEntry[]`. The selected word pack URL is persisted in a cookie (`imposter_wordpack_url`).

---

## MCP Tools (Svelte Documentation Server)

You are able to use the Svelte MCP server with access to comprehensive Svelte 5 and SvelteKit documentation.

### 1. list-sections
Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation
Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer
Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link
Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
