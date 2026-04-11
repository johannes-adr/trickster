<script lang="ts">
  import { game } from '$lib/game.svelte';
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
  <div class="w-full max-w-md flex flex-col gap-8">
    <div class="text-center">
      <div class="text-5xl mb-4">🗣️</div>
      <h2 class="text-3xl font-black">Discussion</h2>
      <p class="text-zinc-400 mt-2 text-base leading-relaxed">
        Take turns giving a one-word clue about the secret word.<br />
        The trickster is trying to blend in!
      </p>
    </div>

    {#if game.startingPlayer}
      <div class="bg-indigo-950 border border-indigo-800 rounded-2xl p-5 text-center">
        <p class="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Start with</p>
        <p class="text-2xl font-black text-white">{game.startingPlayer.name}</p>
      </div>
    {/if}

    <div class="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-3">
      <p class="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Tips</p>
      <div class="flex gap-3 text-sm text-zinc-300">
        <span>💡</span>
        <span>Be descriptive but not too obvious</span>
      </div>
      <div class="flex gap-3 text-sm text-zinc-300">
        <span>🎯</span>
        <span>Watch for clues that feel off or vague</span>
      </div>
      <div class="flex gap-3 text-sm text-zinc-300">
        <span>🤫</span>
        <span>Never say the secret word directly</span>
      </div>
    </div>

    <!-- Suspect grid -->
    <div class="flex flex-col gap-3">
      <p class="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Players</p>
      <div class="grid grid-cols-2 gap-2">
        {#each game.players as player, i (player.id)}
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <span class="text-zinc-600 text-xs font-bold w-4 shrink-0">{i + 1}</span>
            <span class="text-zinc-200 font-medium text-sm truncate">{player.name}</span>
          </div>
        {/each}
      </div>
    </div>

    {#if game.settings.votingEnabled}
      <button
        onclick={() => game.startVoting()}
        class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl"
      >
        Start Voting
      </button>
    {:else}
      <button
        onclick={() => game.revealTrickster()}
        class="w-full bg-[#2a1010] hover:bg-[#351515] active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl"
      >
        Reveal Trickster
      </button>
    {/if}
  </div>
</div>
