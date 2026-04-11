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

<div class="min-h-screen bg-zinc-950 text-white">
  {#key phase}
    <div in:fly={{ y: 16, duration: 260, easing: cubicOut }}>

      {#if phase === 'done'}
        <!-- All players ready -->
        <div class="min-h-screen flex flex-col items-center justify-between p-6 pb-safe">
          <div class="flex-1 flex flex-col items-center justify-center gap-8 text-center">
            <div class="text-6xl">✅</div>
            <div>
              <h2 class="text-3xl font-black">All players ready!</h2>
              <p class="text-zinc-400 mt-2 text-lg">Everyone has seen their role.</p>
            </div>
          </div>
          <button
            onclick={startDiscussion}
            class="w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl"
          >
            Start Discussion
          </button>
        </div>

      {:else if phase === 'handoff'}
        <!-- Handoff screen: neutral, no info shown -->
        <div class="min-h-screen flex flex-col items-center justify-between p-6 pb-safe">
          <div class="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div class="text-6xl">📱</div>
            <div>
              <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
                Pass the phone to
              </p>
              <h2 class="text-7xl font-black">{player?.name}</h2>
              <p class="text-zinc-600 text-sm mt-4">
                {game.revealIndex + 1} of {game.players.length}
              </p>
            </div>
          </div>
          <button
            onclick={reveal}
            class="w-full max-w-sm bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl border border-zinc-700"
          >
            👁 Tap to view your role
          </button>
        </div>

      {:else if phase === 'revealed' && player}
        <!-- Role reveal screen — full bleed, no card wrapper -->
        {#if player.role === 'imposter'}
          {@const isStartingPlayer = game.startingPlayer?.id === player.id}
          {@const showHint = game.round?.hint && (game.settings.hintsEnabled || (game.settings.startingPlayerMode === 'trickster-hint' && isStartingPlayer))}
          <div class="min-h-screen text-white flex flex-col" style="background: #09090b;">
            <div class="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
              <div class="text-7xl">🎭</div>
              <p class="text-[#6b3d3d] text-xs font-semibold uppercase tracking-widest">Your role</p>
              <div>
                <p class="text-2xl font-bold text-[#6b3d3d]/60">You are the</p>
                <h2 class="text-6xl font-black text-white mt-1">TRICKSTER</h2>
              </div>
              {#if showHint}
                <div class="mt-1 w-full bg-[#0f0808] rounded-2xl border border-[#200e0e] p-5">
                  <p class="text-[#6b3d3d] text-xs font-semibold uppercase tracking-widest mb-2">
                    Your decoy word
                  </p>
                  <p class="text-4xl font-black text-[#c47070]">{game.round?.hint}</p>
                  {#if !game.settings.hintsEnabled && isStartingPlayer}
                    <p class="text-[#4a2a2a] text-xs mt-2">Hint granted because you start</p>
                  {/if}
                </div>
              {/if}
              <p class="text-[#6b3d3d]/70 text-sm">
                {showHint ? 'Use your decoy word to blend in!' : 'Figure out the secret word!'}
              </p>
            </div>
            <div class="p-6 pb-safe">
              <button
                onclick={hideAndPass}
                class="w-full bg-[#1c1010] hover:bg-[#261414] active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl"
              >
                Hide & Pass →
              </button>
            </div>
          </div>

        {:else}
          <div class="min-h-screen text-white flex flex-col" style="background: #0d1117;">
            <div class="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <p class="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
                Your role — Civilian
              </p>
              <p class="text-zinc-500 text-lg">{game.round?.category}</p>
              <h2
                class="text-8xl font-black text-white leading-none wrap-break-word w-full"
                style="word-break: break-word;"
              >
                {game.round?.secretWord}
              </h2>
              <p class="text-zinc-500 text-sm mt-2">Remember this — don't say it out loud!</p>
            </div>
            <div class="p-6 pb-safe">
              <button
                onclick={hideAndPass}
                class="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white font-bold text-lg py-4 rounded-2xl"
              >
                Hide & Pass →
              </button>
            </div>
          </div>
        {/if}
      {/if}

    </div>
  {/key}
</div>
