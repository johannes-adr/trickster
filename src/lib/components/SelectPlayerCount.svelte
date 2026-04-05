<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  const MIN = 3;
  const MAX = 10;

  function decrement() {
    if (game.settings.playerCount > MIN) game.settings.playerCount--;
  }

  function increment() {
    if (game.settings.playerCount < MAX) game.settings.playerCount++;
  }
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 pb-safe">
  <div class="w-full max-w-sm flex flex-col gap-10">
    <div>
      <button
        onclick={() => game.goHome()}
        class="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
      >
        ← Back
      </button>
      <h2 class="text-3xl font-black">How many players?</h2>
      <p class="text-zinc-400 mt-1">Minimum {MIN}, maximum {MAX}</p>
    </div>

    <div class="flex items-center justify-between bg-zinc-900 rounded-2xl p-4">
      <button
        onclick={decrement}
        disabled={game.settings.playerCount <= MIN}
        class="w-16 h-16 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-3xl font-bold flex items-center justify-center"
      >
        −
      </button>

      <div class="w-24 flex items-center justify-center overflow-hidden">
        {#key game.settings.playerCount}
          <span
            in:scale={{ start: 0.6, duration: 280, easing: backOut }}
            class="text-6xl font-black tabular-nums block"
          >
            {game.settings.playerCount}
          </span>
        {/key}
      </div>

      <button
        onclick={increment}
        disabled={game.settings.playerCount >= MAX}
        class="w-16 h-16 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-3xl font-bold flex items-center justify-center"
      >
        +
      </button>
    </div>

    <button
      onclick={() => game.confirmPlayerCount()}
      class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl"
    >
      Continue
    </button>
  </div>
</div>
