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
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col p-6 overflow-y-auto pb-safe-scroll">
  <div class="w-full max-w-sm mx-auto flex flex-col gap-6 py-8">
    <!-- Win/Loss banner (voting mode only) -->
    {#if votingEnabled}
      <div
        class="rounded-3xl p-6 text-center {caught
          ? 'bg-emerald-950 border border-emerald-700'
          : 'bg-rose-950 border border-rose-800'}"
      >
        <div class="text-5xl mb-3">{caught ? '🎉' : '😈'}</div>
        <h2 class="text-3xl font-black {caught ? 'text-emerald-300' : 'text-rose-300'}">
          {caught ? 'Civilians Win!' : 'Trickster Wins!'}
        </h2>
        <p class="text-sm mt-2 {caught ? 'text-emerald-400' : 'text-rose-400'}">
          {caught
            ? 'The trickster was caught by the vote!'
            : 'The trickster blended in and survived!'}
        </p>
      </div>
    {:else}
      <!-- Instant reveal banner -->
      <div class="rounded-3xl p-6 text-center bg-rose-950 border border-rose-800">
        <div class="text-5xl mb-3">🎭</div>
        <h2 class="text-3xl font-black text-rose-300">Trickster Revealed!</h2>
        <p class="text-sm mt-2 text-rose-400">Here's who was faking it all along</p>
      </div>
    {/if}

    <!-- Secret word reveal -->
    {#if round}
      <div class="bg-zinc-900 rounded-2xl p-5 text-center">
        <p class="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
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
    <div class="bg-zinc-900 rounded-2xl p-5">
      <p class="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        {imposters.length === 1 ? 'The Trickster' : 'The Tricksters'}
      </p>
      <div class="flex flex-wrap gap-2">
        {#each imposters as imposter}
          <span class="bg-rose-900 text-rose-200 rounded-lg px-3 py-1.5 text-sm font-semibold">
            🎭 {imposter.name}
          </span>
        {/each}
      </div>
    </div>

    <!-- Vote breakdown (voting mode only) -->
    {#if votingEnabled}
      <div class="bg-zinc-900 rounded-2xl p-5">
        <p class="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Vote breakdown
        </p>
        <div class="flex flex-col gap-2">
          {#each game.players as player}
            {@const votes = getVoteCount(player.id)}
            {@const voters = getVotersFor(player.id)}
            <div
              class="flex items-center gap-3 py-2 px-3 rounded-xl {player.id === mostVotedId
                ? 'bg-zinc-800'
                : ''}"
            >
              <span
                class="text-sm font-semibold flex-1 {player.role === 'imposter'
                  ? 'text-rose-300'
                  : 'text-white'}"
              >
                {player.name}
                {#if player.role === 'imposter'}
                  <span class="text-rose-500 text-xs ml-1">(trickster)</span>
                {/if}
              </span>
              <span class="text-zinc-400 text-xs">{voters.join(', ')}</span>
              <span
                class="text-sm font-bold tabular-nums {votes > 0
                  ? 'text-white'
                  : 'text-zinc-600'}"
              >
                {votes} vote{votes !== 1 ? 's' : ''}
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
