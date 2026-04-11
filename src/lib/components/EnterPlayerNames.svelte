<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '$lib/game.svelte';
  import { getCookie, setCookie } from '$lib/cookies';

  const COOKIE_KEY = 'imposter_player_names';

  let names = $state<string[]>(
    Array.from({ length: game.settings.playerCount }, () => '')
  );

  onMount(() => {
    const saved = getCookie(COOKIE_KEY);
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        names = Array.from({ length: game.settings.playerCount }, (_, i) => parsed[i] ?? '');
      } catch {
        // ignore malformed cookie
      }
    }
  });

  let hasDuplicates = $derived(
    (() => {
      const filled = names.map((n) => n.trim().toLowerCase()).filter(Boolean);
      return filled.length !== new Set(filled).size;
    })()
  );

  function handleSubmit() {
    if (hasDuplicates) return;
    setCookie(COOKIE_KEY, JSON.stringify(names));
    game.confirmPlayerNames(names);
  }
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col p-6 overflow-y-auto pb-safe-scroll">
  <div class="w-full max-w-md mx-auto flex flex-col gap-6 py-8">
    <div>
      <button
        onclick={() => (game.state = 'SELECT_PLAYER_COUNT')}
        class="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
      >
        ← Back
      </button>
      <h2 class="text-3xl font-black">Enter player names</h2>
      <p class="text-zinc-400 mt-1">Leave blank to auto-fill</p>
    </div>

    <div class="flex flex-col gap-3">
      {#each names as _, i (i)}
        <div class="relative">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold select-none"
          >
            {i + 1}.
          </span>
          <input
            bind:value={names[i]}
            maxlength="20"
            placeholder="Player {i + 1}"
            class="w-full bg-zinc-900 rounded-xl py-4 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          />
        </div>
      {/each}
    </div>

    {#if hasDuplicates}
      <p class="text-[#8a5252] text-sm font-medium">
        ⚠️ Player names must be unique
      </p>
    {/if}

    <button
      onclick={handleSubmit}
      disabled={hasDuplicates}
      class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-white font-bold text-xl py-5 rounded-2xl mt-2"
    >
      Continue
    </button>
  </div>
</div>
