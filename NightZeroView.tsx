import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { NOITE_ZERO_SCRIPT, ROLES } from '../shared/gameData';
import type { ClientActionMessage, PrivatePlayerState, PublicGameState } from '../shared/types';
import { speakNoiteZeroLine, stopSpeech } from '../utils/sound';
import { PergaminhoCard } from './PergaminhoCard';

export function NightZeroView({
  publicState,
  privateState,
  secondsLeft,
  onAction,
}: {
  publicState: PublicGameState;
  privateState: PrivatePlayerState;
  secondsLeft: number | null;
  onAction: (action: ClientActionMessage) => void;
}) {
  const [narrating, setNarrating] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  const me = publicState.players.find((p) => p.id === privateState.playerId);
  const isHost = Boolean(me?.isHost);
  const isMafia = privateState.roleId ? ROLES[privateState.roleId].faction === 'MAFIA' : false;

  useEffect(() => {
    if (!narrating) {
      stopSpeech();
      return;
    }
    const line = NOITE_ZERO_SCRIPT[lineIndex];
    if (!line) {
      setNarrating(false);
      return;
    }
    speakNoiteZeroLine(line.text);
    if (lineIndex < NOITE_ZERO_SCRIPT.length - 1) {
      const t = setTimeout(() => {
        setLineIndex((i) => i + 1);
      }, (line.delaySec + 4) * 1000);
      return () => clearTimeout(t);
    }
    const endT = setTimeout(() => setNarrating(false), 5000);
    return () => clearTimeout(endT);
  }, [narrating, lineIndex]);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6">
      <div className="rounded-2xl border border-[#E23B4E]/30 bg-[#111A2A] p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#FF8A98]">
              Antes da Rodada 1
            </p>
            <h1 className="font-display text-2xl font-bold text-[#F2F0FA]">
              Noite Zero
            </h1>
          </div>
          {secondsLeft !== null && (
            <span className="font-mono text-xl font-bold text-[#BFE6F7] tabular-nums">
              {secondsLeft}s
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-[#CFCBE0]">
          Sentem-se em círculo. O áudio guia todos a fecharem os olhos enquanto a Máfia se reconhece em silêncio — ou veja seus parceiros diretamente no seu celular com total discrição.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (narrating) {
                setNarrating(false);
              } else {
                setLineIndex(0);
                setNarrating(true);
              }
            }}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-[#8FD0EE]/40 bg-[#8FD0EE]/15 px-4 py-2 text-xs font-semibold text-[#BFE6F7] hover:bg-[#8FD0EE]/25 whitespace-nowrap"
          >
            {narrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {narrating ? 'Parar Roteiro em Áudio' : 'Tocar Roteiro em Áudio'}
          </button>

          {isHost && (
            <button
              type="button"
              onClick={() => onAction({ type: 'ADVANCE_PHASE' })}
              className="min-h-[44px] rounded-xl bg-[#8FD0EE] px-4 py-2 text-xs font-bold text-[#0A0F18] hover:bg-[#A9DCF3] whitespace-nowrap"
            >
              Iniciar Rodada 1 (Caçada)
            </button>
          )}
        </div>

        {narrating && (
          <div className="rounded-xl border border-white/10 bg-[#0A0F18] p-4 text-sm italic text-[#F2F0FA]">
            "{NOITE_ZERO_SCRIPT[lineIndex]?.text}"
          </div>
        )}
      </div>

      {isMafia && (
        <div className="rounded-2xl border border-[#E23B4E]/40 bg-[#E23B4E]/10 p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-[#FF8A98]">
            Sua Família da Máfia
          </h2>
          <ul className="space-y-1.5 text-sm text-[#F2F0FA]">
            {privateState.mafiaPartners.map((partner) => (
              <li key={partner.id} className="flex items-center justify-between">
                <span>{partner.name}</span>
                <span className="text-xs text-[#FF8A98]">{ROLES[partner.roleId].name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {privateState.linkedTargetName && (
        <div className="rounded-2xl border border-[#8FD0EE]/35 bg-[#8FD0EE]/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-[#BFE6F7]">
            {privateState.roleId === 'anjo_da_guarda'
              ? 'Seu Protegido (à direita no círculo)'
              : 'Seu Alvo do Tribunal (à esquerda no círculo)'}
          </p>
          <p className="font-display text-xl font-bold text-[#F2F0FA]">
            {privateState.linkedTargetName}
          </p>
        </div>
      )}

      <PergaminhoCard privateState={privateState} me={me} />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onAction({ type: 'TOGGLE_READY' })}
          className={`w-full min-h-[48px] rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            me?.readyForNext
              ? 'border-[#4FD1A1]/50 bg-[#4FD1A1]/20 text-[#9AF0CF]'
              : 'border-white/15 bg-[#111A2A] text-[#E9E7F3] hover:border-white/30'
          }`}
        >
          {me?.readyForNext ? 'Pronto para a Caçada (aguardando outros)' : 'Estou pronto — Avançar'}
        </button>
      </div>
    </div>
  );
}
