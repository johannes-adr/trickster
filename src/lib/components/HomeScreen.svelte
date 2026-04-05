<script lang="ts">
  import { game } from '$lib/game.svelte';
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 pb-safe">
  <div class="w-full max-w-sm flex flex-col items-center gap-10">
    <div class="flex flex-col items-center gap-3 animate-fade-up">
      <div class="text-7xl select-none">🎭</div>
      <h1 class="text-5xl font-black tracking-tight text-center">Trickster</h1>
      <p class="text-zinc-400 text-center text-lg">
        Find the trickster among your friends
      </p>
    </div>

    <div class="w-full flex flex-col gap-3 text-zinc-400 text-sm bg-zinc-900 rounded-2xl p-5 animate-fade-up-1">
      <div class="flex gap-3 items-start">
        <span class="text-xl">🔤</span>
        <span>Every player gets a secret word — except the trickster</span>
      </div>
      <div class="flex gap-3 items-start">
        <span class="text-xl">🗣️</span>
        <span>Discuss and give clues without revealing the word</span>
      </div>
      <div class="flex gap-3 items-start">
        <span class="text-xl">🗳️</span>
        <span>Vote on who you think is faking it</span>
      </div>
    </div>

    <button
      onclick={() => game.startSetup()}
      class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl py-5 rounded-2xl animate-fade-up-2"
    >
      Start Game
    </button>
  </div>
</div>
