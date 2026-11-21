import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, LogOut } from 'lucide-react';
import { GameWorkspace } from './components/GameWorkspace';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { NightZeroView } from './components/NightZeroView';
import { PhaseTransitionOverlay } from './components/PhaseTransitionOverlay';
import { RulesModal } from './components/RulesModal';
import { BrandMark } from './components/BrandMark';
import { useGameSocket } from './hooks/useGameSocket';

export default function App() {
  const { connected, pending, roomState, errorMsg, toastMsg, sendAction, leaveSession } =
    useGameSocket();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesTab, setRulesTab] = useState<'regras' | 'papeis'>('regras');
  const closeRules = useCallback(() => setRulesOpen(false), []);
  const openRules = (tab: 'regras' | 'papeis' = 'regras') => { setRulesTab(tab); setRulesOpen(true); };
  const [initialRoomCode, setInitialRoomCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setInitialRoomCode(code.trim().toUpperCase());
    }
  }, []);

  const phaseEndsAt = roomState?.publicState.phaseEndsAt ?? null;
  useEffect(() => {
    if (!phaseEndsAt) {
      setSecondsLeft(null);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [phaseEndsAt]);

  const currentPhase = roomState?.publicState.phase ?? null;
  const currentRound = roomState?.publicState.round ?? 0;

  const isDaylightPhase = currentPhase === 'TRIBUNAL';
  const isDuskPhase =
    currentPhase === 'BADALADA' || currentPhase === 'DANCA_DOS_SELOS';

  const screenKey = !roomState
    ? 'HOME'
    : currentPhase === 'LOBBY'
      ? 'LOBBY'
      : currentPhase === 'NOITE_ZERO'
        ? 'NOITE_ZERO'
        : 'GAME';

  const renderContent = () => {
    if (!roomState) {
      return (
        <HomeScreen
          connected={connected}
          pending={pending}
          initialRoomCode={initialRoomCode}
          onCreateRoom={(name) => sendAction({ type: 'CREATE_ROOM', name })}
          onJoinRoom={(roomCode, name) =>
            sendAction({ type: 'JOIN_ROOM', roomCode, name })
          }
          onOpenRules={() => openRules()}
          onOpenRoles={() => openRules('papeis')}
        />
      );
    }

    const { publicState, privateState } = roomState;

    if (publicState.phase === 'LOBBY') {
      return (
        <div className="min-h-screen flex flex-col">
          <header className="session-header sticky top-0 z-30 h-13 border-b border-white/10 bg-[#0A0F18]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
            <a href="/" onClick={(event) => event.preventDefault()} className="brand"><BrandMark /><span>A NOITE<span>DAS MARCAS</span></span></a>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openRules()}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#CFCBE0] hover:text-white whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-[#8FD0EE]" />
                Regras
              </button>
              <button
                type="button"
                onClick={leaveSession}
                aria-label="Sair da sala"
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#9AA3BC] hover:text-white whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </header>
          <LobbyScreen
            publicState={publicState}
            playerId={privateState.playerId}
            onAction={sendAction}
          />
        </div>
      );
    }

    if (publicState.phase === 'NOITE_ZERO') {
      return (
        <div className="min-h-screen flex flex-col">
          <header className="session-header sticky top-0 z-30 h-13 border-b border-white/10 bg-[#0A0F18]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
            <span className="font-display text-base font-bold text-[#F2F0FA] truncate">
              Noite Zero · Sala {publicState.roomCode}
            </span>
            <button
              type="button"
              onClick={() => openRules()}
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#CFCBE0] hover:text-white whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-[#8FD0EE]" />
              Regras
            </button>
          </header>
          <NightZeroView
            publicState={publicState}
            privateState={privateState}
            secondsLeft={secondsLeft}
            onAction={sendAction}
          />
        </div>
      );
    }

    return (
      <GameWorkspace
        publicState={publicState}
        privateState={privateState}
        secondsLeft={secondsLeft}
        onAction={sendAction}
        onOpenRules={() => openRules()}
        onLeave={leaveSession}
      />
    );
  };

  return (
    <div
      className={`game-shell min-h-screen text-[#E9E7F3] transition-colors duration-700 ${
        isDaylightPhase
          ? 'bg-[#0B1019] bg-[radial-gradient(ellipse_at_top,rgba(143,208,238,0.10),transparent_60%)]'
          : isDuskPhase
            ? 'bg-[#140B14] bg-[radial-gradient(ellipse_at_top,rgba(226,59,78,0.12),transparent_60%)]'
            : 'bg-[#0A0F18]'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {roomState && !connected && <div className="session-banner" role="status">A conexão foi interrompida. Reconectando à sua partida…</div>}
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <PhaseTransitionOverlay phase={currentPhase} round={currentRound} />

      {(errorMsg || toastMsg) && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-none">
          {errorMsg && (
            <div role="alert" className="rounded-xl border border-[#E23B4E]/60 bg-[#1E0F1C]/95 px-4 py-3 text-xs font-semibold text-[#FF8A98] shadow-xl">
              {errorMsg}
            </div>
          )}
          {toastMsg && !errorMsg && (
            <div role="status" className="rounded-xl border border-[#8FD0EE]/50 bg-[#0F1726]/95 px-4 py-3 text-xs font-semibold text-[#BFE6F7] shadow-xl">
              {toastMsg}
            </div>
          )}
        </div>
      )}

      <RulesModal initialTab={rulesTab} open={rulesOpen} onClose={closeRules} />
    </div>
  );
}
