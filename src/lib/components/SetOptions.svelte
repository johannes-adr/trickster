<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { SvelteSet } from "svelte/reactivity";
  import { game } from "$lib/game.svelte";
  import { parseWords } from "$lib/parser";
  import type { WordEntry, StartingPlayerMode } from "$lib/types";
  import { getCookie, setCookie } from "$lib/cookies";

  let hintsEnabled = $state(game.settings.hintsEnabled);
  let votingEnabled = $state(game.settings.votingEnabled);
  let imposterCount = $state(game.settings.imposterCount);
  let tricksterVarianceProbability = $state(game.settings.tricksterVarianceProbability);
  let startingPlayerMode = $state<StartingPlayerMode>(game.settings.startingPlayerMode);
  let tricksterStartWeight = $state(game.settings.tricksterStartWeight);

  const maxImposters = Math.max(1, game.settings.playerCount - 1);

  type Pack = { name: string; url: string };

  let packs = $state<Pack[]>([]);
  let selectedUrl = $state("");
  let customUrl = $state("");
  let useCustom = $state(false);

  // Pack loading
  let packLoading = $state(false);
  let packError = $state("");
  let loadedEntries = $state<WordEntry[]>([]);
  let loadedForUrl = $state("");

  // Category selection — SvelteSet is self-reactive, never reassign it
  let selectedCategories = new SvelteSet<string>();
  let availableCategories = $derived([
    ...new SvelteSet(loadedEntries.map((e) => e.category)),
  ]);
  let allSelected = $derived(
    availableCategories.length > 0 &&
      availableCategories.every((c) => selectedCategories.has(c)),
  );
  let filteredEntries = $derived(
    loadedEntries.filter((e) => selectedCategories.has(e.category)),
  );

  const activeUrl = $derived(useCustom ? customUrl.trim() : selectedUrl);
  const packIsLoaded = $derived(
    loadedForUrl === activeUrl && loadedEntries.length > 0,
  );
  const canStart = $derived(
    packIsLoaded && filteredEntries.length > 0 && !packLoading,
  );

  // Accordion open states
  let openWordpack = $state(true);
  let openSettings = $state(true);
  let openTrickster = $state(false);
  let openStarting = $state(false);

  onMount(async () => {
    const res = await fetch("./wordpacks.json");
    const data: Pack[] = await res.json();
    packs = data;

    const saved = getCookie("imposter_wordpack_url");
    if (saved) {
      const found = data.find((p) => p.url === saved);
      if (found) {
        selectedUrl = saved;
        useCustom = false;
      } else {
        customUrl = saved;
        useCustom = true;
      }
    } else if (data.length > 0) {
      selectedUrl = data[0].url;
    }
    // Auto-load whichever preset is active
    if (!useCustom && selectedUrl) {
      await loadPack(selectedUrl);
    }
  });

  async function loadPack(url: string) {
    packError = "";
    packLoading = true;
    try {
      const res = await fetch("./" + url);
      if (!res.ok) throw new Error(`Could not fetch pack (${res.status})`);
      const markdown = await res.text();
      const entries = parseWords(markdown);
      if (entries.length === 0)
        throw new Error("Word pack is empty or invalid");
      loadedEntries = entries;
      loadedForUrl = url;
      // Select all categories by default
      selectedCategories.clear();
      entries.forEach((e) => selectedCategories.add(e.category));
    } catch (e) {
      packError = e instanceof Error ? e.message : "Failed to load word pack";
      loadedEntries = [];
      loadedForUrl = "";
    } finally {
      packLoading = false;
    }
  }

  async function selectPreset(url: string) {
    selectedUrl = url;
    useCustom = false;
    await loadPack(url);
  }

  function toggleCategory(cat: string) {
    if (selectedCategories.has(cat)) selectedCategories.delete(cat);
    else selectedCategories.add(cat);
  }

  function toggleAll() {
    if (allSelected) {
      selectedCategories.clear();
    } else {
      availableCategories.forEach((c) => selectedCategories.add(c));
    }
  }

  function decrementImposters() {
    if (imposterCount > 1) imposterCount--;
  }

  function incrementImposters() {
    if (imposterCount < maxImposters) imposterCount++;
  }

  function formatPackName(name: string): string {
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function handleStart() {
    setCookie("imposter_wordpack_url", activeUrl);
    game.confirmOptions(hintsEnabled, imposterCount, filteredEntries, votingEnabled, tricksterVarianceProbability, startingPlayerMode, tricksterStartWeight);
  }
</script>

<div class="min-h-screen bg-zinc-950 text-white flex flex-col overflow-y-auto pb-safe-scroll">
  <div class="w-full max-w-md mx-auto flex flex-col gap-4 p-6 py-8">

    <div>
      <button
        onclick={() => (game.state = "ENTER_PLAYER_NAMES")}
        class="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
      >
        ← Back
      </button>
      <h2 class="text-3xl font-black">Game options</h2>
    </div>

    <!-- Accordion: Word Pack & Categories -->
    <div class="bg-zinc-900 rounded-2xl overflow-hidden">
      <button
        onclick={() => (openWordpack = !openWordpack)}
        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span class="font-semibold text-lg">Word Pack & Categories</span>
        <span class="text-zinc-400 text-sm transition-transform {openWordpack ? 'rotate-180' : ''} inline-block">
          ↓
        </span>
      </button>

      {#if openWordpack}
        <div transition:slide={{ duration: 200 }} class="px-5 pb-5 flex flex-col gap-3 border-t border-zinc-800">
          <div class="pt-3 flex flex-col gap-2">
            {#if packs.length > 0}
              {#each packs as pack (pack.url)}
                <button
                  onclick={() => selectPreset(pack.url)}
                  class="flex items-center justify-between py-3 px-4 rounded-xl text-left transition-all {!useCustom && selectedUrl === pack.url ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
                >
                  <span class="text-base font-medium">{formatPackName(pack.name)}</span>
                  {#if !useCustom && selectedUrl === pack.url && packLoading}
                    <span class="text-sm opacity-70">Loading…</span>
                  {/if}
                </button>
              {/each}
            {/if}
            <button
              onclick={() => {
                useCustom = !useCustom;
                loadedEntries = [];
                loadedForUrl = "";
                packError = "";
              }}
              class="flex items-center gap-3 py-3 px-4 rounded-xl text-left transition-all {useCustom ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
            >
              <span class="text-base font-medium">Load from URL…</span>
            </button>

            {#if useCustom}
              <div class="flex gap-2">
                <input
                  bind:value={customUrl}
                  placeholder="https://example.com/words.md"
                  type="url"
                  class="flex-1 bg-zinc-800 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onclick={() => loadPack(customUrl.trim())}
                  disabled={customUrl.trim().length === 0 || packLoading}
                  class="bg-zinc-700 hover:bg-zinc-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all px-4 rounded-xl text-sm font-semibold"
                >
                  {packLoading ? "…" : "Load"}
                </button>
              </div>
            {/if}
          </div>

          {#if availableCategories.length > 0}
            <div class="flex flex-col gap-3 pt-1">
              <div class="flex items-center justify-between">
                <p class="font-medium text-sm text-zinc-300">Categories</p>
                <button
                  onclick={toggleAll}
                  class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                {#each availableCategories as cat (cat)}
                  <button
                    onclick={() => toggleCategory(cat)}
                    class="py-1.5 px-3 rounded-lg text-sm font-medium transition-all active:scale-95 {selectedCategories.has(cat) ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}"
                  >
                    {cat}
                  </button>
                {/each}
              </div>
              {#if filteredEntries.length === 0}
                <p class="text-[#8a5252] text-xs">Select at least one category to continue.</p>
              {:else}
                <p class="text-zinc-600 text-xs">{filteredEntries.length} words available</p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Accordion: Game Settings -->
    <div class="bg-zinc-900 rounded-2xl overflow-hidden">
      <button
        onclick={() => (openSettings = !openSettings)}
        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span class="font-semibold text-lg">Game Settings</span>
        <span class="text-zinc-400 text-sm transition-transform {openSettings ? 'rotate-180' : ''} inline-block">
          ↓
        </span>
      </button>

      {#if openSettings}
        <div transition:slide={{ duration: 200 }} class="flex flex-col divide-y divide-zinc-800 border-t border-zinc-800">
          <!-- Hints toggle -->
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="font-semibold">Show hints</p>
              <p class="text-zinc-400 text-sm mt-0.5">Trickster gets a similar decoy word</p>
            </div>
            <button
              onclick={() => (hintsEnabled = !hintsEnabled)}
              class="relative w-14 h-8 rounded-full transition-colors shrink-0 {hintsEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}"
              role="switch"
              aria-checked={hintsEnabled}
              aria-label="Toggle hints"
            >
              <span class="absolute top-1 left-0 w-6 h-6 rounded-full bg-white shadow transition-transform {hintsEnabled ? 'translate-x-7' : 'translate-x-1'}"></span>
            </button>
          </div>

          <!-- Voting toggle -->
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="font-semibold">Voting</p>
              <p class="text-zinc-400 text-sm mt-0.5">
                {votingEnabled ? 'Vote to find the trickster' : 'Instantly reveal the trickster'}
              </p>
            </div>
            <button
              onclick={() => (votingEnabled = !votingEnabled)}
              class="relative w-14 h-8 rounded-full transition-colors shrink-0 {votingEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}"
              role="switch"
              aria-checked={votingEnabled}
              aria-label="Toggle voting"
            >
              <span class="absolute top-1 left-0 w-6 h-6 rounded-full bg-white shadow transition-transform {votingEnabled ? 'translate-x-7' : 'translate-x-1'}"></span>
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Accordion: Trickster Rules -->
    <div class="bg-zinc-900 rounded-2xl overflow-hidden">
      <button
        onclick={() => (openTrickster = !openTrickster)}
        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span class="font-semibold text-lg">Trickster Rules</span>
        <span class="text-zinc-400 text-sm transition-transform {openTrickster ? 'rotate-180' : ''} inline-block">
          ↓
        </span>
      </button>

      {#if openTrickster}
        <div transition:slide={{ duration: 200 }} class="flex flex-col divide-y divide-zinc-800 border-t border-zinc-800">
          <!-- Trickster count -->
          <div class="px-5 py-4">
            <p class="font-semibold mb-0.5">Number of Tricksters</p>
            <p class="text-zinc-400 text-sm mb-4">How many tricksters per round</p>
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

          <!-- Trickster variance -->
          <div class="px-5 py-4">
            <div class="flex items-center justify-between mb-0.5">
              <p class="font-semibold">Trickster variance</p>
              <span class="text-indigo-400 font-bold tabular-nums">{tricksterVarianceProbability}%</span>
            </div>
            <p class="text-zinc-400 text-sm mb-4">
              Chance the trickster count is re-rolled randomly
            </p>
            <input type="range" min="0" max="100" step="5" bind:value={tricksterVarianceProbability} class="w-full accent-indigo-500" />
            <div class="flex justify-between text-zinc-600 text-xs mt-1">
              <span>Off</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Accordion: Starting Player -->
    <div class="bg-zinc-900 rounded-2xl overflow-hidden">
      <button
        onclick={() => (openStarting = !openStarting)}
        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span class="font-semibold text-lg">Starting Player</span>
        <span class="text-zinc-400 text-sm transition-transform {openStarting ? 'rotate-180' : ''} inline-block">
          ↓
        </span>
      </button>

      {#if openStarting}
        <div transition:slide={{ duration: 200 }} class="px-5 pb-5 flex flex-col gap-3 border-t border-zinc-800">
          <div class="pt-3 flex flex-col gap-2">
            <button
              onclick={() => (startingPlayerMode = 'uniform')}
              class="flex flex-col items-start py-3 px-4 rounded-xl text-left transition-all {startingPlayerMode === 'uniform' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
            >
              <span class="text-base font-medium">Gleichverteilt</span>
              <span class="text-xs mt-0.5 opacity-70">Everyone has the same chance to start</span>
            </button>
            <button
              onclick={() => (startingPlayerMode = 'trickster-disadvantaged')}
              class="flex flex-col items-start py-3 px-4 rounded-xl text-left transition-all {startingPlayerMode === 'trickster-disadvantaged' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
            >
              <span class="text-base font-medium">Trickster less likely to start</span>
              <span class="text-xs mt-0.5 opacity-70">Civilians are favoured as starting player</span>
            </button>
            <button
              onclick={() => (startingPlayerMode = 'trickster-hint')}
              class="flex flex-col items-start py-3 px-4 rounded-xl text-left transition-all {startingPlayerMode === 'trickster-hint' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
            >
              <span class="text-base font-medium">Trickster gets hint on start</span>
              <span class="text-xs mt-0.5 opacity-70">If the trickster starts, they receive a hint regardless of hints setting</span>
            </button>
          </div>

          {#if startingPlayerMode === 'trickster-disadvantaged'}
            <div class="pt-1">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-zinc-300 font-medium">Trickster start weight</p>
                <span class="text-indigo-400 font-bold tabular-nums text-sm">{tricksterStartWeight}%</span>
              </div>
              <input type="range" min="0" max="100" step="10" bind:value={tricksterStartWeight} class="w-full accent-indigo-500" />
              <div class="flex justify-between text-zinc-600 text-xs mt-1">
                <span>Never starts</span>
                <span>Equal chance</span>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if packError}
      <p class="text-[#8a5252] text-sm font-medium">⚠️ {packError}</p>
    {/if}

    <button
      onclick={handleStart}
      disabled={!canStart}
      class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-white font-bold text-xl py-5 rounded-2xl"
    >
      Start Round
    </button>
  </div>
</div>
