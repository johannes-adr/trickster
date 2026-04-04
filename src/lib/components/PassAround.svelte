<script lang="ts">
  import { game } from '$lib/game.svelte';
  import { onMount } from 'svelte';

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

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
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
      <div
        class="w-full max-w-sm flex flex-col items-center gap-6 text-center bg-rose-950 rounded-3xl p-8 border border-rose-800"
      >
        <div class="text-6xl">🎭</div>
        <div>
          <p class="text-rose-300 text-sm font-semibold uppercase tracking-widest mb-2">
            Your role
          </p>
          <h2 class="text-4xl font-black text-rose-400">You are the</h2>
          <h2 class="text-5xl font-black text-white mt-1">IMPOSTER</h2>
          {#if game.settings.hintsEnabled && game.round?.hint}
            <p class="text-rose-300 text-sm mt-5 mb-1 uppercase tracking-widest font-semibold">
              Your decoy word
            </p>
            <p class="text-3xl font-black text-rose-200">{game.round.hint}</p>
          {/if}
        </div>
        <p class="text-rose-400 text-sm">
          Use your decoy word to blend in!
        </p>
        <button
          onclick={hideAndPass}
          class="w-full bg-rose-700 hover:bg-rose-600 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl mt-2"
        >
          Hide & Pass →
        </button>
      </div>

    {:else}
      <div
        class="w-full max-w-sm flex flex-col items-center gap-6 text-center bg-emerald-950 rounded-3xl p-8 border border-emerald-800"
      >
        <div class="text-6xl">🔤</div>
        <div>
          <p class="text-emerald-300 text-sm font-semibold uppercase tracking-widest mb-2">
            Your role — Civilian
          </p>
          <p class="text-emerald-300 text-lg mb-1">
            {game.round?.category}
          </p>
          <h2 class="text-5xl font-black text-white">{game.round?.secretWord}</h2>
        </div>
        <p class="text-emerald-400 text-sm">
          Remember the word — don't say it out loud!
        </p>
        <button
          onclick={hideAndPass}
          class="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl mt-2"
        >
          Hide & Pass →
        </button>
      </div>
    {/if}
  {/if}
</div>
