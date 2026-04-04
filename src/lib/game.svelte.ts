import { pickRandom, shuffleArray } from './parser';
import type { GameState, Player, Settings, Round, WordEntry } from './types';

class Game {
  state = $state<GameState>('HOME');

  settings = $state<Settings>({
    playerCount: 4,
    hintsEnabled: true,
    imposterCount: 1,
  });

  players = $state<Player[]>([]);
  round = $state<Round | null>(null);
  revealIndex = $state(0);
  voterIndex = $state(0);
  votes = $state<Record<number, number>>({});
  wordEntries = $state<WordEntry[]>([]);

  get currentRevealPlayer(): Player | undefined {
    return this.players[this.revealIndex];
  }

  get currentVoter(): Player | undefined {
    return this.players[this.voterIndex];
  }

  get imposters(): Player[] {
    return this.players.filter((p) => p.role === 'imposter');
  }

  get voteResults(): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const suspectId of Object.values(this.votes)) {
      counts[suspectId] = (counts[suspectId] ?? 0) + 1;
    }
    return counts;
  }

  get mostVotedPlayerId(): number | null {
    const results = this.voteResults;
    let maxVotes = 0;
    let maxId: number | null = null;
    for (const [id, count] of Object.entries(results)) {
      if (count > maxVotes) {
        maxVotes = count;
        maxId = Number(id);
      }
    }
    return maxId;
  }

  get caughtImposters(): boolean {
    const votedId = this.mostVotedPlayerId;
    if (votedId === null) return false;
    const voted = this.players.find((p) => p.id === votedId);
    return voted?.role === 'imposter';
  }

  startSetup() {
    this.state = 'SELECT_PLAYER_COUNT';
  }

  confirmPlayerCount() {
    this.state = 'ENTER_PLAYER_NAMES';
  }

  confirmPlayerNames(names: string[]) {
    this.players = names.map((name, i) => ({
      id: i + 1,
      name: name.trim() || `Player ${i + 1}`,
      role: 'civilian' as const,
    }));
    this.state = 'SET_OPTIONS';
  }

  confirmOptions(hintsEnabled: boolean, imposterCount: number, entries: WordEntry[]) {
    const max = Math.max(1, this.settings.playerCount - 1);
    this.settings.hintsEnabled = hintsEnabled;
    this.settings.imposterCount = Math.min(Math.max(1, imposterCount), max);
    this.wordEntries = entries;
    this._generateAndStart();
  }

  private _generateAndStart() {
    const entry = pickRandom(this.wordEntries);
    const shuffled = shuffleArray([...this.players]);
    const imposterSet = new Set(
      shuffled.slice(0, this.settings.imposterCount).map((p) => p.id)
    );

    this.players = this.players.map((p) => ({
      ...p,
      role: imposterSet.has(p.id) ? ('imposter' as const) : ('civilian' as const),
    }));

    this.round = {
      secretWord: entry.word,
      hint: entry.hint,
      category: entry.category,
    };

    this.revealIndex = 0;
    this.state = 'PASS_AROUND';
  }

  advanceReveal() {
    if (this.revealIndex < this.players.length - 1) {
      this.revealIndex++;
    } else {
      this.state = 'DISCUSSION';
    }
  }

  startVoting() {
    this.votes = {};
    this.voterIndex = 0;
    this.state = 'VOTING';
  }

  castVote(suspectId: number) {
    const voter = this.currentVoter;
    if (!voter) return;
    this.votes = { ...this.votes, [voter.id]: suspectId };
    if (this.voterIndex < this.players.length - 1) {
      this.voterIndex++;
    } else {
      this.state = 'RESULTS';
    }
  }

  playAgain() {
    this.votes = {};
    this.voterIndex = 0;
    this._generateAndStart();
  }

  newGame() {
    this.state = 'SELECT_PLAYER_COUNT';
    this.round = null;
    this.votes = {};
    this.revealIndex = 0;
    this.voterIndex = 0;
  }

  goHome() {
    this.state = 'HOME';
    this.players = [];
    this.round = null;
    this.votes = {};
    this.revealIndex = 0;
    this.voterIndex = 0;
    this.settings = { playerCount: 4, hintsEnabled: true, imposterCount: 1 };
  }
}

export const game = new Game();
