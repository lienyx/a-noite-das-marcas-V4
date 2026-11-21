import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClientActionMessage, RoomSyncPayload, ServerMessage } from '../shared/types';
import { playBellSound } from '../utils/sound';

type Session = { roomCode: string; name: string };
function readSession(): Session | null {
  try {
    const value = JSON.parse(sessionStorage.getItem('ndm_last_session') ?? 'null');
    return value && typeof value.roomCode === 'string' && typeof value.name === 'string' ? value : null;
  } catch { return null; }
}
// crypto.randomUUID só existe em páginas seguras (https ou localhost). Abrindo o jogo por
// http://192.168.x.x na rede local ele não existe e a tela quebrava; este fallback evita isso.
function newToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function playerToken() {
  try {
    const existing = sessionStorage.getItem('ndm_player_token');
    if (existing) return existing;
    const token = newToken();
    sessionStorage.setItem('ndm_player_token', token);
    return token;
  } catch { return newToken(); }
}

export function useGameSocket() {
  const [connected, setConnected] = useState(false);
  const [pending, setPending] = useState(false);
  const [roomState, setRoomState] = useState<RoomSyncPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const tokenRef = useRef<string | null>(null);
  if (!tokenRef.current) tokenRef.current = playerToken();
  const sessionRef = useRef<Session | null>(readSession());
  const clearSession = useCallback(() => {
    sessionRef.current = null;
    try { sessionStorage.removeItem('ndm_last_session'); } catch { /* Storage may be disabled. */ }
    setRoomState(null);
    setPending(false);
  }, []);

  useEffect(() => {
    let disposed = false;
    let attempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let lastMessageAt = Date.now();
    const connect = () => {
      if (disposed) return;
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${location.host}/ws`);
      wsRef.current = socket;
      socket.onopen = () => {
        if (disposed) { socket.close(); return; }
        attempt = 0;
        lastMessageAt = Date.now();
        setConnected(true);
        setErrorMsg(null);
        if (sessionRef.current) socket.send(JSON.stringify({ type: 'JOIN_ROOM', ...sessionRef.current, playerToken: tokenRef.current }));
      };
      socket.onmessage = event => {
        if (disposed) return;
        lastMessageAt = Date.now();
        try {
          const message = JSON.parse(event.data) as ServerMessage;
          if (message.type === 'SYNC') {
            setRoomState(message.payload);
            setPending(false);
            setErrorMsg(null);
            const me = message.payload.publicState.players.find(p => p.id === message.payload.privateState.playerId);
            if (me) {
              sessionRef.current = { roomCode: message.payload.publicState.roomCode, name: me.name };
              try { sessionStorage.setItem('ndm_last_session', JSON.stringify(sessionRef.current)); } catch { /* Optional session recovery. */ }
            }
          } else if (message.type === 'LEFT') {
            clearSession();
          } else if (message.type === 'ERROR') {
            setPending(false);
            setErrorMsg(message.message);
            if (/não encontrada|removido da sala/.test(message.message)) clearSession();
          } else if (message.type === 'TOAST') {
            setToastMsg(message.message);
          } else if (message.type === 'BELL_SOUND') playBellSound(message.reason);
        } catch { /* Ignore a malformed server frame and keep the connection. */ }
      };
      socket.onerror = () => { /* onclose handles recovery. */ };
      socket.onclose = event => {
        if (disposed) return;
        wsRef.current = null;
        setConnected(false);
        setPending(false);
        if (event.code === 4001) {
          clearSession();
          setErrorMsg('Esta sessão foi aberta em outra janela. Recarregue para continuar.');
          return;
        }
        reconnectTimer = setTimeout(connect, Math.min(20_000, 800 * 2 ** attempt++) + Math.random() * 400);
      };
    };
    connect();
    // Also refreshes players connected to another server instance and resumes expired phases.
    const heartbeat = setInterval(() => {
      const socket = wsRef.current;
      if (socket?.readyState !== WebSocket.OPEN || !sessionRef.current) return;
      if (Date.now() - lastMessageAt > 30_000) { socket.close(); return; }
      socket.send(JSON.stringify({ type: 'SYNC_REQUEST' }));
    }, 6000);
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const socket = wsRef.current;
      if (socket?.readyState === WebSocket.OPEN && sessionRef.current) socket.send(JSON.stringify({ type: 'SYNC_REQUEST' }));
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      disposed = true;
      clearInterval(heartbeat);
      clearTimeout(reconnectTimer);
      document.removeEventListener('visibilitychange', onVisible);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [clearSession]);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => { setPending(false); setErrorMsg('A cidade demorou a responder. Confira sua conexão e tente novamente.'); }, 20_000);
    return () => clearTimeout(timer);
  }, [pending]);
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 8000);
    return () => clearTimeout(timer);
  }, [errorMsg]);
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const sendAction = useCallback((action: ClientActionMessage) => {
    const socket = wsRef.current;
    if (socket?.readyState !== WebSocket.OPEN) { setErrorMsg('Reconectando à cidade. Aguarde um instante.'); return; }
    if (action.type === 'CREATE_ROOM' || action.type === 'JOIN_ROOM') {
      setPending(true);
      setErrorMsg(null);
      socket.send(JSON.stringify({ ...action, playerToken: tokenRef.current }));
    } else socket.send(JSON.stringify(action));
  }, []);
  const leaveSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) sendAction({ type: 'LEAVE_ROOM' });
    else clearSession();
    const url = new URL(location.href);
    url.searchParams.delete('room');
    history.replaceState(null, '', url);
  }, [clearSession, sendAction]);

  return { connected, pending, roomState, errorMsg, toastMsg, sendAction, leaveSession };
}
