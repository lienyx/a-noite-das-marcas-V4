import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Crown,
  Eye,
  Flame,
  Gavel,
  Ghost,
  Heart,
  Lock,
  MessageSquare,
  Moon,
  RotateCcw,
  Send,
  Shield,
  ShieldCheck,
  Skull,
  Sparkles,
  Sun,
  Swords,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ROLES, STICKER_META, type RoleId, type StickerType } from '../shared/gameData';
import type {
  ChatMessage,
  ClientActionMessage,
  PrivatePlayerState,
  PublicGameState,
  PublicPlayer,
} from '../shared/types';
import { isSoundMuted, setSoundMuted } from '../utils/sound';
import { PergaminhoCard } from './PergaminhoCard';
import { RoleIcon, getFactionMeta } from './RoleIcon';

function formatTimer(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PHASE_LABELS: Record<PublicGameState['phase'], string> = {
  LOBBY: 'Sala',
  NOITE_ZERO: 'Noite Zero',
  CACADA: 'Caçada',
  BADALADA: 'Badalada · Urna',
  DANCA_DOS_SELOS: 'Dança dos Selos',
  TRIBUNAL: 'Tribunal',
  FIM_DE_JOGO: 'Fim de Jogo',
};

const DEATH_CAUSE_LABELS: Record<string, string> = {
  SELO_MAFIA: 'Selo na Badalada',
  SELO_ASSASSINO: 'Selo na Badalada',
  FOGO: 'Queimado na Badalada',
  BALA: 'Bala na Urna',
  EXECUCAO: 'Execução na Masmorra',
  CULPA_JUSTICEIRO: 'Culpa do Justiceiro',
  GUARDA_COSTAS: 'Sacrifício (Escudo)',
  TRIBUNAL: 'Preso no Tribunal',
  VINGANCA_BOBO: 'Vingança do Bobo',
};

export function GameWorkspace({
  publicState,
  privateState,
  secondsLeft,
  onAction,
  onOpenRules,
  onLeave,
}: {
  publicState: PublicGameState;
  privateState: PrivatePlayerState;
  secondsLeft: number | null;
  onAction: (action: ClientActionMessage) => void;
  onOpenRules: () => void;
  onLeave: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'acao' | 'praca' | 'papel' | 'canal'>('acao');
  const [muted, setMuted] = useState(isSoundMuted);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [whisperTarget, setWhisperTarget] = useState<string>('');
  const [whisperText, setWhisperText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<
    'TRIBUNAL' | 'MAFIA' | 'MEDIUM' | 'GHOSTS' | 'DUNGEON'
  >('TRIBUNAL');
  const [showPublicDeck, setShowPublicDeck] = useState(false);

  const me = publicState.players.find((p) => p.id === privateState.playerId);
  const isHost = Boolean(me?.isHost);
  const isAlive = Boolean(me?.alive);
  const role = privateState.roleId ? ROLES[privateState.roleId] : null;
  const isMafia = role?.faction === 'MAFIA';
  const isDungeonParticipant =
    publicState.jailedPlayerId !== null &&
    (privateState.jailedThisRound || privateState.roleId === 'carcereiro');

  // Clear selected target when phase changes
  useEffect(() => {
    setSelectedTarget('');
  }, [publicState.phase, publicState.round]);

  // Determine available chat channels
  const availableChannels = useMemo(() => {
    const list: Array<{ id: typeof activeChannel; label: string }> = [
      { id: 'TRIBUNAL', label: 'Tribunal' },
    ];
    if (isMafia && isAlive) list.push({ id: 'MAFIA', label: 'Máfia' });
    if (privateState.roleId === 'medium' || !isAlive) {
      list.push({ id: 'MEDIUM', label: 'Médium' });
    }
    if (!isAlive) {
      list.push({ id: 'GHOSTS', label: 'Fantasmas' });
    }
    if (isDungeonParticipant) {
      list.push({ id: 'DUNGEON', label: 'Masmorra' });
    }
    return list;
  }, [isMafia, privateState.roleId, isAlive, isDungeonParticipant]);

  useEffect(() => {
    if (!availableChannels.some((c) => c.id === activeChannel)) {
      setActiveChannel(availableChannels[0]?.id || 'TRIBUNAL');
    }
  }, [availableChannels, activeChannel]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  const livingOthers = publicState.players.filter(
    (p) => p.alive && p.id !== privateState.playerId
  );
  const eligibleCoronerGhosts = publicState.players.filter(
    (p) => !p.alive && p.revealedRole === null
  );
  const allGhosts = publicState.players.filter((p) => !p.alive);

  const duel = publicState.activeDuel;
  const inDuel =
    duel && (duel.pirateId === privateState.playerId || duel.targetId === privateState.playerId);
  const myDuelPick = duel
    ? duel.pirateId === privateState.playerId
      ? duel.piratePick
      : duel.targetPick
    : null;

  const isPendingJester = publicState.pendingJesterId === privateState.playerId;

  const channelMessages: ChatMessage[] = useMemo(() => {
    switch (activeChannel) {
      case 'MAFIA':
        return privateState.mafiaChat;
      case 'MEDIUM':
        return privateState.mediumChat;
      case 'GHOSTS':
        return privateState.ghostChat;
      case 'DUNGEON':
        return privateState.dungeonChat;
      case 'TRIBUNAL':
      default:
        return privateState.tribunalChat;
    }
  }, [activeChannel, privateState]);

  const canSendInActiveChannel = useMemo(() => {
    if (activeChannel === 'TRIBUNAL') return publicState.phase === 'TRIBUNAL' && !publicState.pendingJesterId && isAlive && !me?.silenced;
    if (activeChannel === 'MAFIA') return isMafia && isAlive;
    if (activeChannel === 'MEDIUM') return privateState.roleId === 'medium' || !isAlive;
    if (activeChannel === 'GHOSTS') return !isAlive;
    if (activeChannel === 'DUNGEON') return isDungeonParticipant;
    return false;
  }, [activeChannel, isAlive, me?.silenced, isMafia, privateState.roleId, isDungeonParticipant, publicState.phase, publicState.pendingJesterId]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = chatInput.trim();
    if (!clean || !canSendInActiveChannel) return;
    onAction({ type: 'SEND_CHAT', channel: activeChannel, text: clean });
    setChatInput('');
  };

  // Tally votes for display during Tribunal
  const voteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [voterId, targetId] of Object.entries(publicState.votes)) {
      const voter = publicState.players.find((p) => p.id === voterId);
      const w = voter ? voter.voteWeight : 1;
      counts.set(targetId, (counts.get(targetId) || 0) + w);
    }
    return counts;
  }, [publicState.votes, publicState.players]);

  const publicDeckGrouped = useMemo(() => {
    const m = new Map<RoleId, number>();
    for (const r of publicState.publicRoleList) {
      m.set(r, (m.get(r) || 0) + 1);
    }
    return Array.from(m.entries());
  }, [publicState.publicRoleList]);

  const getPlayerEffectBadges = (p: PublicPlayer) => {
    const isSelf = p.id === privateState.playerId;
    const hasProtection =
      (isSelf && privateState.vestActivated) ||
      (!isSelf &&
        (p.backMarks.includes('white_amulet') ||
          p.backMarks.includes('gold_shield')));
    const isJailedOrBlocked =
      (isSelf && privateState.blockedThisRound) ||
      (!isSelf && publicState.jailedPlayerId === p.id);
    const hasAbilityMark =
      !isSelf &&
      p.backMarks.some(
        (m) =>
          m === 'red_seal' ||
          m === 'black_seal' ||
          m === 'blue_drop' ||
          m === 'orange_deco'
      );
    const isRevealedLeader =
      p.revealedRole === 'prefeito' || p.revealedRole === 'marechal';

    return {
      isSelf,
      hasProtection,
      isJailedOrBlocked,
      hasAbilityMark,
      isRevealedLeader,
    };
  };

  const renderPhaseActionPanel = () => {
    if (publicState.phase === 'FIM_DE_JOGO') {
      const didIWin = publicState.winnerPlayerIds.includes(privateState.playerId);
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#8FD0EE]/40 bg-[#111A2A] p-6 text-center space-y-3">
            <p className="text-xs font-semibold text-[#8FD0EE]">
              {didIWin ? 'Você venceu esta partida!' : 'Partida encerrada'}
            </p>
            <h2 className="font-display text-2xl font-bold text-[#F2F0FA]">
              {publicState.winHeadline}
            </h2>
            <p className="text-xs text-[#9AA3BC]">
              Vencedores:{' '}
              {publicState.players
                .filter((p) => publicState.winnerPlayerIds.includes(p.id))
                .map((p) => p.name)
                .join(', ') || 'Nenhum'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-3">
            <h3 className="font-display text-base font-bold text-[#F2F0FA]">
              Revelação Completa da Mesa
            </h3>
            <ul className="divide-y divide-white/10">
              {publicState.players.map((p) => {
                const r = p.revealedRole ? ROLES[p.revealedRole] : null;
                const won = publicState.winnerPlayerIds.includes(p.id);
                const f = r ? getFactionMeta(r.faction) : null;
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={f ? f.textColor : 'text-[#9AA3BC]'}>
                        <RoleIcon roleId={p.revealedRole} className="w-10 h-12" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#E9E7F3] truncate">
                          {p.name}
                          {won && <span className="ml-2 text-xs text-[#BFE6F7]">Venceu</span>}
                        </p>
                        <p className="text-xs text-[#9AA3BC]">
                          {r ? `${r.name} · ${f?.label}` : 'Desconhecido'} ·{' '}
                          {p.alive ? 'Sobreviveu' : 'Fantasma'}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {isHost ? (
            <button
              type="button"
              onClick={() => onAction({ type: 'PLAY_AGAIN' })}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#8FD0EE] px-5 py-3 text-sm font-bold text-[#0A0F18] hover:bg-[#A9DCF3]"
            >
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente (Voltar à Sala)
            </button>
          ) : (
            <button
              type="button"
              onClick={onLeave}
              className="w-full min-h-[48px] rounded-xl border border-white/15 bg-[#111A2A] px-5 py-3 text-sm font-semibold text-[#E9E7F3]"
            >
              Sair da Sala
            </button>
          )}
        </div>
      );
    }

    if (publicState.phase === 'BADALADA') {
      const canLightMatch =
        isAlive &&
        !privateState.blockedThisRound &&
        role?.id === 'incendiario' &&
        (privateState.slips.match || 0) > 0;
      const canShootBullet =
        isAlive &&
        !privateState.blockedThisRound &&
        role?.id === 'justiceiro' &&
        (privateState.slips.bullet || 0) > 0;
      const canUseVest =
        isAlive &&
        !privateState.blockedThisRound &&
        role?.id === 'sobrevivente' &&
        (privateState.slips.vest || 0) > 0;
      const submittedCount = publicState.players.filter(
        (p) => p.alive && p.readyForNext
      ).length;
      void submittedCount;

      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E23B4E]/40 bg-[#111A2A] p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[#FF8A98]">
              <Bell className="w-5 h-5" />
              <h2 className="font-display text-xl font-bold text-[#F2F0FA]">
                Badalada — A Urna Digital
              </h2>
            </div>
            <p className="text-sm text-[#CFCBE0] leading-relaxed">
              Todos passam pela Urna em sigilo. Quem não tem ficha especial deposita um papel em branco para manter o anonimato.
            </p>
          </div>

          {!isAlive ? (
            <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 text-sm text-[#9AA3BC]">
              Você é um fantasma. Aguarde os vivos passarem pela Urna para a Dança dos Selos.
            </div>
          ) : privateState.urnSubmitted ? (
            <div className="rounded-2xl border border-[#4FD1A1]/35 bg-[#4FD1A1]/10 p-5 text-center space-y-2">
              <CheckCircle2 className="w-7 h-7 text-[#9AF0CF] mx-auto" />
              <p className="text-sm font-semibold text-[#F2F0FA]">
                Seu papel foi depositado na Urna!
              </p>
              <p className="text-xs text-[#9AA3BC]">
                Aguardando os demais convidados...
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-4">
              {privateState.blockedThisRound && (
                <p className="rounded-xl border border-[#E23B4E]/40 bg-[#E23B4E]/15 p-3 text-xs font-medium text-[#FF8A98]">
                  Você foi bloqueado nesta rodada! Só pode depositar papel em branco.
                </p>
              )}

              {privateState.urnQueuedSlip && !privateState.blockedThisRound && (
                <div className="rounded-xl border border-[#8FD0EE]/40 bg-[#8FD0EE]/10 p-3 text-xs text-[#BFE6F7]">
                  Ficha preparada na Caçada:{' '}
                  <strong className="uppercase">{privateState.urnQueuedSlip}</strong>. Clique abaixo para confirmar na Urna.
                </div>
              )}

              {canLightMatch && (
                <button
                  type="button"
                  onClick={() => onAction({ type: 'URN_SUBMIT', slip: 'match' })}
                  className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#E23B4E] px-4 py-3 text-sm font-bold text-white hover:bg-[#FF5A6E]"
                >
                  <Flame className="w-4 h-4" />
                  Acender FÓSFORO na Urna ({privateState.slips.match} restante)
                </button>
              )}

              {canShootBullet && !privateState.urnQueuedSlip && (
                <div className="space-y-2 border-b border-white/10 pb-4">
                  <label className="block text-xs font-medium text-[#CFCBE0]">
                    Usar BALA única em alguém agora:
                  </label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
                  >
                    <option value="">Escolha um alvo...</option>
                    {livingOthers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedTarget}
                    onClick={() =>
                      onAction({ type: 'URN_SUBMIT', slip: 'bullet', targetId: selectedTarget })
                    }
                    className="w-full min-h-[44px] rounded-xl bg-[#E23B4E] px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                  >
                    Disparar BALA na Urna
                  </button>
                </div>
              )}

              {canUseVest && (
                <button
                  type="button"
                  onClick={() => onAction({ type: 'ACTIVATE_VEST' })}
                  className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    privateState.vestActivated
                      ? 'border-[#4FD1A1]/60 bg-[#4FD1A1]/20 text-[#9AF0CF]'
                      : 'border-[#8FD0EE]/50 bg-[#8FD0EE]/15 text-[#BFE6F7]'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {privateState.vestActivated
                    ? 'COLETE Ativado para esta Badalada'
                    : `Gritar COLETE! (${privateState.slips.vest} restante)`}
                </button>
              )}

              <button
                type="button"
                onClick={() => onAction({ type: 'URN_SUBMIT', slip: 'blank' })}
                className="w-full min-h-[48px] rounded-xl bg-[#8FD0EE] px-4 py-3 text-sm font-bold text-[#0A0F18] hover:bg-[#A9DCF3]"
              >
                {privateState.urnQueuedSlip && !privateState.blockedThisRound
                  ? 'Confirmar Ficha na Urna'
                  : 'Depositar Papel em Branco na Urna'}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (publicState.phase === 'DANCA_DOS_SELOS') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#8FD0EE]/35 bg-[#111A2A] p-5 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#F2F0FA]">
              Dança dos Selos — Resultado da Badalada
            </h2>
            <ul className="space-y-2.5">
              {publicState.lastBellAnnouncements.map((line, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-white/10 bg-[#0A0F18]/70 px-4 py-3 text-sm text-[#E9E7F3]"
                >
                  {line}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onAction({ type: 'TOGGLE_READY' })}
              className={`w-full min-h-[48px] rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                me?.readyForNext
                  ? 'border-[#4FD1A1]/50 bg-[#4FD1A1]/20 text-[#9AF0CF]'
                  : 'bg-[#8FD0EE] border-transparent text-[#0A0F18] font-bold'
              }`}
            >
              {me?.readyForNext ? 'Aguardando os outros...' : 'Seguir para o Tribunal'}
            </button>
          </div>
        </div>
      );
    }

    if (publicState.phase === 'TRIBUNAL') {
      const myVote = publicState.votes[privateState.playerId];
      const votedCount = Object.keys(publicState.votes).length;
      const livingCount = publicState.players.filter((p) => p.alive).length;

      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#8FD0EE]" />
                <h2 className="font-display text-xl font-bold text-[#F2F0FA]">
                  Tribunal — "3, 2, 1... APONTA!"
                </h2>
              </div>
              <span className="font-mono text-xs text-[#9AA3BC] tabular-nums">
                {votedCount}/{livingCount} votos
              </span>
            </div>

            {publicState.marshalDoubleElimination && (
              <div className="rounded-xl border border-[#8FD0EE]/50 bg-[#8FD0EE]/15 p-3 text-xs font-semibold text-[#BFE6F7]">
                Marechal revelado! Os DOIS jogadores mais apontados serão presos neste Tribunal.
              </div>
            )}

            {me?.silenced && (
              <div className="rounded-xl border border-[#E23B4E]/40 bg-[#E23B4E]/15 p-3 text-xs font-semibold text-[#FF8A98]">
                Você recebeu CALE-SE! Não pode falar neste Tribunal — apenas ouça e vote.
              </div>
            )}

            {!isAlive ? (
              <p className="text-xs text-[#9AA3BC]">
                Fantasmas observam o Tribunal em silêncio.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {publicState.players
                  .filter((p) => p.alive)
                  .map((p) => {
                    const votesForP = voteCounts.get(p.id) || 0;
                    const selected = myVote === p.id;
                    const fx = getPlayerEffectBadges(p);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onAction({ type: 'CAST_VOTE', targetId: p.id })}
                        className={`w-full min-h-[48px] flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                          selected
                            ? 'border-[#8FD0EE] bg-[#8FD0EE]/20 text-[#F2F0FA] font-semibold'
                            : 'border-white/10 bg-[#0A0F18]/60 text-[#CFCBE0] hover:border-white/25'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Heart
                            className="w-4 h-4 text-[#9AF0CF] shrink-0"
                            aria-label="Vivo"
                          />
                          <span className="truncate">{p.name}</span>
                          {fx.hasProtection && (
                            <span title="Sob proteção" aria-label="Sob proteção" className="text-[#BFE6F7] shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          )}
                          {fx.hasAbilityMark && (
                            <span title="Marcado por habilidade" aria-label="Marcado por habilidade" className="text-[#C4A3FF] shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </span>
                          )}
                          {fx.isJailedOrBlocked && (
                            <span title="Bloqueado / Masmorra" aria-label="Bloqueado ou na Masmorra" className="text-[#BFE6F7] shrink-0">
                              <Lock className="w-4 h-4" />
                            </span>
                          )}
                          {p.silenced && (
                            <span title="Silenciado (Cale-se)" aria-label="Silenciado" className="inline-flex items-center gap-1 text-[11px] text-[#FF8A98] shrink-0">
                              <VolumeX className="w-3.5 h-3.5" />
                              Cale-se
                            </span>
                          )}
                          {fx.isRevealedLeader && p.revealedRole && (
                            <span title={ROLES[p.revealedRole].name} className="inline-flex items-center gap-1 text-[11px] text-[#BFE6F7] shrink-0">
                              <Crown className="w-3.5 h-3.5" />
                              {p.revealedRole === 'prefeito' ? 'Prefeito (3x)' : 'Marechal'}
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs text-[#BFE6F7] tabular-nums shrink-0">
                          {votesForP > 0 ? `${votesForP} voto(s)` : selected ? 'Apontado' : 'Apontar'}
                        </span>
                      </button>
                    );
                  })}

                <button
                  type="button"
                  onClick={() => onAction({ type: 'CAST_VOTE', targetId: 'SKIP' })}
                  className={`w-full min-h-[44px] flex items-center justify-between rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
                    myVote === 'SKIP'
                      ? 'border-white/40 bg-white/15 text-white'
                      : 'border-white/10 bg-[#0A0F18]/40 text-[#9AA3BC] hover:text-white'
                  }`}
                >
                  <span>Abster / Não prender ninguém</span>
                  <span className="font-mono tabular-nums">{voteCounts.get('SKIP') || 0}</span>
                </button>
              </div>
            )}

            {/* Quick Mayor / Marshal reveal during Tribunal */}
            {isAlive &&
              !privateState.blockedThisRound &&
              (role?.id === 'prefeito' || role?.id === 'marechal') &&
              !me?.revealedRole && (
                <button
                  type="button"
                  onClick={() => onAction({ type: 'REVEAL_PUBLIC_ROLE' })}
                  className="w-full min-h-[44px] rounded-xl border border-[#8FD0EE]/50 bg-[#8FD0EE]/15 px-4 py-2 text-xs font-bold text-[#BFE6F7] hover:bg-[#8FD0EE]/25"
                >
                  REVELAR-SE COMO {role.name.toUpperCase()}
                </button>
              )}
          </div>
        </div>
      );
    }

    // Default active phase: CACADA
    if (!isAlive) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#CFCBE0]">
              <Ghost className="w-5 h-5 text-[#9AA3BC]" />
              <h2 className="font-display text-lg font-bold text-[#F2F0FA]">
                Você é um Fantasma
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-[#9AA3BC]">
              Fantasmas não falam sobre o caso na festa, mas podem conversar livremente com o Médium e outros fantasmas na aba Canal, e enviar 1 único Sussurro do Além.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-3">
            <h3 className="font-display text-base font-bold text-[#F2F0FA]">
              Sussurro do Além ({privateState.usedGhostWhisper ? 'Já usado' : '1 disponível'})
            </h3>
            {privateState.usedGhostWhisper ? (
              <p className="text-xs text-[#7E88A3]">
                Você já enviou sua única mensagem para os vivos nesta partida.
              </p>
            ) : (
              <div className="space-y-3">
                <select
                  value={whisperTarget}
                  onChange={(e) => setWhisperTarget(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
                >
                  <option value="">Escolha um jogador vivo...</option>
                  {livingOthers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  maxLength={140}
                  value={whisperText}
                  onChange={(e) => setWhisperText(e.target.value)}
                  placeholder="Escreva uma única frase secreta..."
                  className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white placeholder-[#6A7390]"
                />
                <button
                  type="button"
                  disabled={!whisperTarget || !whisperText.trim()}
                  onClick={() => {
                    onAction({
                      type: 'GHOST_WHISPER',
                      targetId: whisperTarget,
                      message: whisperText.trim(),
                    });
                    setWhisperText('');
                    setWhisperTarget('');
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-[#8FD0EE] px-4 py-2 text-xs font-bold text-[#0A0F18] disabled:opacity-40"
                >
                  Enviar Sussurro do Além
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Living player in CACADA
    const renderPowerControls = () => {
      if (!role) return null;
      if (privateState.blockedThisRound) {
        return (
          <div className="rounded-xl border border-[#E23B4E]/40 bg-[#E23B4E]/15 p-4 text-xs font-medium text-[#FF8A98]">
            {privateState.jailedThisRound
              ? 'Você foi preso na Masmorra nesta rodada! Seus poderes estão bloqueados até a Badalada. Acesse a aba Canal para falar com o Carcereiro.'
              : 'Você foi bloqueado nesta rodada! Até a próxima Badalada, seus poderes e fichas não funcionam.'}
          </div>
        );
      }

      switch (role.id) {
        case 'chefao':
        case 'mafioso': {
          const canSeal =
            privateState.mafiaSealUsedThisRound < privateState.mafiaSealLimitThisRound &&
            (privateState.stickers.red_seal || 0) > 0;
          return (
            <div className="space-y-3">
              <p className="text-xs text-[#CFCBE0]">
                Selos da Máfia usados nesta rodada:{' '}
                <strong className="font-mono text-[#FF8A98] tabular-nums">
                  {privateState.mafiaSealUsedThisRound}/{privateState.mafiaSealLimitThisRound}
                </strong>
              </p>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={!canSeal}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha o alvo do Selo Vermelho...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!canSeal || !selectedTarget}
                onClick={() =>
                  onAction({ type: 'APPLY_STICKER', targetId: selectedTarget, sticker: 'red_seal' })
                }
                className="w-full min-h-[46px] rounded-xl bg-[#E23B4E] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Colar Selo Vermelho nas Costas
              </button>
            </div>
          );
        }

        case 'assassino_em_serie': {
          const paceBlocked =
            publicState.killerPace === 'slow' && publicState.round % 2 === 0;
          const canKill = !privateState.usedRoundAction && !paceBlocked && (privateState.stickers.black_seal || 0) > 0;
          return (
            <div className="space-y-3">
              {paceBlocked && (
                <p className="text-xs text-[#BFE6F7]">
                  Modo lento ativo: Selo Negro liberado apenas nas rodadas ímpares.
                </p>
              )}
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={!canKill}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha o alvo do Selo Negro...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!canKill || !selectedTarget}
                onClick={() =>
                  onAction({ type: 'APPLY_STICKER', targetId: selectedTarget, sticker: 'black_seal' })
                }
                className="w-full min-h-[46px] rounded-xl bg-[#232C42] border border-white/20 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {privateState.usedRoundAction ? 'Selo Negro já colado nesta rodada' : 'Colar Selo Negro nas Costas'}
              </button>
            </div>
          );
        }

        case 'incendiario':
          return (
            <div className="space-y-3">
              <p className="text-xs text-[#CFCBE0]">
                Cole Gotas Azuis em quem quiser durante a Caçada ({privateState.stickers.blue_drop || 0} restantes). Você decidirá se acende um Fósforo na Badalada.
              </p>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
              >
                <option value="">Escolha quem molhar com Gota Azul...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedTarget || (privateState.stickers.blue_drop || 0) <= 0}
                onClick={() => {
                  onAction({ type: 'APPLY_STICKER', targetId: selectedTarget, sticker: 'blue_drop' });
                  setSelectedTarget('');
                }}
                className="w-full min-h-[46px] rounded-xl bg-[#7C4DDB] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Colar Gota Azul nas Costas
              </button>
            </div>
          );

        case 'doutor':
        case 'guarda_costas': {
          const sticker: StickerType = role.id === 'doutor' ? 'white_amulet' : 'gold_shield';
          const count = privateState.stickers[sticker] || 0;
          const canUse = !privateState.usedRoundAction && count > 0;
          return (
            <div className="space-y-3">
              <p className="text-xs text-[#CFCBE0]">
                Restantes: <strong className="font-mono text-[#F2F0FA] tabular-nums">{count}</strong>
              </p>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={!canUse}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha quem proteger...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!canUse || !selectedTarget}
                onClick={() =>
                  onAction({ type: 'APPLY_STICKER', targetId: selectedTarget, sticker })
                }
                className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
              >
                {privateState.usedRoundAction
                  ? 'Proteção já aplicada nesta rodada'
                  : role.id === 'doutor'
                    ? 'Colar Amuleto Branco'
                    : 'Colar Escudo Dourado'}
              </button>
            </div>
          );
        }

        case 'anjo_da_guarda': {
          const count = privateState.stickers.white_amulet || 0;
          const canUse = !privateState.usedRoundAction && count > 0 && privateState.linkedTargetId;
          return (
            <div className="space-y-3">
              <p className="text-xs text-[#CFCBE0]">
                Seu protegido: <strong className="text-[#BFE6F7]">{privateState.linkedTargetName}</strong> ({count} amuleto(s) restante(s)).
              </p>
              <button
                type="button"
                disabled={!canUse}
                onClick={() =>
                  privateState.linkedTargetId &&
                  onAction({
                    type: 'APPLY_STICKER',
                    targetId: privateState.linkedTargetId,
                    sticker: 'white_amulet',
                  })
                }
                className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
              >
                {privateState.usedRoundAction
                  ? 'Amuleto já aplicado nesta rodada'
                  : `Colar Amuleto em ${privateState.linkedTargetName}`}
              </button>
            </div>
          );
        }

        case 'xerife':
        case 'investigador':
        case 'conselheiro':
          return (
            <div className="space-y-3">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={privateState.usedRoundAction}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha alguém para investigar...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={privateState.usedRoundAction || !selectedTarget}
                onClick={() => onAction({ type: 'INVESTIGATE', targetId: selectedTarget })}
                className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
              >
                {privateState.usedRoundAction ? 'Investigação concluída nesta rodada' : 'Investigar em Segredo'}
              </button>
            </div>
          );

        case 'legista':
          return (
            <div className="space-y-3">
              {eligibleCoronerGhosts.length === 0 ? (
                <p className="text-xs text-[#9AA3BC]">
                  Nenhum fantasma elegível no momento (presos no Tribunal já revelam o papel a todos).
                </p>
              ) : (
                <>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    disabled={privateState.usedRoundAction}
                    className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
                  >
                    <option value="">Escolha um fantasma para examinar...</option>
                    {eligibleCoronerGhosts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={privateState.usedRoundAction || !selectedTarget}
                    onClick={() => onAction({ type: 'INVESTIGATE', targetId: selectedTarget })}
                    className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
                  >
                    {privateState.usedRoundAction ? 'Exame concluído nesta rodada' : 'Examinar Fantasma'}
                  </button>
                </>
              )}
            </div>
          );

        case 'dancarina':
        case 'consorte':
          return (
            <div className="space-y-3">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={privateState.usedRoundAction}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha quem bloquear nesta rodada...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={privateState.usedRoundAction || !selectedTarget}
                onClick={() => onAction({ type: 'BLOCK_PLAYER', targetId: selectedTarget })}
                className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
              >
                {privateState.usedRoundAction ? 'Bloqueio já aplicado nesta rodada' : 'Bloquear Poderes até Badalada'}
              </button>
            </div>
          );

        case 'carcereiro':
          return (
            <div className="space-y-3">
              {!publicState.jailedPlayerId ? (
                <>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    disabled={privateState.usedRoundAction}
                    className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
                  >
                    <option value="">Escolha quem prender na Masmorra...</option>
                    {livingOthers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={privateState.usedRoundAction || !selectedTarget}
                    onClick={() => onAction({ type: 'JAIL_PLAYER', targetId: selectedTarget })}
                    className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
                  >
                    Levar à Masmorra (Bloqueia e Interroga)
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#8FD0EE]/35 bg-[#8FD0EE]/10 p-3 text-xs text-[#BFE6F7]">
                    Prisioneiro na Masmorra! Use a aba <strong>Canal &rarr; Masmorra</strong> para interrogar anonimamente.
                  </div>
                  {(privateState.slips.execution || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => onAction({ type: 'QUEUE_EXECUTION' })}
                      className={`w-full min-h-[46px] rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                        privateState.urnQueuedSlip === 'execution'
                          ? 'bg-[#E23B4E] text-white'
                          : 'border border-[#E23B4E]/50 bg-[#E23B4E]/15 text-[#FF8A98]'
                      }`}
                    >
                      {privateState.urnQueuedSlip === 'execution'
                        ? 'EXECUÇÃO Preparada na Urna (clique para cancelar)'
                        : 'Usar Ficha EXECUÇÃO (1 no jogo todo)'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );

        case 'justiceiro':
          return (privateState.slips.bullet || 0) > 0 ? (
            <div className="space-y-3">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
              >
                <option value="">Escolha o alvo da sua única BALA...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedTarget}
                onClick={() => onAction({ type: 'QUEUE_BULLET', targetId: selectedTarget })}
                className="w-full min-h-[46px] rounded-xl bg-[#E23B4E] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {privateState.urnQueuedSlip === 'bullet'
                  ? 'BALA Preparada (clique para trocar alvo)'
                  : 'Preparar BALA para a Urna'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#9AA3BC]">Você já usou sua única BALA.</p>
          );

        case 'chantagista':
          return (privateState.slips.silence || 0) > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#CFCBE0]">
                Fichas CALE-SE restantes: <strong className="font-mono tabular-nums">{privateState.slips.silence}</strong>
              </p>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={privateState.usedRoundAction}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha quem silenciar no Tribunal...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={privateState.usedRoundAction || !selectedTarget}
                onClick={() => onAction({ type: 'SILENCE_PLAYER', targetId: selectedTarget })}
                className="w-full min-h-[46px] rounded-xl bg-[#E23B4E] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                {privateState.usedRoundAction ? 'CALE-SE já preparado nesta rodada' : 'Enviar CALE-SE para a Urna'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#9AA3BC]">Sem fichas CALE-SE restantes.</p>
          );

        case 'retribucionista':
          return privateState.usedOncePerGame ? (
            <p className="text-xs text-[#9AA3BC]">Você já usou sua única chance de Retribuição.</p>
          ) : allGhosts.length === 0 ? (
            <p className="text-xs text-[#9AA3BC]">Ainda não há fantasmas para tentar reviver.</p>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white"
              >
                <option value="">Escolha um fantasma da Cidade...</option>
                {allGhosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedTarget}
                onClick={() => onAction({ type: 'REVIVE_GHOST', targetId: selectedTarget })}
                className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
              >
                Tentar Reviver na Badalada
              </button>
            </div>
          );

        case 'prefeito':
        case 'marechal':
          return me?.revealedRole ? (
            <p className="text-xs text-[#9AF0CF]">
              Você já se revelou publicamente como {role.name}.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onAction({ type: 'REVEAL_PUBLIC_ROLE' })}
              className="w-full min-h-[46px] rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18]"
            >
              REVELAR-SE COMO {role.name.toUpperCase()}
            </button>
          );

        case 'pirata':
          return (
            <div className="space-y-3">
              <p className="text-xs text-[#BFE6F7]">
                Vitórias em duelos: <strong className="font-mono tabular-nums">{privateState.pirateWins}/2</strong>
              </p>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={privateState.usedRoundAction}
                className="w-full min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white disabled:opacity-45"
              >
                <option value="">Escolha quem desafiar no Pedra, Papel e Tesoura...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={privateState.usedRoundAction || !selectedTarget}
                onClick={() => onAction({ type: 'CHALLENGE_DUEL', targetId: selectedTarget })}
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#8FD0EE] px-4 py-2.5 text-sm font-bold text-[#0A0F18] disabled:opacity-40"
              >
                <Swords className="w-4 h-4" />
                {privateState.usedRoundAction ? 'Duelo já realizado nesta rodada' : 'Desafiar para Duelo'}
              </button>
            </div>
          );

        case 'sobrevivente':
          return (privateState.slips.vest || 0) > 0 ? (
            <button
              type="button"
              onClick={() => onAction({ type: 'ACTIVATE_VEST' })}
              className={`w-full min-h-[46px] rounded-xl border px-4 py-2.5 text-sm font-bold ${
                privateState.vestActivated
                  ? 'border-[#4FD1A1]/50 bg-[#4FD1A1]/20 text-[#9AF0CF]'
                  : 'border-[#8FD0EE]/40 bg-[#8FD0EE]/15 text-[#BFE6F7]'
              }`}
            >
              {privateState.vestActivated
                ? 'COLETE preparado para esta Badalada'
                : `Preparar COLETE (${privateState.slips.vest} restante)`}
            </button>
          ) : (
            <p className="text-xs text-[#9AA3BC]">Sem coletes restantes.</p>
          );

        case 'medium':
          return (
            <button
              type="button"
              onClick={() => {
                setActiveChannel('MEDIUM');
                setActiveTab('canal');
              }}
              className="w-full min-h-[46px] rounded-xl border border-[#8FD0EE]/40 bg-[#8FD0EE]/15 px-4 py-2.5 text-sm font-semibold text-[#BFE6F7]"
            >
              Abrir Canal com os Fantasmas
            </button>
          );

        default:
          return (
            <p className="text-xs text-[#9AA3BC]">
              Observe as costas dos outros convidados na aba Praça, faça alianças e prepare sua leitura para o Tribunal.
            </p>
          );
      }
    };

    return (
      <div className="space-y-4">
        {/* Secret Mission */}
        {privateState.secretMission && (
          <div className="rounded-2xl border border-[#8FD0EE]/30 bg-[#111A2A] p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#BFE6F7]">
                Missão Secreta (Despiste na Festa)
              </p>
              <button
                type="button"
                onClick={() => onAction({ type: 'COMPLETE_MISSION' })}
                className={`min-h-[36px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  privateState.secretMissionDone
                    ? 'bg-[#4FD1A1]/20 text-[#9AF0CF]'
                    : 'border border-white/15 text-[#CFCBE0]'
                }`}
              >
                {privateState.secretMissionDone ? 'Cumprida' : 'Marcar feita'}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-[#F2F0FA]">
              {privateState.secretMission}
            </p>
          </div>
        )}

        {/* Role Power */}
        <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-[#F2F0FA]">
              Ação Secreta — {role?.name}
            </h2>
            <span className="text-xs text-[#9AA3BC]">Rodada {publicState.round}</span>
          </div>

          {renderPowerControls()}
        </div>

        {/* Optional Orange Decoy Sticker */}
        {(privateState.stickers.orange_deco || 0) > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-4 space-y-2.5">
            <p className="text-xs font-semibold text-[#FF9DCF]">
              Adesivo Laranja de Enfeite ({privateState.stickers.orange_deco} restantes)
            </p>
            <div className="flex items-center gap-2">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="flex-1 min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-xs text-white"
              >
                <option value="">Escolher alguém para despistar...</option>
                {livingOthers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedTarget}
                onClick={() =>
                  onAction({ type: 'APPLY_STICKER', targetId: selectedTarget, sticker: 'orange_deco' })
                }
                className="min-h-[44px] rounded-xl border border-[#D6409F]/40 bg-[#D6409F]/15 px-3 py-2 text-xs font-semibold text-[#FF9DCF] disabled:opacity-40 whitespace-nowrap"
              >
                Colar Laranja
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => onAction({ type: 'TOGGLE_READY' })}
          className={`w-full min-h-[48px] rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            me?.readyForNext
              ? 'border-[#4FD1A1]/50 bg-[#4FD1A1]/20 text-[#9AF0CF]'
              : 'border-white/15 bg-[#111A2A] text-[#E9E7F3] hover:border-white/30'
          }`}
        >
          {me?.readyForNext ? 'Pronto para a Badalada (aguardando outros)' : 'Pronto para a Badalada'}
        </button>
      </div>
    );
  };

  const renderPracaPanel = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-[#F2F0FA]">
            Praça — Círculo e Costas
          </h2>
          <span className="text-xs text-[#9AA3BC]">
            {publicState.players.filter((p) => p.alive).length} vivos ·{' '}
            {publicState.players.filter((p) => !p.alive).length} fantasmas
          </span>
        </div>
        <p className="text-xs text-[#9AA3BC]">
          Você pode olhar os adesivos nas costas de qualquer outro convidado, mas nunca vê as suas próprias costas.
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9AA3BC] border-b border-white/10 pb-2.5">
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#9AF0CF]" /> Vivo
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Skull className="w-3.5 h-3.5 text-[#FF8A98]" /> Morto
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#BFE6F7]" /> Proteção
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A3FF]" /> Habilidade
          </span>
        </div>

        <ul className="divide-y divide-white/10">
          {publicState.players.map((p: PublicPlayer) => {
            const fx = getPlayerEffectBadges(p);
            const isSelf = fx.isSelf;
            return (
              <li key={p.id} className="py-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.alive ? (
                      <span
                        title="Vivo"
                        aria-label="Vivo"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#4FD1A1]/12 text-[#9AF0CF] shrink-0"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span
                        title="Morto"
                        aria-label="Morto"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E23B4E]/15 text-[#FF8A98] shrink-0"
                      >
                        <Skull className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className={`text-sm font-semibold truncate ${p.alive ? 'text-[#E9E7F3]' : 'text-[#7E88A3] line-through'}`}>
                      {p.name}
                    </span>
                    {isSelf && <span className="text-xs text-[#8FD0EE] shrink-0">(Você)</span>}
                    {p.individualWin && <span className="text-xs text-[#BFE6F7] shrink-0">· Venceu</span>}

                    {/* Visual status icons for active protection / ability effects */}
                    {p.alive && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        {fx.hasProtection && (
                          <span
                            title="Sob proteção (Amuleto, Escudo ou Colete)"
                            aria-label="Sob proteção"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8FD0EE]/15 text-[#BFE6F7]"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {fx.hasAbilityMark && (
                          <span
                            title="Sob efeito de habilidade nas costas"
                            aria-label="Sob efeito de habilidade"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8B5CF6]/15 text-[#C4A3FF]"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {fx.isJailedOrBlocked && (
                          <span
                            title="Bloqueado ou na Masmorra"
                            aria-label="Bloqueado ou na Masmorra"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8FD0EE]/15 text-[#BFE6F7]"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {p.silenced && (
                          <span
                            title="Silenciado (Cale-se)"
                            aria-label="Silenciado"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E23B4E]/15 text-[#FF8A98]"
                          >
                            <VolumeX className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {fx.isRevealedLeader && (
                          <span
                            title="Líder revelado"
                            aria-label="Líder revelado"
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8FD0EE]/15 text-[#BFE6F7]"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#9AA3BC] shrink-0">
                    {p.alive
                      ? p.revealedRole
                        ? ROLES[p.revealedRole].name
                        : 'Vivo'
                      : p.revealedRole
                        ? `${ROLES[p.revealedRole].name} · ${DEATH_CAUSE_LABELS[p.deathCause || ''] || 'Fantasma'}`
                        : DEATH_CAUSE_LABELS[p.deathCause || ''] || 'Fantasma'}
                  </span>
                </div>

                {/* Back Marks */}
                {p.alive && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] pl-8">
                    {isSelf ? (
                      <span className="text-[#7E88A3] italic">
                        Suas costas estão ocultas para você
                      </span>
                    ) : publicState.hideBackMarksUntilBell && publicState.phase === 'CACADA' ? (
                      <span className="text-[#7E88A3]">Costas ocultas até a Badalada</span>
                    ) : p.backMarks.length === 0 ? (
                      <span className="text-[#7E88A3]">Costas limpas</span>
                    ) : (
                      p.backMarks.map((st, idx) => (
                        <span
                          key={`${st}-${idx}`}
                          className={`rounded-md border px-2 py-0.5 font-medium ${STICKER_META[st].colorClass}`}
                        >
                          {STICKER_META[st].badgeText}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Collapsible Public Role List */}
      <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowPublicDeck((s) => !s)}
          className="w-full min-h-[40px] flex items-center justify-between text-xs font-semibold text-[#F2F0FA]"
        >
          <span>Lista Pública de Papéis desta Partida ({publicState.publicRoleList.length})</span>
          <span className="text-[#8FD0EE]">{showPublicDeck ? 'Ocultar' : 'Mostrar'}</span>
        </button>
        {showPublicDeck && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
            {publicDeckGrouped.map(([rId, count]) => (
              <div key={rId} className="text-xs text-[#CFCBE0]">
                {ROLES[rId].name} {count > 1 ? `×${count}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chronicle */}
      <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-4 space-y-2">
        <h3 className="text-xs font-semibold text-[#CFCBE0]">Crônica Pública</h3>
        {publicState.chronicle.length === 0 ? (
          <p className="text-xs text-[#7E88A3]">Nenhum evento registrado ainda.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {publicState.chronicle.map((c) => (
              <li
                key={c.id}
                className="text-xs leading-relaxed text-[#CFCBE0] border-b border-white/5 pb-1.5 last:border-0"
              >
                <span className="font-mono text-[#8FD0EE] mr-2 tabular-nums">R{c.round}</span>
                {c.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderCanalPanel = () => (
    <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-4 sm:p-5 flex flex-col h-[520px] max-h-[70vh]">
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
        {availableChannels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setActiveChannel(ch.id)}
            className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeChannel === ch.id
                ? 'bg-[#8FD0EE] text-[#0A0F18]'
                : 'border border-white/10 bg-[#0A0F18] text-[#9AA3BC] hover:text-white'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {activeChannel === 'MEDIUM' &&
        privateState.roleId === 'medium' &&
        isAlive &&
        !privateState.mediumRevealedIdentity && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#8FD0EE]/30 bg-[#8FD0EE]/10 px-3 py-2 text-xs">
            <span className="text-[#BFE6F7]">Fantasmas veem você como "O Médium".</span>
            <button
              type="button"
              onClick={() => onAction({ type: 'REVEAL_MEDIUM_TO_GHOSTS' })}
              className="min-h-[34px] rounded-lg bg-[#8FD0EE] px-2.5 py-1 font-bold text-[#0A0F18] whitespace-nowrap"
            >
              Revelar Nome
            </button>
          </div>
        )}

      <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
        {channelMessages.length === 0 ? (
          <p className="text-xs text-[#7E88A3] text-center py-8">
            Nenhuma mensagem neste canal ainda.
          </p>
        ) : (
          channelMessages.map((m) => (
            <div key={m.id} className="rounded-xl bg-[#0A0F18]/60 px-3 py-2 text-xs space-y-0.5">
              <p className="font-semibold text-[#BFE6F7]">{m.senderAlias}</p>
              <p className="text-[#E9E7F3] leading-relaxed">{m.text}</p>
            </div>
          ))
        )}
      </div>

      {canSendInActiveChannel ? (
        <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            maxLength={220}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 min-h-[44px] rounded-xl border border-white/15 bg-[#0A0F18] px-3 py-2 text-sm text-white placeholder-[#6A7390]"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            aria-label="Enviar mensagem"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#8FD0EE] text-[#0A0F18] disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <p className="pt-2 border-t border-white/10 text-xs text-[#7E88A3] text-center">
          {me?.silenced
            ? 'Você está silenciado (CALE-SE) neste Tribunal.'
            : 'Somente leitura neste canal.'}
        </p>
      )}
    </div>
  );

  const isDaylight = publicState.phase === 'TRIBUNAL';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact Sticky Top Bar (<= 56px) */}
      <header className="sticky top-0 z-30 h-13 border-b border-white/10 bg-[#0A0F18]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-[#BFE6F7] shrink-0">
            {publicState.roomCode}
          </span>
          <span className="text-white/25" aria-hidden="true">·</span>
          {isDaylight ? (
            <Sun className="w-3.5 h-3.5 text-[#BFE6F7] shrink-0" aria-hidden="true" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[#C4A3FF] shrink-0" aria-hidden="true" />
          )}
          <span className="text-xs sm:text-sm font-semibold text-[#F2F0FA] truncate">
            {publicState.round > 0 ? `R${publicState.round} · ` : ''}
            {PHASE_LABELS[publicState.phase]}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {secondsLeft !== null && (
            <span className="font-mono text-xs sm:text-sm font-bold text-[#BFE6F7] tabular-nums px-1.5">
              {formatTimer(secondsLeft)}
            </span>
          )}
          {isHost &&
            publicState.phase !== 'FIM_DE_JOGO' &&
            publicState.phase !== 'LOBBY' && (
              <button
                type="button"
                onClick={() => onAction({ type: 'ADVANCE_PHASE' })}
                className="min-h-[36px] rounded-lg border border-[#8FD0EE]/40 bg-[#8FD0EE]/15 px-2.5 py-1 text-[11px] font-semibold text-[#BFE6F7] whitespace-nowrap"
              >
                Avançar
              </button>
            )}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#9AA3BC] hover:text-white"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onOpenRules}
            aria-label="Abrir regras"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#9AA3BC] hover:text-white"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content: Responsive Mobile Tabs / Desktop Multi-Column */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-24 lg:pb-8 sm:px-6">
        {/* Mobile Tab Switch */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${publicState.phase}-${publicState.round}`}
              initial={{ opacity: 0, filter: 'blur(6px)', y: 6 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(6px)', y: -4 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'acao' && renderPhaseActionPanel()}
              {activeTab === 'praca' && renderPracaPanel()}
              {activeTab === 'papel' && <PergaminhoCard privateState={privateState} me={me} />}
              {activeTab === 'canal' && renderCanalPanel()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop 3-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 items-start">
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${publicState.phase}-${publicState.round}`}
                initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(6px)', y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderPhaseActionPanel()}
              </motion.div>
            </AnimatePresence>
            {renderCanalPanel()}
          </div>
          <div className="lg:col-span-4">{renderPracaPanel()}</div>
          <div className="lg:col-span-3">
            <PergaminhoCard privateState={privateState} me={me} />
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (h-16 = 64px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 pb-safe border-t border-white/10 bg-[#0A0F18]/95 backdrop-blur-md grid grid-cols-4 items-center">
        {(
          [
            ['acao', 'Ação', Gavel],
            ['praca', 'Praça', Users],
            ['papel', 'Papel', Eye],
            ['canal', 'Canal', MessageSquare],
          ] as const
        ).map(([id, label, Icon]) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-[#8FD0EE]' : 'text-[#7E88A3]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Pirate RPS Duel Overlay */}
      {inDuel && duel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#8FD0EE]/50 bg-[#111A2A] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#BFE6F7]">
              <Swords className="w-5 h-5" />
              <h3 className="font-display text-lg font-bold text-[#F2F0FA]">
                Duelo do Pirata (Melhor de 3)
              </h3>
            </div>
            <p className="text-xs text-[#CFCBE0]">
              {duel.pirateName} vs {duel.targetName} — Placar:{' '}
              <strong className="font-mono text-[#BFE6F7] tabular-nums">
                {duel.pirateScore} × {duel.targetScore}
              </strong>
            </p>
            {duel.lastRoundSummary && (
              <p className="rounded-xl border border-white/10 bg-[#0A0F18] p-3 text-xs text-[#F2F0FA]">
                {duel.lastRoundSummary}
              </p>
            )}
            {duel.finished ? (
              <div className="rounded-xl border border-[#4FD1A1]/40 bg-[#4FD1A1]/15 p-4 text-center text-sm font-bold text-[#9AF0CF]">
                {duel.winnerId === duel.pirateId
                  ? `${duel.pirateName} venceu o duelo!`
                  : `${duel.targetName} venceu o duelo!`}
              </div>
            ) : myDuelPick ? (
              <p className="text-center text-xs text-[#9AA3BC] py-4">
                Você escolheu <strong>{myDuelPick}</strong>. Aguardando o adversário...
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(['pedra', 'papel', 'tesoura'] as const).map((pick) => (
                  <button
                    key={pick}
                    type="button"
                    onClick={() => onAction({ type: 'DUEL_PICK', duelId: duel.id, pick })}
                    className="min-h-[56px] rounded-xl border border-white/15 bg-[#0A0F18] text-sm font-bold capitalize text-[#F2F0FA] hover:border-[#8FD0EE]"
                  >
                    {pick}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bobo da Corte Revenge Overlay */}
      {isPendingJester && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#8FD0EE]/50 bg-[#111A2A] p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-[#BFE6F7]">
              Você venceu como Bobo da Corte!
            </h3>
            <p className="text-sm text-[#CFCBE0]">
              Escolha 1 dos convidados que apontaram você para virar fantasma junto:
            </p>
            <div className="space-y-2">
              {publicState.pendingJesterVoterIds.map((vid) => {
                const voter = publicState.players.find((p) => p.id === vid);
                if (!voter) return null;
                return (
                  <button
                    key={vid}
                    type="button"
                    onClick={() => onAction({ type: 'JESTER_REVENGE', targetId: vid })}
                    className="w-full min-h-[48px] rounded-xl border border-[#E23B4E]/40 bg-[#E23B4E]/15 px-4 py-2 text-sm font-bold text-[#FF8A98] hover:bg-[#E23B4E]/30"
                  >
                    Levar {voter.name} para os fantasmas
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subtle Dungeon Alert for Prisoner */}
      {privateState.jailedThisRound &&
        publicState.phase === 'CACADA' &&
        activeTab !== 'canal' && (
          <div className="lg:hidden fixed bottom-20 left-4 right-4 z-20">
            <button
              type="button"
              onClick={() => {
                setActiveChannel('DUNGEON');
                setActiveTab('canal');
              }}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#8FD0EE]/50 bg-[#111A2A]/95 px-4 py-2 text-xs font-bold text-[#BFE6F7] shadow-lg"
            >
              <Lock className="w-4 h-4" />
              Você está na Masmorra — Abrir Interrogatório
            </button>
          </div>
        )}
    </div>
  );
}
