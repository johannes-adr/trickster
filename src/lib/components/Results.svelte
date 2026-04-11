<script lang="ts">
  import { game } from '$lib/game.svelte';

  let caught = $derived(game.caughtImposters);
  let imposters = $derived(game.imposters);
  let round = $derived(game.round);
  let voteResults = $derived(game.voteResults);
  let mostVotedId = $derived(game.mostVotedPlayerId);
  let votingEnabled = $derived(game.settings.votingEnabled);

  function getVoteCount(playerId: number): number {
    return voteResults[playerId] ?? 0;
  }

  function getVotersFor(suspectId: number): string[] {
    return game.players
      .filter((p) => game.votes[p.id] === suspectId)
      .map((p) => p.name);
  }

  // Confetti pieces for the win state
  const confettiColors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];
  const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    delay: Math.random() * 1.5,
    duration: 2.2 + Math.random() * 1.8,
    color: confettiColors[i % confettiColors.length],
    size: 6 + Math.floor(Math.random() * 6),
    drift: (Math.random() - 0.5) * 80,
  }));
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col overflow-y-auto pb-safe-scroll">
  <div class="w-full max-w-md mx-auto flex flex-col gap-5 p-6 py-8">

    <!-- Win/Loss hero banner -->
    {#if imposters.length === 0}
      <div class="rounded-3xl py-12 px-6 text-center bg-zinc-800 border border-zinc-600">
        <div class="text-5xl mb-4">🕊️</div>
        <h2 class="text-3xl font-black text-zinc-200">No Trickster!</h2>
        <p class="text-sm mt-2 text-zinc-400">The variance kicked in — everyone was a civilian this round</p>
      </div>

    {:else if votingEnabled}
      <div class="relative overflow-hidden rounded-3xl py-12 px-6 text-center {caught ? 'bg-emerald-950 border border-emerald-700' : 'bg-[#0f0808] border border-[#200e0e]'}">
        {#if caught}
          {#each confettiPieces as piece, i (i)}
            <span
              class="absolute pointer-events-none rounded-sm"
              style="left: {piece.x}%; top: 0%; width: {piece.size}px; height: {piece.size}px; background: {piece.color}; animation: confettiFall {piece.duration}s {piece.delay}s ease-in forwards; --confetti-drift: {piece.drift}px;"
            ></span>
          {/each}
        {/if}
        <div class="relative">
          <div class="text-5xl mb-4">{caught ? '🎉' : '😈'}</div>
          <h2 class="text-3xl font-black {caught ? 'text-emerald-300' : 'text-[#8a5252]'}">
            {caught ? 'Civilians Win!' : 'Trickster Wins!'}
          </h2>
          <p class="text-sm mt-2 {caught ? 'text-emerald-400' : 'text-[#6b3d3d]'}">
            {caught ? 'The trickster was caught by the vote!' : 'The trickster blended in and survived!'}
          </p>
        </div>
      </div>

    {:else}
      <div class="rounded-3xl py-12 px-6 text-center bg-[#0f0808] border border-[#200e0e]">
        <div class="text-5xl mb-4">🎭</div>
        <h2 class="text-3xl font-black text-[#8a5252]">Trickster Revealed!</h2>
        <p class="text-sm mt-2 text-[#6b3d3d]">Here's who was faking it all along</p>
      </div>
    {/if}

    <!-- Secret word reveal -->
    {#if round}
      <div class="bg-zinc-900 rounded-2xl p-5 text-center">
        <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
          {round.category}
        </p>
        <p class="text-zinc-400 text-sm mb-2">The secret word was</p>
        <h3 class="text-4xl font-black text-white">{round.secretWord}</h3>
        {#if round.hint}
          <p class="text-zinc-400 text-sm mt-2 italic">"{round.hint}"</p>
        {/if}
      </div>
    {/if}

    <!-- Tricksters reveal -->
    {#if imposters.length > 0}
      <div class="bg-zinc-900 rounded-2xl p-5">
        <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
          {imposters.length === 1 ? 'The Trickster' : 'The Tricksters'}
        </p>
        <div class="flex flex-wrap gap-2">
          {#each imposters as imposter (imposter.id)}
            <span class="bg-[#1c1010] text-[#8a5252] rounded-xl px-4 py-2 text-sm font-bold">
              🎭 {imposter.name}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Vote breakdown (voting mode only) -->
    {#if votingEnabled}
      <div class="bg-zinc-900 rounded-2xl p-5">
        <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Vote breakdown
        </p>
        <div class="flex flex-col gap-2">
          {#each game.players as player (player.id)}
            {@const votes = getVoteCount(player.id)}
            {@const voters = getVotersFor(player.id)}
            <div
              class="flex items-center gap-3 py-2.5 px-3 rounded-xl {player.id === mostVotedId ? 'bg-zinc-800' : ''}"
            >
              <span class="text-sm font-semibold flex-1 {player.role === 'imposter' ? 'text-[#8a5252]' : 'text-white'}">
                {player.name}
                {#if player.role === 'imposter'}
                  <span class="text-[#4a2a2a] text-xs ml-1">(trickster)</span>
                {/if}
              </span>
              <span class="text-zinc-500 text-xs">{voters.join(', ')}</span>
              <span class="text-sm font-bold tabular-nums {votes > 0 ? 'text-white' : 'text-zinc-600'}">
                {votes}v
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Action buttons -->
    <div class="flex flex-col gap-3 mt-2">
      <button
        onclick={() => game.playAgain()}
        class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl"
      >
        Play Again (same players)
      </button>
      <button
        onclick={() => game.newGame()}
        class="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-200 font-semibold text-lg py-4 rounded-2xl"
      >
        New Game
      </button>
      <button
        onclick={() => game.goHome()}
        class="w-full text-zinc-500 hover:text-zinc-300 transition-colors text-sm py-2"
      >
        Back to Home
      </button>
    </div>

  </div>
</div>
