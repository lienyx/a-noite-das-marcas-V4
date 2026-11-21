// Armazenamento das salas em memória do servidor.
// Antes, cada sala era gravada num banco Postgres do Netlify, que só existe lá:
// em qualquer outro lugar (seu PC, Render, etc.) criar sala falhava.
// Para jogar com amigos isso basta. Se o servidor reiniciar, as salas abertas são perdidas.

export type RoomRecord = { code: string; state: any; updatedAt: Date };

const IDLE_ROOM_MS = 12 * 60 * 60 * 1000; // salas paradas há 12h são apagadas

export const roomStore = {
  records: new Map<string, RoomRecord>(),
  has(code: string): boolean {
    return this.records.has(code);
  },
  load(code: string): RoomRecord | undefined {
    const record = this.records.get(code);
    return record ? structuredClone(record) : undefined;
  },
  save(record: RoomRecord): void {
    this.records.set(record.code, structuredClone(record));
  },
  prune(isActive: (code: string) => boolean, now = Date.now()): void {
    for (const [code, record] of this.records) {
      if (!isActive(code) && now - record.updatedAt.getTime() > IDLE_ROOM_MS) this.records.delete(code);
    }
  },
};
