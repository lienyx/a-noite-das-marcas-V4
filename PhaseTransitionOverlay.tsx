import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Crown, Moon, Sun } from 'lucide-react';
import type { GamePhase } from '../shared/gameData';

interface PhaseVisual {
  title: string;
  subtitle: string;
  backdropClass: string;
  accentClass: string;
  Icon: typeof Moon;
}

function getPhaseVisual(phase: GamePhase, round: number): PhaseVisual | null {
  switch (phase) {
    case 'NOITE_ZERO':
      return {
        title: 'Noite Zero',
        subtitle: 'A cidade adormece e a Máfia se reconhece',
        backdropClass: 'bg-[#05060B]/92',
        accentClass: 'text-[#C4A3FF] border-[#8B5CF6]/30 bg-[#8B5CF6]/10',
        Icon: Moon,
      };
    case 'CACADA':
      return {
        title: `Anoitece · Rodada ${round}`,
        subtitle: 'A Caçada começou — aja em segredo',
        backdropClass: 'bg-[#05080E]/90',
        accentClass: 'text-[#C4A3FF] border-[#8B5CF6]/30 bg-[#8B5CF6]/10',
        Icon: Moon,
      };
    case 'BADALADA':
      return {
        title: 'Badalada',
        subtitle: 'Luz baixa, todos passam pela Urna',
        backdropClass: 'bg-[#140B14]/90',
        accentClass: 'text-[#FF8A98] border-[#E23B4E]/40 bg-[#E23B4E]/15',
        Icon: Bell,
      };
    case 'DANCA_DOS_SELOS':
      return {
        title: 'Dança dos Selos',
        subtitle: 'O resultado da noite é revelado',
        backdropClass: 'bg-[#0E1220]/90',
        accentClass: 'text-[#BFE6F7] border-[#8FD0EE]/40 bg-[#8FD0EE]/15',
        Icon: Bell,
      };
    case 'TRIBUNAL':
      return {
        title: `Amanhece · Tribunal ${round}`,
        subtitle: 'Debate aberto e votação da cidade',
        backdropClass: 'bg-[#0E1220]/88',
        accentClass: 'text-[#BFE6F7] border-[#8FD0EE]/45 bg-[#8FD0EE]/15',
        Icon: Sun,
      };
    case 'FIM_DE_JOGO':
      return {
        title: 'Fim da Partida',
        subtitle: 'Todos os pergaminhos serão revelados',
        backdropClass: 'bg-[#0A0F18]/92',
        accentClass: 'text-[#BFE6F7] border-[#8FD0EE]/45 bg-[#8FD0EE]/15',
        Icon: Crown,
      };
    default:
      return null;
  }
}

export function PhaseTransitionOverlay({
  phase,
  round,
}: {
  phase: GamePhase | null;
  round: number;
}) {
  const prevPhaseRef = useRef<GamePhase | null>(null);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [visual, setVisual] = useState<PhaseVisual | null>(null);

  useEffect(() => {
    if (!phase) {
      prevPhaseRef.current = null;
      setVisibleKey(null);
      return;
    }

    if (prevPhaseRef.current === phase) return;
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    // Skip curtain on Lobby entry, show on all active gameplay phase transitions
    if (phase === 'LOBBY') {
      return;
    }

    const nextVisual = getPhaseVisual(phase, round);
    if (!nextVisual) return;

    setVisual(nextVisual);
    setVisibleKey(`${phase}-${round}-${Date.now()}`);

    const t = setTimeout(() => {
      setVisibleKey(null);
    }, 1150);

    return () => clearTimeout(t);
  }, [phase, round]);

  const Icon = visual?.Icon ?? Moon;

  return (
    <AnimatePresence>
      {visibleKey && visual && (
        <motion.div
          key={visibleKey}
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(14px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center px-6 ${visual.backdropClass}`}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.03, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3 max-w-sm"
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${visual.accentClass}`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F0FA]">
              {visual.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#CFCBE0]">
              {visual.subtitle}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
