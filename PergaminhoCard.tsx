import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Skull } from './art/Ornaments';
import { ROLES, STICKER_META, type SlipType, type StickerType } from '../shared/gameData';
import type { PrivatePlayerState, PublicPlayer } from '../shared/types';
import { getFactionMeta } from './RoleIcon';
import { TarotCard } from './art/TarotCard';

const SLIP_NAMES: Record<SlipType, string> = {
  match: 'Fósforo',
  bullet: 'Bala',
  execution: 'Execução',
  silence: 'Cale-se',
  vest: 'Colete',
};

export function PergaminhoCard({
  privateState,
  me,
}: {
  privateState: PrivatePlayerState;
  me: PublicPlayer | undefined;
}) {
  const [revealed, setRevealed] = useState(false);
  const [foldMode, setFoldMode] = useState<'full' | 'appearance' | 'group'>('full');

  // Auto-hide after 18s to prevent accidental shoulder-surfing at the party
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setRevealed(false), 18_000);
    return () => clearTimeout(t);
  }, [revealed]);

  useEffect(() => {
    const conceal = () => { if (document.hidden) { setRevealed(false); setFoldMode('full'); } };
    document.addEventListener('visibilitychange', conceal);
    return () => document.removeEventListener('visibilitychange', conceal);
  }, []);

  const role = privateState.roleId ? ROLES[privateState.roleId] : null;
  if (!role) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-6 text-center text-sm text-[#9AA3BC]">
        O seu pergaminho será entregue quando a partida iniciar.
      </div>
    );
  }

  const factionMeta = getFactionMeta(role.faction);

  const stickerEntries = (Object.entries(privateState.stickers) as Array<[StickerType, number]>)
    .filter(([, count]) => count > 0);
  const slipEntries = (Object.entries(privateState.slips) as Array<[SlipType, number]>)
    .filter(([, count]) => count > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#F2F0FA]">
            Pergaminho Secreto
          </h2>
          <p className="text-xs text-[#9AA3BC]">
            Mantenha oculto dos convidados ao seu lado
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-[#8FD0EE]/40 bg-[#8FD0EE]/15 px-4 py-2 text-xs font-semibold text-[#BFE6F7] transition-colors hover:bg-[#8FD0EE]/25 whitespace-nowrap shrink-0"
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {revealed ? 'Ocultar Papel' : 'Revelar Papel'}
        </button>
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="w-full rounded-2xl border border-[#8FD0EE]/25 bg-[#111A2A] p-8 text-center transition-transform active:scale-[0.99] cursor-pointer"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#E23B4E]/40 bg-[#E23B4E]/20 text-[#FF8A98]">
            <Skull className="w-9 h-9" />
          </div>
          <p className="font-display text-base font-bold text-[#F2F0FA]">
            Envelope Lacrado
          </p>
          <p className="mt-1 text-xs text-[#9AA3BC]">
            Toque aqui quando ninguém estiver olhando sua tela. Fecha sozinho após 18s.
          </p>
        </button>
      ) : (
        <div className="space-y-4">
          {/* Mode switcher for folding parchment */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#111A2A] p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setFoldMode('full')}
              className={`min-h-[40px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                foldMode === 'full'
                  ? 'bg-[#8FD0EE] text-[#0A0F18] font-semibold'
                  : 'text-[#9AA3BC] hover:text-white'
              }`}
            >
              Pergaminho
            </button>
            <button
              type="button"
              onClick={() => setFoldMode('appearance')}
              className={`min-h-[40px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                foldMode === 'appearance'
                  ? 'bg-[#8FD0EE] text-[#0A0F18] font-semibold'
                  : 'text-[#9AA3BC] hover:text-white'
              }`}
            >
              Faixa Aparência
            </button>
            <button
              type="button"
              onClick={() => setFoldMode('group')}
              className={`min-h-[40px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                foldMode === 'group'
                  ? 'bg-[#8FD0EE] text-[#0A0F18] font-semibold'
                  : 'text-[#9AA3BC] hover:text-white'
              }`}
            >
              Faixa Grupo
            </button>
          </div>

          <div className="parchment-surface rounded-2xl border-2 border-[#241029] p-5 space-y-4">
            {foldMode === 'full' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <TarotCard roleId={role.id} size="md" />
                  <div className="min-w-0 pt-1">
                    <p className="text-[11px] font-semibold tracking-wide text-[#5A3560]">
                      {role.categoryHeader}
                    </p>
                    <h3 className="font-display text-3xl font-bold leading-none text-[#241029]">
                      {role.name}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-[#4A2A52]">
                      Objetivo: {role.victoryText}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[#34203D]">
                  {role.summary}
                </p>

                <div className="flex items-center justify-between border-t-2 border-dashed border-[#5B3A63]/50 pt-3 text-xs font-semibold text-[#34203D]">
                  <span>Aparência: {role.appearance}</span>
                  <span>Grupo: {role.groupLabel}</span>
                </div>
              </div>
            ) : foldMode === 'appearance' ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-medium text-[#5A3560]">
                  Faixa dobrada (para o Xerife)
                </p>
                <p className="font-display text-2xl font-bold text-[#241029]">
                  APARÊNCIA: {role.appearance}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-medium text-[#5A3560]">
                  Faixa dobrada (para o Investigador)
                </p>
                <p className="font-display text-2xl font-bold text-[#241029]">
                  GRUPO: {role.groupLabel}
                </p>
              </div>
            )}
          </div>

          {/* Linked info: Mafia partners, Anjo / Carrasco target */}
          {privateState.mafiaPartners.length > 0 && (
            <div className="rounded-2xl border border-[#E23B4E]/30 bg-[#111A2A] p-4 space-y-2">
              <p className="text-xs font-semibold text-[#FF8A98]">
                Parceiros da Máfia ({privateState.mafiaSealUsedThisRound}/{privateState.mafiaSealLimitThisRound} selo(s) usados nesta rodada)
              </p>
              <div className="space-y-1.5">
                {privateState.mafiaPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between text-sm text-[#E9E7F3]"
                  >
                    <span>
                      {partner.name} · {ROLES[partner.roleId].name}
                    </span>
                    <span className="text-xs text-[#9AA3BC]">
                      {partner.alive ? 'Vivo' : 'Fantasma'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {privateState.linkedTargetName && (
            <div className="rounded-2xl border border-[#8FD0EE]/35 bg-[#111A2A] p-4">
              <p className="text-xs font-semibold text-[#BFE6F7]">
                {role.id === 'anjo_da_guarda'
                  ? 'Seu Protegido (à sua direita)'
                  : 'Seu Alvo do Tribunal (à sua esquerda)'}
              </p>
              <p className="mt-1 text-base font-bold text-[#F2F0FA]">
                {privateState.linkedTargetName}
              </p>
            </div>
          )}

          {/* Inventory */}
          <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#CFCBE0]">
                Seu Envelope Digital
              </p>
              <span className={`text-xs font-medium ${factionMeta.textColor}`}>
                {me?.alive ? 'Vivo' : 'Fantasma'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stickerEntries.map(([st, count]) => (
                <div
                  key={st}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0A0F18]/60 px-3 py-2"
                >
                  <span className="text-[#CFCBE0] truncate">{STICKER_META[st].shortLabel}</span>
                  <span className="font-mono font-semibold text-[#F2F0FA] tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
              {slipEntries.map(([sl, count]) => (
                <div
                  key={sl}
                  className="flex items-center justify-between rounded-xl border border-[#8FD0EE]/30 bg-[#8FD0EE]/10 px-3 py-2"
                >
                  <span className="text-[#BFE6F7] truncate">{SLIP_NAMES[sl]}</span>
                  <span className="font-mono font-semibold text-[#BFE6F7] tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            {role.id === 'pirata' && (
              <p className="text-xs text-[#BFE6F7]">
                Vitórias em duelos: <span className="font-mono tabular-nums">{privateState.pirateWins}/2</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Secret investigation / event log */}
      <div className="rounded-2xl border border-white/10 bg-[#111A2A] p-4 space-y-2">
        <h3 className="text-xs font-semibold text-[#CFCBE0]">
          Anotações Secretas
        </h3>
        {privateState.secretNotes.length === 0 ? (
          <p className="text-xs text-[#7E88A3]">
            Resultados de investigações, exames do Legista e sussurros aparecerão aqui.
          </p>
        ) : (
          <ul className="space-y-2">
            {privateState.secretNotes.map((note) => (
              <li
                key={note.id}
                className="border-b border-white/5 pb-2 last:border-0 last:pb-0 text-xs text-[#E9E7F3] leading-relaxed"
              >
                <span className="font-mono text-[#8FD0EE] mr-2 tabular-nums">R{note.round}</span>
                {note.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
