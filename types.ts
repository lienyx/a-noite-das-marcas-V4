import type {
  DeckMode,
  Faction,
  GamePhase,
  KillerPace,
  RoleId,
  SlipType,
  StickerType,
} from './gameData.ts';

export type DeathCause =
  | 'SELO_MAFIA'
  | 'SELO_ASSASSINO'
  | 'FOGO'
  | 'BALA'
  | 'EXECUCAO'
  | 'CULPA_JUSTICEIRO'
  | 'GUARDA_COSTAS'
  | 'TRIBUNAL'
  | 'VINGANCA_BOBO';

export interface PublicPlayer {
  id: string;
  name: string;
  seatIndex: number;
  connected: boolean;
  isHost: boolean;
  alive: boolean;
  deathCause: DeathCause | null;
  // Role only visible publicly if revealed (Prefeito, Marechal, Preso no Tribunal, Justiceiro culposo, or Game Over)
  revealedRole: RoleId | null;
  revealedFaction: Faction | null;
  // Marks on this player's back. NEVER sent to the player themselves during Caçada!
  backMarks: StickerType[];
  // Silenced by Chantagista for current/next Tribunal
  silenced: boolean;
  // Ready check for advancing phase early
  readyForNext: boolean;
  // Individual winners who already fulfilled their goal
  individualWin: boolean;
  // Votes count in Tribunal
  voteWeight: number;
}

export interface ChatMessage {
  id: string;
  channel: 'TRIBUNAL' | 'MAFIA' | 'MEDIUM' | 'GHOSTS' | 'DUNGEON';
  senderId: string;
  senderAlias: string;
  text: string;
  timestamp: number;
}

export interface DuelState {
  id: string;
  pirateId: string;
  targetId: string;
  targetName: string;
  pirateName: string;
  roundNumber: number; // 1..3 (best of 3)
  pirateScore: number;
  targetScore: number;
  piratePick: 'pedra' | 'papel' | 'tesoura' | null;
  targetPick: 'pedra' | 'papel' | 'tesoura' | null;
  lastRoundSummary: string | null;
  winnerId: string | null;
  finished: boolean;
  finishedAt?: number;
}

export interface PublicGameState {
  roomCode: string;
  phase: GamePhase;
  round: number;
  phaseEndsAt: number | null;
  deckMode: DeckMode;
  publicRoleList: RoleId[];
  cacadaMinutes: number;
  tribunalMinutes: number;
  killerPace: KillerPace;
  hideBackMarksUntilBell: boolean;
  players: PublicPlayer[];
  // Tribunal state
  marshalDoubleElimination: boolean;
  votes: Record<string, string | 'SKIP'>; // voterId -> targetId | SKIP
  // Pending Bobo da Corte revenge
  pendingJesterId: string | null;
  pendingJesterVoterIds: string[];
  // Active duel (visible notice that a duel is happening, or private to participants)
  activeDuel: DuelState | null;
  // Dungeon active flag (which player is jailed this round — hidden identity or visible? Only jailed knows + jailor)
  jailedPlayerId: string | null;
  // Chronicle of public events
  chronicle: Array<{ id: string; round: number; text: string; kind: 'info' | 'death' | 'reveal' | 'win' }>;
  // Last Badalada announcement lines
  lastBellAnnouncements: string[];
  // Winners
  winningFactions: Faction[];
  winnerPlayerIds: string[];
  winHeadline: string | null;
}

export interface PrivatePlayerState {
  playerId: string;
  roleId: RoleId | null;
  originalRoleId: RoleId | null;
  stickers: Partial<Record<StickerType, number>>;
  slips: Partial<Record<SlipType, number>>;
  // Secret mission for current Caçada
  secretMission: string | null;
  secretMissionDone: boolean;
  // Status in current round
  blockedThisRound: boolean;
  jailedThisRound: boolean;
  usedRoundAction: boolean;
  usedOncePerGame: boolean;
  // Mafia partners (only for MAFIA)
  mafiaPartners: Array<{ id: string; name: string; roleId: RoleId; alive: boolean }>;
  mafiaSealUsedThisRound: number;
  mafiaSealLimitThisRound: number;
  // Anjo / Carrasco linked player
  linkedTargetId: string | null;
  linkedTargetName: string | null;
  // Pirate duel wins
  pirateWins: number;
  // Ghost whisper used
  usedGhostWhisper: boolean;
  // Private investigation & whisper logs
  secretNotes: Array<{ id: string; round: number; text: string }>;
  // Channels available to this player
  tribunalChat: ChatMessage[];
  mafiaChat: ChatMessage[];
  mediumChat: ChatMessage[];
  ghostChat: ChatMessage[];
  dungeonChat: ChatMessage[];
  mediumRevealedIdentity: boolean;
  // Pending Urna submission status
  urnSubmitted: boolean;
  urnQueuedSlip: SlipType | null;
  urnQueuedTargetId: string | null;
  // Active vest this Badalada
  vestActivated: boolean;
}

export interface RoomSyncPayload {
  publicState: PublicGameState;
  privateState: PrivatePlayerState;
}

export type ClientActionMessage =
  | { type: 'SYNC_REQUEST' }
  | { type: 'LEAVE_ROOM' }
  | { type: 'KICK_PLAYER'; playerId: string }
  | { type: 'JOIN_ROOM'; roomCode: string; name: string; playerToken?: string }
  | { type: 'CREATE_ROOM'; name: string; playerToken?: string }
  | { type: 'REORDER_SEAT'; playerId: string; direction: 'up' | 'down' }
  | { type: 'SHUFFLE_SEATS' }
  | {
      type: 'UPDATE_SETTINGS';
      deckMode?: DeckMode;
      customDeck?: RoleId[];
      cacadaMinutes?: number;
      tribunalMinutes?: number;
      killerPace?: KillerPace;
      hideBackMarksUntilBell?: boolean;
    }
  | { type: 'START_GAME' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'TOGGLE_READY' }
  | { type: 'COMPLETE_MISSION' }
  | { type: 'APPLY_STICKER'; targetId: string; sticker: StickerType }
  | { type: 'INVESTIGATE'; targetId: string }
  | { type: 'BLOCK_PLAYER'; targetId: string }
  | { type: 'JAIL_PLAYER'; targetId: string }
  | { type: 'QUEUE_EXECUTION' }
  | { type: 'QUEUE_BULLET'; targetId: string }
  | { type: 'SILENCE_PLAYER'; targetId: string }
  | { type: 'REVIVE_GHOST'; targetId: string }
  | { type: 'REVEAL_PUBLIC_ROLE' }
  | { type: 'CHALLENGE_DUEL'; targetId: string }
  | { type: 'DUEL_PICK'; duelId: string; pick: 'pedra' | 'papel' | 'tesoura' }
  | { type: 'URN_SUBMIT'; slip: SlipType | 'blank'; targetId?: string }
  | { type: 'ACTIVATE_VEST' }
  | { type: 'CAST_VOTE'; targetId: string | 'SKIP' }
  | { type: 'JESTER_REVENGE'; targetId: string }
  | { type: 'GHOST_WHISPER'; targetId: string; message: string }
  | { type: 'REVEAL_MEDIUM_TO_GHOSTS' }
  | { type: 'SEND_CHAT'; channel: 'TRIBUNAL' | 'MAFIA' | 'MEDIUM' | 'GHOSTS' | 'DUNGEON'; text: string }
  | { type: 'PLAY_AGAIN' };

export type ServerMessage =
  | { type: 'LEFT' }
  | { type: 'SYNC'; payload: RoomSyncPayload }
  | { type: 'ERROR'; message: string }
  | { type: 'BELL_SOUND'; reason: 'badalada' | 'noite_zero' | 'tribunal' | 'duel' | 'victory' }
  | { type: 'TOAST'; message: string };
