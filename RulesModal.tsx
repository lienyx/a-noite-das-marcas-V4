import { useEffect, useRef, useState } from 'react';
import { BookOpen, Download, Search, X } from 'lucide-react';
import { ALL_ROLE_IDS, ROLES, type Faction } from '../shared/gameData';
import { RoleIcon, getFactionMeta } from './RoleIcon';

export function RulesModal({
  open,
  onClose,
  initialTab = 'regras',
}: {
  initialTab?: 'regras' | 'papeis';
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'regras' | 'papeis'>('regras');
  const dialogRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [factionFilter, setFactionFilter] = useState<'ALL' | Faction>('ALL');

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input');
      if (!items?.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [open, initialTab, onClose]);

  if (!open) return null;

  const filteredRoles = ALL_ROLE_IDS.filter((id) => {
    const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return (factionFilter === 'ALL' || ROLES[id].faction === factionFilter) && normalize(ROLES[id].name).includes(normalize(search));
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      role="dialog"
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="rules-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#0E1523] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="rules-title" className="font-display text-2xl font-bold text-[#F2F0FA]">
            O livro da cidade
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar regras"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#9AA3BC] hover:bg-white/5 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-2.5 flex items-center gap-2" role="tablist" aria-label="Livro da cidade">
          <button
            type="button"
            role="tab" aria-selected={tab === 'regras'}
            onClick={() => setTab('regras')}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === 'regras'
                ? 'bg-[#8FD0EE] text-[#0A0F18]'
                : 'text-[#9AA3BC] hover:text-white'
            }`}
          >
            Como Jogar
          </button>
          <button
            type="button"
            role="tab" aria-selected={tab === 'papeis'}
            onClick={() => setTab('papeis')}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === 'papeis'
                ? 'bg-[#8FD0EE] text-[#0A0F18]'
                : 'text-[#9AA3BC] hover:text-white'
            }`}
          >
            Todos os 25 Papéis
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5 text-sm text-[#CFCBE0]">
          {tab === 'regras' ? (
            <div className="space-y-5">
              <p className="text-xs leading-relaxed text-[#9AA3BC]">Adaptação digital do jogo presencial: o servidor distribui os pergaminhos, resolve as ações e conduz as fases. Reúna de 4 a 20 amigos; o baralho original foi pensado para 13 a 15.</p>
              <section className="space-y-2">
                <h3 className="font-display text-base font-bold text-[#F2F0FA]">
                  Todos jogam, ninguém narra
                </h3>
                <p className="leading-relaxed">
                  A lista de papéis em jogo é pública para toda a sala, mas ninguém sabe quem tirou o quê. Cada celular recebe um Pergaminho secreto, adesivos digitais, fichas da Urna e uma Missão Secreta para despiste durante a festa.
                </p>
              </section>

              <section className="space-y-2 border-t border-white/10 pt-4">
                <h3 className="font-display text-base font-bold text-[#F2F0FA]">
                  Lados e condições de vitória
                </h3>
                <ul className="space-y-2 text-xs leading-relaxed">
                  <li>
                    <strong className="text-[#9AF0CF]">Cidade:</strong> Máfia e Matadores Neutros (Assassino em Série, Incendiário) saem do jogo. Neutros de Caos e Benignos não impedem a vitória.
                  </li>
                  <li>
                    <strong className="text-[#FF8A98]">Máfia:</strong> Os mafiosos vivos são metade ou mais dos jogadores vivos.
                  </li>
                  <li>
                    <strong className="text-[#C4A3FF]">Matadores Neutros:</strong> Sobra apenas o matador e mais 1 pessoa viva (se sobrarem os dois, vencem juntos).
                  </li>
                  <li>
                    <strong className="text-[#BFE6F7]">Neutros de Caos e Benignos:</strong> Cada um cumpre seu objetivo (Bobo preso, Carrasco, Pirata com 2 duelos, Sobrevivente vivo, Anjo com protegido vivo).
                  </li>
                </ul>
              </section>

              <section className="space-y-2 border-t border-white/10 pt-4">
                <h3 className="font-display text-base font-bold text-[#F2F0FA]">
                  Fases de cada rodada
                </h3>
                <ol className="space-y-2.5 text-xs leading-relaxed list-decimal pl-4">
                  <li>
                    <strong>Caçada:</strong> Festa normal e ações secretas no celular. Você pode olhar as costas de todos os outros jogadores na aba Praça, mas nunca vê as suas próprias costas. Quem tem poder age em segredo.
                  </li>
                  <li>
                    <strong>Badalada (Urna):</strong> O alarme toca. Todos depositam um papel na Urna digital (Fósforo, Bala, Execução, Cale-se ou papel em branco para manter o anonimato). Sobrevivente pode ativar seu Colete.
                  </li>
                  <li>
                    <strong>Dança dos Selos:</strong> A Urna abre. Bala e Execução matam na hora (ignoram amuleto). Selo Vermelho, Selo Negro e Gota Azul com Fósforo matam, salvo por Amuleto Branco (remove todos os adesivos), Colete ou Escudo Dourado (Guarda-Costas morre no lugar). Gotas azuis sem Fósforo permanecem nas costas.
                  </li>
                  <li>
                    <strong>Tribunal:</strong> Debate e votação. Quem recebeu Cale-se só ouve e vota. Prefeito revelado vale 3 votos; Marechal revelado prende os 2 mais votados. Empate não prende ninguém. O preso revela seu pergaminho a todos e vira fantasma.
                  </li>
                </ol>
              </section>

              <section className="space-y-2 border-t border-white/10 pt-4">
                <h3 className="font-display text-base font-bold text-[#F2F0FA]">
                  Fantasmas e bloqueios
                </h3>
                <p className="text-xs leading-relaxed">
                  <strong>Bloqueio (Dançarina, Consorte, Carcereiro):</strong> Até a próxima Badalada, a pessoa bloqueada não cola adesivos especiais, não investiga, não solta fichas e não usa poderes.
                </p>
                <p className="text-xs leading-relaxed">
                  <strong>Fantasmas:</strong> Não falam sobre o caso com vivos, exceto por 1 Sussurro do Além (uma única frase privada para 1 vivo), conversas livres no canal do Médium e exame do Legista.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#111A2A] px-3 py-2"><Search size={16} /><span className="sr-only">Buscar papel</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar um papel…" className="w-full min-h-7 bg-transparent text-sm outline-none" /></label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['ALL', 'Todos'],
                    ['CIDADE', 'Cidade'],
                    ['MAFIA', 'Máfia'],
                    ['NEUTRO_MATADOR', 'Matadores'],
                    ['NEUTRO_CAOS', 'Caos'],
                    ['NEUTRO_BENIGNO', 'Benignos'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFactionFilter(key)}
                    className={`min-h-[36px] rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      factionFilter === key
                        ? 'bg-[#8FD0EE] text-[#0A0F18] font-semibold'
                        : 'border border-white/10 bg-[#111A2A] text-[#9AA3BC] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {filteredRoles.length === 0 && <p className="py-8 text-center text-sm text-[#9AA3BC]">Nenhum papel encontrado. Experimente outro nome ou categoria.</p>}
                {filteredRoles.map((id) => {
                  const r = ROLES[id];
                  const f = getFactionMeta(r.faction);
                  return (
                    <div
                      key={id}
                      className="rounded-xl border border-white/10 bg-[#111A2A] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`flex h-14 w-12 shrink-0 items-end justify-center rounded-lg border ${f.borderColor} ${f.bgTint}`}>
                            <RoleIcon roleId={id} className="w-11 h-[3.25rem]" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold text-[#F2F0FA] truncate">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-[#9AA3BC]">
                              {f.label} · Aparência: {r.appearance} · {r.groupLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-[#CFCBE0]">
                        {r.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <a href="/assets/aistudio/noite-das-marcas-town-of-salem_0cc06509.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-xs text-[#9FD6F0]"><span className="inline-flex items-center gap-2"><BookOpen size={15} /> Consultar o PDF original</span><Download size={15} /></a>
      </div>
    </div>
  );
}
