<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  type Phase = 'handoff' | 'revealed' | 'done';

  let phase = $state<Phase>('handoff');

  let player = $derived(game.currentRevealPlayer);
  let isLastPlayer = $derived(game.revealIndex === game.players.length - 1);

  function reveal() {
    phase = 'revealed';
  }

  function hideAndPass() {
    if (isLastPlayer) {
      phase = 'done';
    } else {
      phase = 'handoff';
      game.advanceReveal();
    }
  }

  function startDiscussion() {
    game.state = 'DISCUSSION';
  }

  // If the app is backgrounded while role is revealed, hide it
  function handleVisibilityChange() {
    if (document.hidden && phase === 'revealed') {
      phase = 'handoff';
    }
  }

  onMount(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  });
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 pb-safe">
  {#key phase}
    <div in:fly={{ y: 16, duration: 260, easing: cubicOut }}>
      {#if phase === 'done'}
        <!-- All players ready -->
        <div class="w-full max-w-sm flex flex-col items-center gap-8 text-center">
          <div class="text-6xl">✅</div>
          <div>
            <h2 class="text-3xl font-black">All players ready!</h2>
            <p class="text-zinc-400 mt-2 text-lg">Everyone has seen their role.</p>
          </div>
          <button
            onclick={startDiscussion}
            class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl"
          >
            Start Discussion
          </button>
        </div>

      {:else if phase === 'handoff'}
        <!-- Handoff screen: neutral, no info shown -->
        <div class="w-full max-w-sm flex flex-col items-center gap-8 text-center">
          <div class="text-6xl">📱</div>
          <div>
            <p class="text-zinc-400 text-lg">Pass the phone to</p>
            <h2 class="text-4xl font-black mt-1">{player?.name}</h2>
            <p class="text-zinc-500 text-sm mt-3">
              Player {game.revealIndex + 1} of {game.players.length}
            </p>
          </div>
          <button
            onclick={reveal}
            class="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl border border-zinc-700"
          >
            👁 Tap to view your role
          </button>
        </div>

      {:else if phase === 'revealed' && player}
        <!-- Role reveal screen -->
        {#if player.role === 'imposter'}
          {@const isStartingPlayer = game.startingPlayer?.id === player.id}
          {@const showHint = game.round?.hint && (game.settings.hintsEnabled || (game.settings.startingPlayerMode === 'trickster-hint' && isStartingPlayer))}
          <div
            class="w-full max-w-sm flex flex-col items-center gap-6 text-center bg-zinc-900 rounded-3xl p-8 border border-zinc-700"
          >
            <div class="text-6xl">🎭</div>
            <div>
              <p class="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Your role
              </p>
              <h2 class="text-4xl font-black text-zinc-300">You are the</h2>
              <h2 class="text-5xl font-black text-white mt-1">TRICKSTER</h2>
              {#if showHint}
                <p class="text-zinc-400 text-sm mt-5 mb-1 uppercase tracking-widest font-semibold">
                  Your decoy word
                </p>
                <p class="text-3xl font-black text-zinc-200">{game.round?.hint}</p>
                {#if !game.settings.hintsEnabled && isStartingPlayer}
                  <p class="text-zinc-500 text-xs mt-2">Hint granted because you start the round</p>
                {/if}
              {/if}
            </div>
            <p class="text-zinc-400 text-sm">
              {showHint ? 'Use your decoy word to blend in!' : 'Try to figure out the secret word!'}
            </p>
            <button
              onclick={hideAndPass}
              class="w-full bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl mt-2"
            >
              Hide & Pass →
            </button>
          </div>

        {:else}
          <div
            class="w-full max-w-sm flex flex-col items-center gap-6 text-center bg-zinc-900 rounded-3xl p-8 border border-zinc-700"
          >
            <div class="text-6xl">🔤</div>
            <div>
              <p class="text-zinc-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Your role — Civilian
              </p>
              <p class="text-zinc-400 text-lg mb-1">
                {game.round?.category}
              </p>
              <h2 class="text-5xl font-black text-white">{game.round?.secretWord}</h2>
            </div>
            <p class="text-zinc-400 text-sm">
              Remember the word — don't say it out loud!
            </p>
            <button
              onclick={hideAndPass}
              class="w-full bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl mt-2"
            >
              Hide & Pass →
            </button>
          </div>
        {/if}
      {/if}
    </div>
  {/key}
</div>
