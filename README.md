# Trickster

A local multiplayer party game for one shared device. One player secretly gets a decoy word — everyone else knows the real secret word. Give clues, debate, and catch the trickster before they blend in.

## How to Play

1. **Setup** — Choose how many players and enter their names
2. **Pass around** — Each player secretly views their role on the shared device
   - **Civilians** see the secret word and its category
   - **The Trickster** sees a similar decoy word (if hints are enabled)
3. **Discussion** — Take turns giving one-word clues about the secret word without saying it directly. A random player is chosen to start
4. **Voting** — Each player privately votes for who they think is the trickster *(can be disabled)*
5. **Results** — The trickster is revealed along with the vote breakdown

## Options

| Option | Description |
|---|---|
| **Word pack** | Choose a built-in pack (EN/DE) or load any `.md` file from a URL |
| **Categories** | Filter which categories from the pack are in play |
| **Hints** | Toggle whether the trickster receives a decoy word |
| **Voting** | Toggle between vote mode and instant reveal mode |
| **Tricksters** | Set how many tricksters are in each round |

Selected word pack URL and player names are saved in cookies and restored on the next visit.

## Word Packs

Word packs are Markdown files stored in `static/data/`. Two packs are included:

- `words_en.md` — English (8 categories, ~70 words)
- `words_de.md` — German translation of the same pack

### Format

```markdown
# Category Name

Word: DecoyWord
AnotherWord: AnotherDecoy
```

Each line is `Word: DecoyWord`. The trickster sees the decoy word; civilians see the real word. You can load any `.md` file from a URL during setup.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build    # production build
npm run preview  # preview the build
npm run check    # type-check
```

**Stack:** SvelteKit · Svelte 5 · TypeScript · Tailwind CSS v4

## Project Structure

```
src/
  lib/
    components/     # UI screens (one per game state)
    game.svelte.ts  # reactive game state machine
    parser.ts       # markdown word pack parser
    cookies.ts      # cookie persistence helpers
    types.ts        # shared TypeScript types
  routes/
    +page.svelte           # state router
    api/wordpacks/         # API route listing available .md files
static/
  data/
    words_en.md
    words_de.md
```
