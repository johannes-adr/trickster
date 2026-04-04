<script lang="ts">
  import { game } from '$lib/game.svelte';

  let hintsEnabled = $state(game.settings.hintsEnabled);
  let imposterCount = $state(game.settings.imposterCount);

  const maxImposters = Math.max(1, game.settings.playerCount - 1);

  function decrementImposters() {
    if (imposterCount > 1) imposterCount--;
  }

  function incrementImposters() {
    if (imposterCount < maxImposters) imposterCount++;
  }
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
  <div class="w-full max-w-sm flex flex-col gap-8">
    <div>
      <button
        onclick={() => (game.state = 'ENTER_PLAYER_NAMES')}
        class="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
      >
        ← Back
      </button>
      <h2 class="text-3xl font-black">Game options</h2>
    </div>

    <div class="flex flex-col gap-4">
      <!-- Hints toggle -->
      <div class="bg-zinc-900 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p class="font-semibold text-lg">Show hints</p>
          <p class="text-zinc-400 text-sm mt-0.5">
            Civilians get a hint about the word
          </p>
        </div>
        <button
          onclick={() => (hintsEnabled = !hintsEnabled)}
          class="relative w-14 h-8 rounded-full transition-colors {hintsEnabled
            ? 'bg-indigo-600'
            : 'bg-zinc-700'}"
          role="switch"
          aria-checked={hintsEnabled}
          aria-label="Toggle hints"
        >
          <span
            class="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform {hintsEnabled
              ? 'translate-x-7'
              : 'translate-x-1'}"
          ></span>
        </button>
      </div>

      <!-- Imposter count -->
      <div class="bg-zinc-900 rounded-2xl p-5">
        <p class="font-semibold text-lg">Imposters</p>
        <p class="text-zinc-400 text-sm mt-0.5 mb-4">
          How many imposters in the round
        </p>
        <div class="flex items-center justify-between">
          <button
            onclick={decrementImposters}
            disabled={imposterCount <= 1}
            class="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-2xl font-bold flex items-center justify-center"
          >
            −
          </button>
          <span class="text-4xl font-black">{imposterCount}</span>
          <button
            onclick={incrementImposters}
            disabled={imposterCount >= maxImposters}
            class="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-2xl font-bold flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <button
      onclick={() => game.confirmOptions(hintsEnabled, imposterCount)}
      class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl"
    >
      Start Round
    </button>
  </div>
</div>
