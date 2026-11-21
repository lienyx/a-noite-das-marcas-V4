import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Download, EyeOff, Moon, Shield, Users, Volume2, VolumeX } from 'lucide-react';
import { ROLES, type Faction, type RoleId } from '../shared/gameData';
import { BrandMark, Banner, Bat, Drips, Moon as MoonArt, Raven, Skull } from './art/Ornaments';
import { FACTION_PAL } from './art/Characters';
import { TarotCard } from './art/TarotCard';
import { isSoundMuted, setSoundMuted } from '../utils/sound';

const CAST: Array<{ title: string; note: string; color: string; factions: Faction[] }> = [
  { title: 'Cidade', note: 'protege, investiga e vota', color: FACTION_PAL.CIDADE.o, factions: ['CIDADE'] },
  { title: 'Máfia', note: 'marca em silêncio', color: FACTION_PAL.MAFIA.o, factions: ['MAFIA'] },
  { title: 'Neutros', note: 'cada um joga por si', color: FACTION_PAL.NEUTRO_MATADOR.o, factions: ['NEUTRO_BENIGNO', 'NEUTRO_MATADOR', 'NEUTRO_CAOS'] },
];

const MOMENTS = [
  { n: 'I', t: 'A caçada', d: 'Disfarce suas intenções. Investigue, proteja ou marque seu próximo alvo em segredo.' },
  { n: 'II', t: 'A badalada', d: 'O sino toca. Todos passam pela urna. Um papel em branco também esconde uma escolha.' },
  { n: 'III', t: 'A dança dos selos', d: 'As marcas revelam suas consequências. Alguns se salvam. Outros viram fantasmas.' },
  { n: 'IV', t: 'O tribunal', d: 'Acuse, defenda, convença. A cidade vota — e nem sempre condena a pessoa certa.' },
];

function StageBackdrop() {
  return (
    <svg className="stage-bg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="moonglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#cbebf8" stopOpacity=".5" />
          <stop offset="1" stopColor="#cbebf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="318" cy="92" r="92" fill="url(#moonglow)" />
      <g fill="#8fd0ee" opacity=".7">
        <circle cx="46" cy="70" r="2" /><circle cx="110" cy="40" r="1.6" /><circle cx="170" cy="86" r="1.8" />
        <circle cx="230" cy="36" r="1.4" /><circle cx="64" cy="134" r="1.4" /><circle cx="270" cy="150" r="1.6" />
      </g>
      <g stroke="#060a12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M30 420L34 250M34 300L8 262M34 330L62 292M34 270L52 236" />
        <path d="M372 420L366 230M366 290L394 252M366 322L338 288M366 260L350 226" />
      </g>
      <path d="M0 392C60 376 120 400 200 386C280 372 340 398 400 384L400 500L0 500Z" fill="#0a111d" />
      <path d="M0 430C80 416 150 440 220 428C300 414 360 436 400 426L400 500L0 500Z" fill="#060a12" />
      <path d="M0 360C70 346 130 366 200 356C270 346 340 366 400 352" fill="none" stroke="#8fd0ee" strokeOpacity=".22" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}

export function HomeScreen({ connected, initialRoomCode, pending, onCreateRoom, onJoinRoom, onOpenRules, onOpenRoles }: {
  connected: boolean;
  initialRoomCode: string;
  pending: boolean;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomCode: string, name: string) => void;
  onOpenRules: () => void;
  onOpenRoles: () => void;
}) {
  const [mode, setMode] = useState<'join' | 'create'>(initialRoomCode ? 'join' : 'create');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [muted, setMuted] = useState(isSoundMuted);

  useEffect(() => {
    if (initialRoomCode) { setRoomCode(initialRoomCode); setMode('join'); }
  }, [initialRoomCode]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!connected || pending || !name.trim()) return;
    if (mode === 'create') onCreateRoom(name.trim());
    else if (/^[A-HJ-NP-Z2-9]{4}$/.test(roomCode)) onJoinRoom(roomCode, name.trim());
  };

  const roleIds = Object.keys(ROLES) as RoleId[];

  return (
    <div className="landing">
      <Drips className="page-drips" color="#8fd0ee" />
      <header className="landing-header page-width">
        <a href="/" className="brand" aria-label="A Noite das Marcas — início">
          <BrandMark />
          <span>A Noite<span>das Marcas</span></span>
        </a>
        <nav className="landing-nav" aria-label="Navegação principal">
          <button onClick={onOpenRules}>Como jogar</button>
          <button onClick={onOpenRoles}>Os papéis <span>{roleIds.length}</span></button>
          <a href="/assets/aistudio/noite-das-marcas-town-of-salem_0cc06509.pdf" target="_blank" rel="noreferrer" className="nav-rulebook"><BookOpen size={17} /> Livro de regras <Download size={15} /></a>
        </nav>
        <button className="sound-control" type="button" aria-label={muted ? 'Ativar som' : 'Desativar som'} aria-pressed={!muted} onClick={() => { setSoundMuted(!muted); setMuted(!muted); }}>
          {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
      </header>

      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Um jogo de dedução social</p>
            <h1>A noite<span className="l2">das <span className="l3">marcas</span></span></h1>
            <p className="hero-description">Nesta cidade, todo mundo esconde algo. Reúna seus amigos, guarde seu segredo e descubra em quem confiar antes da próxima badalada.</p>
            <div className="hero-facts"><span><Users size={16} /> 4–20 jogadores</span><span><Moon size={16} /> Sem mestre</span><span><EyeOff size={16} /> Papéis secretos</span></div>

            <div className="entry-panel" id="jogar">
              <div className="entry-tabs" role="tablist" aria-label="Escolha como jogar">
                <button id="create-tab" role="tab" aria-selected={mode === 'create'} aria-controls="entry-form" onClick={() => setMode('create')}>Criar uma sala <span>+</span></button>
                <button id="join-tab" role="tab" aria-selected={mode === 'join'} aria-controls="entry-form" onClick={() => setMode('join')}>Tenho um código <ArrowRight size={17} /></button>
              </div>
              <form id="entry-form" role="tabpanel" aria-labelledby={mode === 'create' ? 'create-tab' : 'join-tab'} onSubmit={handleSubmit}>
                <div className={`entry-fields ${mode === 'join' ? 'has-code' : ''}`}>
                  <div className="entry-field"><label htmlFor="player-name">Como devem chamar você?</label><input id="player-name" name="name" autoComplete="nickname" maxLength={24} minLength={1} required placeholder="Seu nome ou apelido" value={name} onChange={event => setName(event.target.value)} /></div>
                  {mode === 'join' && <div className="entry-field code-field"><label htmlFor="room-code">Código da sala</label><input id="room-code" name="room" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={4} minLength={4} pattern="[A-HJ-NP-Z2-9]{4}" required placeholder="A7K9" value={roomCode} onChange={event => setRoomCode(event.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, ''))} /></div>}
                  <button className="plate entry-submit" type="submit" disabled={!connected || pending || !name.trim() || (mode === 'join' && roomCode.length !== 4)}>
                    <span>{pending ? 'Preparando sua entrada…' : !connected ? 'Conectando…' : mode === 'create' ? 'Que comece a noite' : 'Entrar na cidade'}</span><ArrowRight size={22} />
                  </button>
                </div>
                <p className="entry-hint"><Shield size={15} /> {mode === 'create' ? 'Crie a sala e compartilhe o convite. Todos jogam pelo celular.' : 'Peça o código de 4 caracteres para quem criou a sala.'}</p>
              </form>
            </div>
          </div>

          <div className="stage" role="img" aria-label="Três cartas de tarô com os personagens Xerife, Chefão e Assassino em Série, entre uma caveira, um corvo e uma bandeira com pentagrama, sob a lua.">
            <StageBackdrop />
            <MoonArt className="stage-prop stage-moon" />
            <span className="stage-count l" aria-hidden="true">4–20</span>
            <span className="stage-count r" aria-hidden="true">{roleIds.length} papéis</span>
            <div className="stage-cards" aria-hidden="true">
              <div className="sc c1"><TarotCard roleId="xerife" size="md" /></div>
              <div className="sc c2"><TarotCard roleId="assassino_em_serie" size="lg" /></div>
              <div className="sc c3"><TarotCard roleId="chefao" size="md" /></div>
            </div>
            <Banner className="stage-prop stage-banner" />
            <Raven className="stage-prop stage-raven" />
            <div className="stage-skulls" aria-hidden="true"><Skull /><Skull /><Skull /></div>
            <Bat className="stage-prop stage-bat" tint="#cbebf8" />
            <p className="stage-caption" aria-hidden="true">Todos jogam.<em>Ninguém narra.</em></p>
          </div>
        </section>

        <div className="interlude page-width"><span className={`connection-status ${connected ? 'is-connected' : ''}`} role="status"><span />{connected ? 'A cidade está à sua espera' : 'Conectando à cidade…'}</span><a href="#elenco">Conheça o elenco <ChevronRight size={16} /></a><span className="interlude-note">Inspirado em Town of Salem</span></div>

        <section className="cast-section" id="elenco">
          <div className="page-width">
            <div className="section-heading">
              <div><p className="eyebrow"><span /> Um bicho para cada segredo</p><h2>O elenco da noite</h2></div>
              <p>Cada papel tem o seu personagem. Toque numa carta para ler o que ele faz.</p>
            </div>
            {CAST.map(group => {
              const ids = roleIds.filter(id => group.factions.includes(ROLES[id].faction));
              return (
                <div className="faction-row" key={group.title} style={{ ['--o' as string]: group.color }}>
                  <h3>{group.title}<small>{group.note}</small></h3>
                  <div className="cast-grid">
                    {ids.map(id => (
                      <button key={id} type="button" className="cast-card" onClick={onOpenRoles} aria-label={`${ROLES[id].name}: ver detalhes`}>
                        <TarotCard roleId={id} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="moments page-width" id="ritual">
          <div className="section-heading"><div><p className="eyebrow"><span /> Entre a confiança e a traição</p><h2>Uma noite, quatro momentos</h2></div><button className="plate plate-ghost" onClick={onOpenRules}>Entenda as regras <ChevronRight size={18} /></button></div>
          <ol className="moment-steps">
            {MOMENTS.map(m => (
              <li key={m.n}><span className="numeral" aria-hidden="true">{m.n}</span><h3>{m.t}</h3><p>{m.d}</p></li>
            ))}
          </ol>
          <div className="first-night"><Check size={20} /><p><strong>Sua primeira noite?</strong> Escolha o baralho Clássico. O jogo distribui os papéis e conduz as fases para vocês.</p><button onClick={onOpenRoles}>Conhecer os papéis <ArrowRight size={18} /></button></div>
        </section>
      </main>
      <footer className="landing-footer page-width"><a className="footer-brand" href="/"><BrandMark className="w-6 h-7" /> A Noite das Marcas</a><span>Reúna os amigos. Guarde seu segredo.</span><a href="/assets/aistudio/noite-das-marcas-town-of-salem_0cc06509.pdf" target="_blank" rel="noreferrer">Regras originais <Download size={15} /></a></footer>
    </div>
  );
}
