<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  type VotePhase = 'handoff' | 'voting';

  let votePhase = $state<VotePhase>('handoff');
  let selected = $state<number | null>(null);

  let voter = $derived(game.currentVoter);
  let suspects = $derived(game.players.filter((p) => p.id !== voter?.id));

  function readyToVote() {
    votePhase = 'voting';
    selected = null;
  }

  function confirmVote() {
    if (selected === null) return;
    game.castVote(selected);
    votePhase = 'handoff';
    selected = null;
  }
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 pb-safe">
  <div class="w-full max-w-sm flex flex-col gap-6">
    {#key votePhase}
      <div in:fly={{ y: 16, duration: 260, easing: cubicOut }}>
        {#if votePhase === 'handoff'}
          <div class="flex flex-col items-center gap-8 text-center">
            <div class="text-5xl">🗳️</div>
            <div>
              <p class="text-zinc-400 text-lg">Pass the phone to</p>
              <h2 class="text-4xl font-black mt-1">{voter?.name}</h2>
              <p class="text-zinc-500 text-sm mt-3">
                Voter {game.voterIndex + 1} of {game.players.length}
              </p>
            </div>
            <p class="text-zinc-400 text-sm">
              Your vote is private. No one else will see it.
            </p>
            <button
              onclick={readyToVote}
              class="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl border border-zinc-700"
            >
              👁 Tap to vote
            </button>
          </div>

        {:else}
          <div class="flex flex-col gap-5">
            <div>
              <p class="text-zinc-400 text-sm">
                {voter?.name}, who do you suspect?
              </p>
              <h2 class="text-2xl font-black mt-1">Cast your vote</h2>
            </div>

            <div class="flex flex-col gap-3">
              {#each suspects as suspect}
                <button
                  onclick={() => (selected = suspect.id)}
                  class="w-full py-4 px-5 rounded-2xl text-left font-semibold text-lg transition-all active:scale-95 {selected ===
                  suspect.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'}"
                >
                  {selected === suspect.id ? '✓ ' : ''}{suspect.name}
                </button>
              {/each}
            </div>

            <button
              onclick={confirmVote}
              disabled={selected === null}
              class="w-full bg-rose-700 hover:bg-rose-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-white font-bold text-xl py-5 rounded-2xl mt-2"
            >
              Confirm Vote
            </button>
          </div>
        {/if}
      </div>
    {/key}
  </div>
</div>
