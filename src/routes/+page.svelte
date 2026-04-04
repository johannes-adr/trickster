<script lang="ts">
  import { game } from '$lib/game.svelte';
  import HomeScreen from '$lib/components/HomeScreen.svelte';
  import SelectPlayerCount from '$lib/components/SelectPlayerCount.svelte';
  import EnterPlayerNames from '$lib/components/EnterPlayerNames.svelte';
  import SetOptions from '$lib/components/SetOptions.svelte';
  import PassAround from '$lib/components/PassAround.svelte';
  import Discussion from '$lib/components/Discussion.svelte';
  import Voting from '$lib/components/Voting.svelte';
  import Results from '$lib/components/Results.svelte';
</script>

{#if game.state === 'HOME'}
  <HomeScreen />
{:else if game.state === 'SELECT_PLAYER_COUNT'}
  <SelectPlayerCount />
{:else if game.state === 'ENTER_PLAYER_NAMES'}
  <EnterPlayerNames />
{:else if game.state === 'SET_OPTIONS'}
  <SetOptions />
{:else if game.state === 'PASS_AROUND'}
  <PassAround />
{:else if game.state === 'DISCUSSION'}
  <Discussion />
{:else if game.state === 'VOTING'}
  <Voting />
{:else if game.state === 'RESULTS'}
  <Results />
{/if}
