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

<div class="min-h-screen bg-zinc-950 text-white">
  {#key votePhase}
    <div in:fly={{ y: 16, duration: 260, easing: cubicOut }}>
      {#if votePhase === 'handoff'}
        <div class="min-h-screen flex flex-col items-center justify-between p-6 pb-safe">
          <div class="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div class="text-6xl">🗳️</div>
            <div>
              <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
                Pass the phone to
              </p>
              <h2 class="text-7xl font-black">{voter?.name}</h2>
              <p class="text-zinc-600 text-sm mt-4">
                Voter {game.voterIndex + 1} of {game.players.length}
              </p>
            </div>
            <p class="text-zinc-500 text-sm">Your vote is private. No one else will see it.</p>
          </div>
          <button
            onclick={readyToVote}
            class="w-full max-w-sm bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl border border-zinc-700"
          >
            👁 Tap to vote
          </button>
        </div>

      {:else}
        <div class="min-h-screen flex flex-col p-6 pb-safe">
          <div class="flex-1 flex flex-col gap-5 justify-center">
            <div>
              <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
                {voter?.name}
              </p>
              <h2 class="text-2xl font-black">Who do you suspect?</h2>
            </div>

            <div class="flex flex-col gap-3">
              {#each suspects as suspect (suspect.id)}
                <button
                  onclick={() => (selected = suspect.id)}
                  class="w-full py-4 px-5 rounded-2xl text-left font-semibold text-lg transition-all active:scale-95 {selected === suspect.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'}"
                >
                  {selected === suspect.id ? '✓ ' : ''}{suspect.name}
                </button>
              {/each}
            </div>
          </div>

          <button
            onclick={confirmVote}
            disabled={selected === null}
            class="w-full bg-[#2a1010] hover:bg-[#351515] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-white font-bold text-xl py-5 rounded-2xl mt-4"
          >
            Confirm Vote
          </button>
        </div>
      {/if}
    </div>
  {/key}
</div>
