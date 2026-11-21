import type { ReactNode } from 'react';
import type { Faction, RoleId } from '../../shared/gameData';

/**
 * Um personagem por papel. Traço grosso de "adesivo", corpo escuro,
 * contorno na cor da facção e olhos brancos arregalados.
 */
export interface Pal {
  o: string; // contorno
  a: string; // acento médio
  a2: string; // acento claro
  b: string; // corpo
  b2: string; // corpo claro
  w: string; // branco osso
  k: string; // tinta (pupilas)
}

const BASE = { b: '#0E131D', b2: '#1B2436', w: '#F4F1FA', k: '#090C13' };

export const FACTION_PAL: Record<Faction, Pal> = {
  CIDADE: { ...BASE, o: '#8FD0EE', a: '#3C86AE', a2: '#CBEBF8' },
  MAFIA: { ...BASE, o: '#FF5A6E', a: '#B3263F', a2: '#FFB3BC' },
  NEUTRO_BENIGNO: { ...BASE, o: '#EDEAF4', a: '#9C97B5', a2: '#FFFFFF' },
  NEUTRO_MATADOR: { ...BASE, o: '#B58CFF', a: '#6B3FC9', a2: '#DCC8FF' },
  NEUTRO_CAOS: { ...BASE, o: '#FF8AC4', a: '#C23F86', a2: '#FFC6E3' },
};

export const ROMAN: Record<RoleId, string> = {
  xerife: 'I', investigador: 'II', legista: 'III', doutor: 'IV', guarda_costas: 'V',
  carcereiro: 'VI', justiceiro: 'VII', prefeito: 'VIII', marechal: 'IX', medium: 'X',
  retribucionista: 'XI', dancarina: 'XII', convidado: 'XIII', chefao: 'XIV', mafioso: 'XV',
  chantagista: 'XVI', conselheiro: 'XVII', consorte: 'XVIII', sobrevivente: 'XIX',
  anjo_da_guarda: 'XX', assassino_em_serie: 'XXI', incendiario: 'XXII', bobo_da_corte: 'XXIII',
  carrasco: 'XXIV', pirata: 'XXV',
};

export const CREATURE: Record<RoleId, string> = {
  xerife: 'Gato', investigador: 'Coelho', legista: 'Corvo', doutor: 'Cogumelo', guarda_costas: 'Urso',
  carcereiro: 'Sapo', justiceiro: 'Raposa', prefeito: 'Porco', marechal: 'Cão', medium: 'Fantasma',
  retribucionista: 'Coruja', dancarina: 'Mariposa', convidado: 'Abóbora', chefao: 'Gato-caveira',
  mafioso: 'Rato', chantagista: 'Cobra', conselheiro: 'Morcego', consorte: 'Aranha',
  sobrevivente: 'Tartaruga', anjo_da_guarda: 'Cordeiro', assassino_em_serie: 'Coelho-caveira',
  incendiario: 'Chama', bobo_da_corte: 'Macaco', carrasco: 'Bode', pirata: 'Polvo',
};

const st = (c: string, w = 3) => ({
  stroke: c,
  strokeWidth: w,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
});

const Eyes = ({ p, x = 60, y = 54, g = 10, r = 6, d = 2.6 }: { p: Pal; x?: number; y?: number; g?: number; r?: number; d?: number }) => (
  <g>
    <circle cx={x - g} cy={y} r={r} fill={p.w} />
    <circle cx={x + g} cy={y} r={r} fill={p.w} />
    <circle cx={x - g + 1} cy={y + 1} r={d} fill={p.k} />
    <circle cx={x + g + 1} cy={y + 1} r={d} fill={p.k} />
  </g>
);

const Cloak = ({ p, hem = true }: { p: Pal; hem?: boolean }) => (
  <path
    d={hem
      ? 'M60 74C44 74 36 92 33 126L42 130L50 126L60 131L70 126L78 130L87 126C84 92 76 74 60 74Z'
      : 'M60 74C44 74 36 92 33 128Q60 134 87 128C84 92 76 74 60 74Z'}
    fill={p.b}
    {...st(p.o)}
  />
);

const Hand = ({ x, y, p }: { x: number; y: number; p: Pal }) => (
  <circle cx={x} cy={y} r={5.5} fill={p.b2} {...st(p.o, 2.5)} />
);

const Whiskers = ({ p, y = 62 }: { p: Pal; y?: number }) => (
  <g {...st(p.o, 1.8)} fill="none">
    <path d={`M36 ${y}L22 ${y - 4}M36 ${y + 4}L22 ${y + 6}`} />
    <path d={`M84 ${y}L98 ${y - 4}M84 ${y + 4}L98 ${y + 6}`} />
  </g>
);

const Star = ({ cx, cy, r, fill, stroke }: { cx: number; cy: number; r: number; fill: string; stroke: string }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + Math.cos(ang) * rr).toFixed(1)},${(cy + Math.sin(ang) * rr).toFixed(1)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} {...st(stroke, 1.8)} />;
};

const Teeth = ({ p, x = 60, y = 70, n = 5, w = 3.2, h = 6 }: { p: Pal; x?: number; y?: number; n?: number; w?: number; h?: number }) => (
  <g fill={p.w} {...st(p.k, 1.4)}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x - (n * w) / 2 + i * w} y={y} width={w} height={h} rx={0.8} />
    ))}
  </g>
);

const art: Record<RoleId, (p: Pal) => ReactNode> = {
  /* ---------- CIDADE ---------- */
  xerife: (p) => (
    <g>
      <Cloak p={p} />
      <Star cx={60} cy={96} r={9} fill={p.a2} stroke={p.o} />
      <path d="M36 42L37 14L55 31Z" fill={p.b} {...st(p.o)} />
      <path d="M84 42L83 14L65 31Z" fill={p.b} {...st(p.o)} />
      <ellipse cx={60} cy={57} rx={27} ry={24} fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={56} />
      <path d="M57 63L63 63L60 67Z" fill={p.a2} />
      <path d="M52 70Q56 74 60 70Q64 74 68 70" fill="none" {...st(p.o, 2)} />
      <Whiskers p={p} />
      <path d="M26 40Q60 28 94 40Q60 50 26 40Z" fill={p.a} {...st(p.o)} />
      <path d="M42 38Q42 12 60 14Q78 12 78 38Z" fill={p.a} {...st(p.o)} />
      <path d="M43 32Q60 38 77 32" fill="none" stroke={p.a2} strokeWidth={3} />
      <Star cx={60} cy={24} r={5.5} fill={p.a2} stroke={p.o} />
    </g>
  ),
  investigador: (p) => (
    <g>
      <Cloak p={p} />
      <ellipse cx={44} cy={22} rx={8} ry={21} transform="rotate(-8 44 22)" fill={p.b} {...st(p.o)} />
      <ellipse cx={76} cy={22} rx={8} ry={21} transform="rotate(8 76 22)" fill={p.b} {...st(p.o)} />
      <ellipse cx={44} cy={24} rx={3.5} ry={13} transform="rotate(-8 44 24)" fill={p.a} />
      <ellipse cx={76} cy={24} rx={3.5} ry={13} transform="rotate(8 76 24)" fill={p.a} />
      <ellipse cx={60} cy={58} rx={26} ry={23} fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={55} />
      <path d="M57 63L63 63L60 67Z" fill={p.a2} />
      <path d="M60 67L60 71M55 72Q60 76 65 72" fill="none" {...st(p.o, 2)} />
      <rect x={56} y={71} width={4} height={6} rx={1} fill={p.w} {...st(p.k, 1.2)} />
      <rect x={60.5} y={71} width={4} height={6} rx={1} fill={p.w} {...st(p.k, 1.2)} />
      <path d="M80 94L90 108" {...st(p.o, 4)} />
      <circle cx={92} cy={92} r={13} fill="rgba(143,208,238,.18)" {...st(p.o, 4)} />
      <path d="M86 87Q89 83 94 84" fill="none" stroke={p.a2} strokeWidth={2.5} strokeLinecap="round" />
      <Hand x={80} y={96} p={p} />
    </g>
  ),
  legista: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M40 80L46 90L52 80L60 92L68 80L74 90L80 80" fill="none" {...st(p.o, 2.5)} />
      <path d="M48 36L52 20L57 34L62 16L66 34L72 22L72 38" fill={p.b} {...st(p.o, 2.5)} />
      <circle cx={60} cy={56} r={25} fill={p.b} {...st(p.o)} />
      <circle cx={49} cy={54} r={9} fill={p.w} {...st(p.o, 2.5)} />
      <circle cx={71} cy={54} r={9} fill={p.w} {...st(p.o, 2.5)} />
      <path d="M58 54L62 54" {...st(p.o, 2.5)} />
      <circle cx={50} cy={55} r={3} fill={p.k} />
      <circle cx={72} cy={55} r={3} fill={p.k} />
      <path d="M52 62L68 62L60 80Z" fill={p.a} {...st(p.o)} />
      <path d="M60 64L60 76" stroke={p.a2} strokeWidth={1.8} />
      <g transform="rotate(32 92 98)">
        <rect x={80} y={94} width={24} height={7} rx={3.5} fill={p.w} {...st(p.o, 2.5)} />
        <circle cx={80} cy={93} r={4.5} fill={p.w} {...st(p.o, 2.2)} />
        <circle cx={80} cy={102} r={4.5} fill={p.w} {...st(p.o, 2.2)} />
        <circle cx={104} cy={93} r={4.5} fill={p.w} {...st(p.o, 2.2)} />
        <circle cx={104} cy={102} r={4.5} fill={p.w} {...st(p.o, 2.2)} />
      </g>
      <Hand x={84} y={100} p={p} />
    </g>
  ),
  doutor: (p) => (
    <g>
      <path d="M44 62C39 90 37 112 41 128Q60 134 79 128C83 112 81 90 76 62Z" fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={88} g={9} r={5.5} d={2.3} />
      <path d="M53 99Q60 106 67 99" fill="none" {...st(p.o, 2.2)} />
      <path d="M24 64C22 28 98 28 96 64Q60 74 24 64Z" fill={p.a} {...st(p.o)} />
      <circle cx={38} cy={50} r={4.5} fill={p.w} />
      <circle cx={80} cy={46} r={3.5} fill={p.w} />
      <circle cx={70} cy={38} r={2.8} fill={p.w} />
      <path d="M60 36L60 56M50 46L70 46" {...st(p.w, 7)} />
      <path d="M60 36L60 56M50 46L70 46" {...st(p.a2, 3.5)} />
      <path d="M44 110L28 100" {...st(p.o, 4)} />
      <path d="M76 110L92 100" {...st(p.o, 4)} />
      <circle cx={92} cy={98} r={5.5} fill={p.b2} {...st(p.o, 2.5)} />
      <path d="M90 90L98 82" {...st(p.a2, 2.5)} />
      <rect x={94} y={78} width={8} height={5} rx={1.5} transform="rotate(-40 98 80)" fill={p.w} {...st(p.o, 1.8)} />
    </g>
  ),
  guarda_costas: (p) => (
    <g>
      <Cloak p={p} hem={false} />
      <circle cx={38} cy={36} r={10} fill={p.b} {...st(p.o)} />
      <circle cx={82} cy={36} r={10} fill={p.b} {...st(p.o)} />
      <circle cx={38} cy={36} r={4.5} fill={p.a} />
      <circle cx={82} cy={36} r={4.5} fill={p.a} />
      <ellipse cx={60} cy={56} rx={28} ry={24} fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={52} g={11} />
      <ellipse cx={60} cy={65} rx={11} ry={8} fill={p.b2} {...st(p.o, 2.2)} />
      <ellipse cx={60} cy={62} rx={4.5} ry={3} fill={p.a2} />
      <path d="M60 65L60 69M55 70Q60 73 65 70" fill="none" {...st(p.o, 2)} />
      <path d="M36 88L84 88L84 108Q84 124 60 133Q36 124 36 108Z" fill={p.a} {...st(p.o)} />
      <path d="M60 90L60 130M38 104L82 104" {...st(p.a2, 3)} />
      <circle cx={60} cy={104} r={5} fill={p.w} {...st(p.o, 2)} />
    </g>
  ),
  carcereiro: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M32 62C32 44 88 44 88 62C88 78 74 82 60 82C46 82 32 78 32 62Z" fill={p.b} {...st(p.o)} />
      <circle cx={42} cy={44} r={11} fill={p.b} {...st(p.o)} />
      <circle cx={78} cy={44} r={11} fill={p.b} {...st(p.o)} />
      <circle cx={42} cy={44} r={7} fill={p.w} />
      <circle cx={78} cy={44} r={7} fill={p.w} />
      <circle cx={43} cy={45} r={3} fill={p.k} />
      <circle cx={79} cy={45} r={3} fill={p.k} />
      <path d="M40 68Q60 82 80 68" fill="none" {...st(p.o, 2.5)} />
      <circle cx={55} cy={58} r={1.6} fill={p.o} />
      <circle cx={65} cy={58} r={1.6} fill={p.o} />
      <g transform="rotate(-24 92 100)">
        <circle cx={92} cy={84} r={9} fill="none" {...st(p.o, 4)} />
        <path d="M92 93L92 122M92 110L100 110M92 118L100 118" {...st(p.o, 4)} />
      </g>
      <path d="M30 98q-6 4 -2 10t8 2q6 -4 2 -10" fill="none" {...st(p.a2, 3)} />
      <Hand x={80} y={100} p={p} />
    </g>
  ),
  justiceiro: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M34 50L38 18L54 38L66 38L82 18L86 50Q86 76 60 86Q34 76 34 50Z" fill={p.b} {...st(p.o)} />
      <path d="M46 68Q60 58 74 68Q70 82 60 84Q50 82 46 68Z" fill={p.w} {...st(p.o, 2)} />
      <ellipse cx={60} cy={69} rx={4.5} ry={3.2} fill={p.k} />
      <path d="M35 50Q60 40 85 50L83 60Q60 52 37 60Z" fill={p.k} {...st(p.o, 2.5)} />
      <path d="M44 53L54 53L52 57L45 57Z" fill={p.w} />
      <path d="M66 53L76 53L75 57L68 57Z" fill={p.w} />
      <path d="M82 96L100 92L103 99L90 102L88 112L80 110Z" fill={p.a} {...st(p.o, 2.5)} />
      <rect x={96} y={90.5} width={12} height={4.5} rx={1.5} transform="rotate(-10 100 92)" fill={p.a2} {...st(p.o, 2)} />
      <Hand x={82} y={102} p={p} />
    </g>
  ),
  prefeito: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M40 82L82 126" {...st(p.a, 9)} />
      <path d="M40 82L82 126" {...st(p.a2, 2)} />
      <circle cx={58} cy={100} r={6} fill={p.a2} {...st(p.o, 2.2)} />
      <path d="M36 50L30 36Q40 30 48 38Z" fill={p.b} {...st(p.o)} />
      <path d="M84 50L90 36Q80 30 72 38Z" fill={p.b} {...st(p.o)} />
      <ellipse cx={60} cy={58} rx={27} ry={24} fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={54} />
      <ellipse cx={60} cy={67} rx={12} ry={8.5} fill={p.a} {...st(p.o, 2.2)} />
      <ellipse cx={55.5} cy={67} rx={2} ry={3} fill={p.k} />
      <ellipse cx={64.5} cy={67} rx={2} ry={3} fill={p.k} />
      <path d="M40 34L43 6L77 6L80 34Z" fill={p.b2} {...st(p.o)} />
      <ellipse cx={60} cy={34} rx={26} ry={5.5} fill={p.b2} {...st(p.o)} />
      <path d="M42 28Q60 33 78 28" fill="none" {...st(p.a2, 4)} />
    </g>
  ),
  marechal: (p) => (
    <g>
      <Cloak p={p} />
      <circle cx={48} cy={96} r={4.5} fill={p.a2} {...st(p.o, 2)} />
      <circle cx={60} cy={98} r={4.5} fill={p.a} {...st(p.o, 2)} />
      <circle cx={72} cy={96} r={4.5} fill={p.a2} {...st(p.o, 2)} />
      <path d="M48 86L48 91M60 88L60 93M72 86L72 91" {...st(p.o, 2)} />
      <ellipse cx={35} cy={60} rx={9} ry={19} transform="rotate(12 35 60)" fill={p.b2} {...st(p.o)} />
      <ellipse cx={85} cy={60} rx={9} ry={19} transform="rotate(-12 85 60)" fill={p.b2} {...st(p.o)} />
      <ellipse cx={60} cy={58} rx={25} ry={23} fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={56} />
      <ellipse cx={60} cy={68} rx={10} ry={7.5} fill={p.b2} {...st(p.o, 2)} />
      <ellipse cx={60} cy={65} rx={4.5} ry={3.2} fill={p.k} />
      <path d="M54 74Q60 80 66 74" fill={p.a} {...st(p.o, 2)} />
      <path d="M36 42Q60 14 84 42L84 46L36 46Z" fill={p.a} {...st(p.o)} />
      <path d="M32 46Q60 38 88 46Q60 56 32 46Z" fill={p.k} {...st(p.o)} />
      <Star cx={60} cy={34} r={6} fill={p.a2} stroke={p.o} />
    </g>
  ),
  medium: (p) => (
    <g>
      <path d="M31 128L31 62C31 26 89 26 89 62L89 128Q81 120 75 128Q67 120 60 128Q53 120 45 128Q37 120 31 128Z" fill={p.b2} {...st(p.o)} />
      <ellipse cx={47} cy={64} rx={7} ry={10} fill={p.w} />
      <ellipse cx={73} cy={64} rx={7} ry={10} fill={p.w} />
      <ellipse cx={47} cy={67} rx={3} ry={5} fill={p.k} />
      <ellipse cx={73} cy={67} rx={3} ry={5} fill={p.k} />
      <path d="M60 36Q68 44 60 52Q52 44 60 36Z" fill={p.a2} {...st(p.o, 2)} />
      <circle cx={60} cy={44} r={2} fill={p.k} />
      <ellipse cx={60} cy={82} rx={5} ry={7} fill={p.k} {...st(p.o, 2)} />
      <circle cx={60} cy={108} r={15} fill="rgba(143,208,238,.2)" {...st(p.o, 3.5)} />
      <path d="M50 102Q53 96 60 95" fill="none" stroke={p.a2} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M50 124L70 124L66 118L54 118Z" fill={p.a} {...st(p.o, 2.5)} />
    </g>
  ),
  retribucionista: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M42 90L50 98L60 88L70 98L78 90M46 104L54 112L60 104L66 112L74 104" fill="none" {...st(p.a, 2.5)} />
      <path d="M33 56L33 22L52 38Z" fill={p.b} {...st(p.o)} />
      <path d="M87 56L87 22L68 38Z" fill={p.b} {...st(p.o)} />
      <path d="M34 54C34 34 86 34 86 54C86 76 74 84 60 84C46 84 34 76 34 54Z" fill={p.b} {...st(p.o)} />
      <circle cx={47} cy={56} r={12} fill={p.b2} {...st(p.o, 2.5)} />
      <circle cx={73} cy={56} r={12} fill={p.b2} {...st(p.o, 2.5)} />
      <circle cx={47} cy={56} r={8} fill={p.w} />
      <circle cx={73} cy={56} r={8} fill={p.w} />
      <circle cx={48} cy={57} r={3.6} fill={p.k} />
      <circle cx={74} cy={57} r={3.6} fill={p.k} />
      <path d="M56 66L64 66L60 74Z" fill={p.a2} {...st(p.o, 2)} />
      <path d="M84 110L98 82" {...st(p.o, 4)} />
      <Star cx={99} cy={76} r={9} fill={p.a2} stroke={p.o} />
      <path d="M108 66L108 74M104 70L112 70M88 66L88 70M86 68L90 68" fill="none" {...st(p.a2, 2)} />
      <Hand x={84} y={108} p={p} />
    </g>
  ),
  dancarina: (p) => (
    <g>
      <path d="M60 78C28 34 4 70 22 100C32 114 48 104 60 94Z" fill={p.b2} {...st(p.o)} />
      <path d="M60 78C92 34 116 70 98 100C88 114 72 104 60 94Z" fill={p.b2} {...st(p.o)} />
      <circle cx={30} cy={78} r={7} fill={p.a} {...st(p.o, 2)} />
      <circle cx={30} cy={78} r={2.8} fill={p.a2} />
      <circle cx={90} cy={78} r={7} fill={p.a} {...st(p.o, 2)} />
      <circle cx={90} cy={78} r={2.8} fill={p.a2} />
      <path d="M48 96L72 96L84 128L36 128Z" fill={p.a} {...st(p.o)} />
      <path d="M42 120Q60 128 78 120" fill="none" stroke={p.a2} strokeWidth={2.5} />
      <ellipse cx={60} cy={86} rx={9} ry={16} fill={p.b} {...st(p.o)} />
      <path d="M50 40Q40 20 30 22M70 40Q80 20 90 22" fill="none" {...st(p.o, 3)} />
      <path d="M36 25Q30 30 34 34M84 25Q90 30 86 34" fill="none" {...st(p.o, 2)} />
      <circle cx={60} cy={56} r={19} fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={55} g={8} r={5.5} d={2.4} />
      <path d="M54 66Q60 72 66 66" fill="none" {...st(p.o, 2)} />
    </g>
  ),
  convidado: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M60 36C28 30 22 80 40 84C52 88 68 88 80 84C98 80 92 30 60 36Z" fill={p.a} {...st(p.o)} />
      <path d="M60 36C46 38 44 82 52 86M60 36C74 38 76 82 68 86" fill="none" stroke={p.o} strokeWidth={2} opacity={0.7} />
      <path d="M60 36L58 28Q64 26 68 20" fill="none" {...st(p.o, 4)} />
      <path d="M40 56L50 50L50 60Z" fill={p.a2} {...st(p.b, 1.5)} />
      <path d="M80 56L70 50L70 60Z" fill={p.a2} {...st(p.b, 1.5)} />
      <path d="M58 62L62 62L60 67Z" fill={p.a2} />
      <path d="M44 70L49 76L54 71L60 77L66 71L71 76L76 70" fill="none" {...st(p.k, 3)} />
      <path d="M38 38L50 22L62 38Z" transform="rotate(-18 50 30)" fill={p.w} {...st(p.o, 2.5)} />
      <circle cx={46} cy={20} r={4} fill={p.a2} {...st(p.o, 2)} />
    </g>
  ),

  /* ---------- MÁFIA ---------- */
  chefao: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M48 78L60 100L72 78" fill={p.w} {...st(p.o, 2.5)} />
      <path d="M40 80L58 104L50 128M80 80L62 104L70 128" fill="none" {...st(p.o, 2.5)} />
      <path d="M57 90L63 90L64 104L60 110L56 104Z" fill={p.a} {...st(p.o, 2)} />
      <path d="M36 46L38 18L55 34Z" fill={p.b2} {...st(p.o)} />
      <path d="M84 46L82 18L65 34Z" fill={p.b2} {...st(p.o)} />
      <ellipse cx={60} cy={58} rx={26} ry={24} fill={p.b2} {...st(p.o)} />
      <ellipse cx={48} cy={55} rx={8.5} ry={10} fill={p.k} {...st(p.o, 2)} />
      <ellipse cx={72} cy={55} rx={8.5} ry={10} fill={p.k} {...st(p.o, 2)} />
      <circle cx={50} cy={52} r={2.4} fill={p.w} />
      <circle cx={74} cy={52} r={2.4} fill={p.w} />
      <path d="M56 65L64 65L60 71Z" fill={p.k} {...st(p.o, 1.8)} />
      <Teeth p={p} y={74} n={6} w={3.6} h={7} />
      <path d="M44 68L40 72M76 68L80 72M60 33L58 42L62 46" fill="none" stroke={p.o} strokeWidth={1.6} />
      <ellipse cx={60} cy={36} rx={30} ry={7} fill={p.k} {...st(p.o)} />
      <path d="M42 34Q42 12 54 14Q60 20 66 14Q78 12 78 34Z" fill={p.k} {...st(p.o)} />
      <path d="M43 30Q60 37 77 30" fill="none" {...st(p.a, 4.5)} />
    </g>
  ),
  mafioso: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M48 78L60 98L72 78" fill={p.w} {...st(p.o, 2.5)} />
      <circle cx={32} cy={42} r={14} fill={p.b} {...st(p.o)} />
      <circle cx={88} cy={42} r={14} fill={p.b} {...st(p.o)} />
      <circle cx={32} cy={42} r={7.5} fill={p.a} />
      <circle cx={88} cy={42} r={7.5} fill={p.a} />
      <path d="M36 56C36 38 84 38 84 56C84 70 72 80 60 84C48 80 36 70 36 56Z" fill={p.b} {...st(p.o)} />
      <Eyes p={p} y={56} g={9} r={5.5} />
      <circle cx={60} cy={77} r={4} fill={p.a2} {...st(p.o, 1.8)} />
      <rect x={55.5} y={79} width={4.5} height={7} rx={1.2} fill={p.w} {...st(p.k, 1.2)} />
      <rect x={60.5} y={79} width={4.5} height={7} rx={1.2} fill={p.w} {...st(p.k, 1.2)} />
      <Whiskers p={p} y={72} />
      <path d="M38 40Q60 22 82 40L84 44Q60 38 36 44Z" fill={p.a} {...st(p.o)} />
      <path d="M34 44Q60 36 86 44Q86 48 60 46Q34 48 34 44Z" fill={p.k} {...st(p.o, 2)} />
      <path d="M86 112L96 88L102 90L94 114Z" fill={p.w} {...st(p.o, 2.5)} />
      <path d="M84 112L96 116L94 120L82 116Z" fill={p.a} {...st(p.o, 2.5)} />
      <Hand x={86} y={112} p={p} />
    </g>
  ),
  chantagista: (p) => (
    <g>
      <path d="M40 84C14 98 34 112 58 108C84 104 100 120 72 128" fill="none" {...st(p.o, 22)} />
      <path d="M40 84C14 98 34 112 58 108C84 104 100 120 72 128" fill="none" stroke={p.b} strokeWidth={15} strokeLinecap="round" />
      <path d="M40 84C14 98 34 112 58 108C84 104 100 120 72 128" fill="none" stroke={p.a} strokeWidth={2.5} strokeDasharray="2 9" strokeLinecap="round" />
      <path d="M36 62C36 30 84 30 84 62Q84 84 60 90Q36 84 36 62Z" fill={p.b} {...st(p.o)} />
      <path d="M60 46L60 84" stroke={p.a} strokeWidth={2} />
      <path d="M44 56L52 52L52 60Z M76 56L68 52L68 60Z" fill={p.w} {...st(p.o, 1.5)} />
      <path d="M52 76Q60 82 68 76" fill="none" {...st(p.o, 2.2)} />
      <path d="M60 80L60 92M60 92L55 98M60 92L65 98" fill="none" {...st(p.a2, 2.4)} />
      <rect x={80} y={90} width={24} height={17} rx={2} fill={p.w} {...st(p.o, 2.5)} />
      <path d="M80 91L92 101L104 91" fill="none" {...st(p.o, 2.2)} />
      <circle cx={92} cy={101} r={3.2} fill={p.a} />
    </g>
  ),
  conselheiro: (p) => (
    <g>
      <path d="M44 78L8 98Q16 100 18 110Q28 104 32 114Q40 108 44 120Z" fill={p.b2} {...st(p.o)} />
      <path d="M76 78L112 98Q104 100 102 110Q92 104 88 114Q80 108 76 120Z" fill={p.b2} {...st(p.o)} />
      <path d="M60 74C48 74 42 92 42 126L48 130L54 126L60 131L66 126L72 130L78 126C78 92 72 74 60 74Z" fill={p.b} {...st(p.o)} />
      <path d="M56 84L64 84L66 100L60 108L54 100Z" fill={p.a} {...st(p.o, 2)} />
      <path d="M36 46L30 10L54 32Z" fill={p.b} {...st(p.o)} />
      <path d="M84 46L90 10L66 32Z" fill={p.b} {...st(p.o)} />
      <path d="M37 40L35 20L48 32Z M83 40L85 20L72 32Z" fill={p.a} />
      <circle cx={60} cy={58} r={24} fill={p.b} {...st(p.o)} />
      <circle cx={49} cy={55} r={8} fill={p.w} {...st(p.o, 2.5)} />
      <circle cx={71} cy={55} r={8} fill={p.w} {...st(p.o, 2.5)} />
      <path d="M57 55L63 55" {...st(p.o, 2.5)} />
      <circle cx={50} cy={56} r={3} fill={p.k} />
      <circle cx={72} cy={56} r={3} fill={p.k} />
      <path d="M52 68Q60 74 68 68" fill="none" {...st(p.o, 2.2)} />
      <path d="M54 69L56 75L58 69M62 69L64 75L66 69" fill={p.w} {...st(p.k, 1.2)} />
    </g>
  ),
  consorte: (p) => (
    <g>
      <g {...st(p.o, 3)} fill="none">
        <path d="M44 88L16 72L8 86M42 98L14 98L8 114M44 108L18 122L16 134M46 78L22 54L10 60" />
        <path d="M76 88L104 72L112 86M78 98L106 98L112 114M76 108L102 122L104 134M74 78L98 54L110 60" />
      </g>
      <ellipse cx={60} cy={104} rx={25} ry={24} fill={p.b} {...st(p.o)} />
      <path d="M52 94L68 94L60 104L68 116L52 116L60 104Z" fill={p.a} {...st(p.o, 2)} />
      <circle cx={60} cy={60} r={19} fill={p.b} {...st(p.o)} />
      <circle cx={52} cy={56} r={6.5} fill={p.w} />
      <circle cx={68} cy={56} r={6.5} fill={p.w} />
      <circle cx={53} cy={57} r={2.6} fill={p.k} />
      <circle cx={69} cy={57} r={2.6} fill={p.k} />
      <circle cx={43} cy={59} r={2} fill={p.w} />
      <circle cx={77} cy={59} r={2} fill={p.w} />
      <path d="M46 49L42 45M49 47L47 42M74 49L78 45M71 47L73 42" fill="none" {...st(p.o, 1.8)} />
      <path d="M52 68Q60 74 68 68Q60 71 52 68Z" fill={p.a} {...st(p.a2, 2)} />
      <path d="M50 38L38 30L40 44Z M70 38L82 30L80 44Z" fill={p.a} {...st(p.o, 2)} />
      <circle cx={60} cy={39} r={4.2} fill={p.a} {...st(p.o, 2)} />
    </g>
  ),

  /* ---------- NEUTRO BENIGNO ---------- */
  sobrevivente: (p) => (
    <g>
      <ellipse cx={38} cy={126} rx={11} ry={6} fill={p.b2} {...st(p.o, 2.5)} />
      <ellipse cx={82} cy={126} rx={11} ry={6} fill={p.b2} {...st(p.o, 2.5)} />
      <path d="M24 118C20 76 36 62 60 62C84 62 100 76 96 118Q60 130 24 118Z" fill={p.b} {...st(p.o)} />
      <path d="M44 74L60 68L76 74L76 92L60 100L44 92Z M44 92L30 98M76 92L90 98M60 100L60 120" fill="none" {...st(p.o, 2.4)} />
      <path d="M24 104Q60 116 96 104" fill="none" stroke={p.a} strokeWidth={5} />
      <circle cx={60} cy={44} r={21} fill={p.b2} {...st(p.o)} />
      <Eyes p={p} y={42} g={8.5} r={5.5} d={2.4} />
      <path d="M52 54Q60 60 68 54" fill="none" {...st(p.o, 2.2)} />
      <path d="M72 58L82 52M72 52L82 58" {...st(p.w, 5)} />
      <path d="M40 30Q60 10 80 30Q60 24 40 30Z" fill={p.a} {...st(p.o, 2.5)} />
    </g>
  ),
  anjo_da_guarda: (p) => (
    <g>
      <path d="M40 84C14 70 4 98 24 108C32 112 40 106 42 100Z" fill={p.w} {...st(p.o)} />
      <path d="M80 84C106 70 116 98 96 108C88 112 80 106 78 100Z" fill={p.w} {...st(p.o)} />
      <path d="M30 98Q26 104 30 108M20 96Q16 102 20 106" fill="none" stroke={p.o} strokeWidth={1.8} />
      <path d="M34 116C26 96 40 84 52 90C54 80 66 80 68 90C80 84 94 96 86 116C86 126 72 130 60 128C48 130 34 126 34 116Z" fill={p.b2} {...st(p.o)} />
      <ellipse cx={34} cy={60} rx={10} ry={6} transform="rotate(20 34 60)" fill={p.b} {...st(p.o)} />
      <ellipse cx={86} cy={60} rx={10} ry={6} transform="rotate(-20 86 60)" fill={p.b} {...st(p.o)} />
      <path d="M36 52C36 28 84 28 84 52C84 72 74 84 60 86C46 84 36 72 36 52Z" fill={p.b2} {...st(p.o)} />
      <path d="M40 40Q44 28 52 34Q56 24 62 32Q68 24 72 34Q78 28 80 40" fill={p.b2} {...st(p.o, 2.5)} />
      <path d="M42 50C42 42 78 42 78 50C78 72 70 80 60 80C50 80 42 72 42 50Z" fill={p.b} />
      <Eyes p={p} y={60} g={8.5} r={5.5} d={2.5} />
      <path d="M55 70Q60 74 65 70" fill="none" {...st(p.o, 2)} />
      <ellipse cx={60} cy={20} rx={19} ry={6} fill="none" {...st(p.w, 4.5)} />
      <ellipse cx={60} cy={20} rx={19} ry={6} fill="none" stroke={p.o} strokeWidth={1.4} />
    </g>
  ),

  /* ---------- NEUTRO MATADOR ---------- */
  assassino_em_serie: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M46 90L74 90M47 99L73 99M49 108L71 108" fill="none" {...st(p.o, 2.2)} />
      <path d="M60 80L60 118" {...st(p.o, 2.5)} />
      <ellipse cx={44} cy={22} rx={8} ry={21} transform="rotate(-8 44 22)" fill={p.b2} {...st(p.o)} />
      <ellipse cx={76} cy={22} rx={8} ry={21} transform="rotate(8 76 22)" fill={p.b2} {...st(p.o)} />
      <path d="M44 10L47 24L42 34M76 10L73 24L78 34" fill="none" stroke={p.o} strokeWidth={1.6} />
      <path d="M34 56C34 34 86 34 86 56C86 66 80 72 76 76L76 84L44 84L44 76C40 72 34 66 34 56Z" fill={p.b2} {...st(p.o)} />
      <ellipse cx={48} cy={56} rx={9} ry={10.5} fill={p.k} {...st(p.o, 2)} />
      <ellipse cx={72} cy={56} rx={9} ry={10.5} fill={p.k} {...st(p.o, 2)} />
      <circle cx={50} cy={53} r={2.6} fill={p.a2} />
      <circle cx={74} cy={53} r={2.6} fill={p.a2} />
      <path d="M56 67L64 67L60 73Z" fill={p.k} {...st(p.o, 1.8)} />
      <Teeth p={p} y={76} n={6} w={4.4} h={7} />
      <path d="M40 80L36 76M80 80L84 76" {...st(p.o, 1.5)} />
      <path d="M88 108L98 62L104 63L96 109Z" fill={p.w} {...st(p.o, 2.5)} />
      <path d="M86 108L100 112L100 118L84 114Z" fill={p.a} {...st(p.o, 2.5)} />
      <path d="M101 64Q103 72 100 76" fill="none" stroke={p.a2} strokeWidth={1.8} />
      <Hand x={89} y={110} p={p} />
    </g>
  ),
  incendiario: (p) => (
    <g>
      <path d="M60 10C68 34 92 46 90 80C88 112 76 130 60 130C44 130 32 112 30 80C28 52 46 42 52 24C54 18 57 14 60 10Z" fill={p.b} {...st(p.o)} />
      <path d="M60 46C66 62 78 68 76 90C75 106 68 118 60 118C52 118 45 106 44 90C43 74 54 64 60 46Z" fill={p.a} {...st(p.a2, 2)} />
      <circle cx={51} cy={80} r={6.5} fill={p.w} />
      <circle cx={69} cy={80} r={6.5} fill={p.w} />
      <circle cx={52.5} cy={81.5} r={2.6} fill={p.k} />
      <circle cx={70.5} cy={81.5} r={2.6} fill={p.k} />
      <path d="M43 70L56 75M77 70L64 75" {...st(p.k, 2.8)} />
      <path d="M50 94Q60 104 70 94Q60 98 50 94Z" fill={p.k} {...st(p.o, 1.6)} />
      <rect x={88} y={96} width={14} height={10} rx={1.5} fill={p.w} {...st(p.o, 2.2)} />
      <path d="M88 101L102 101" stroke={p.a} strokeWidth={3} />
      <path d="M96 94L98 84" {...st(p.o, 2.5)} />
      <path d="M98 70C102 76 106 78 104 84C103 88 100 88 98 88C96 88 93 86 94 82C95 78 97 76 98 70Z" fill={p.a2} {...st(p.o, 2)} />
    </g>
  ),

  /* ---------- NEUTRO CAOS ---------- */
  bobo_da_corte: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M60 78L48 100L60 122L72 100Z M60 78L48 100L36 90M60 78L72 100L84 90" fill={p.a} {...st(p.o, 2)} />
      <path d="M38 76L44 86L50 76L56 86L62 76L68 86L74 76L80 86L84 76L74 72L46 72Z" fill={p.w} {...st(p.o, 2)} />
      <circle cx={31} cy={56} r={9} fill={p.b} {...st(p.o)} />
      <circle cx={89} cy={56} r={9} fill={p.b} {...st(p.o)} />
      <circle cx={31} cy={56} r={4} fill={p.a} />
      <circle cx={89} cy={56} r={4} fill={p.a} />
      <ellipse cx={60} cy={58} rx={26} ry={22} fill={p.b} {...st(p.o)} />
      <path d="M46 54C46 46 54 50 60 56C66 50 74 46 74 54C74 66 66 72 60 72C54 72 46 66 46 54Z" fill={p.w} {...st(p.o, 2)} />
      <circle cx={53} cy={56} r={4.6} fill={p.k} />
      <circle cx={67} cy={56} r={4.6} fill={p.k} />
      <circle cx={54} cy={54.6} r={1.5} fill={p.w} />
      <circle cx={68} cy={54.6} r={1.5} fill={p.w} />
      <path d="M52 64Q60 72 68 64" fill={p.k} {...st(p.o, 2)} />
      <path d="M36 42C20 40 14 26 16 16C26 22 34 22 46 34Z" fill={p.a} {...st(p.o)} />
      <path d="M84 42C100 40 106 26 104 16C94 22 86 22 74 34Z" fill={p.a2} {...st(p.o)} />
      <path d="M36 44Q60 24 84 44Q60 38 36 44Z" fill={p.a} {...st(p.o)} />
      <circle cx={16} cy={14} r={4.5} fill={p.w} {...st(p.o, 2)} />
      <circle cx={104} cy={14} r={4.5} fill={p.w} {...st(p.o, 2)} />
      <circle cx={60} cy={28} r={4.5} fill={p.w} {...st(p.o, 2)} />
    </g>
  ),
  carrasco: (p) => (
    <g>
      <Cloak p={p} />
      <path d="M42 80L48 104L54 80M66 80L72 104L78 80" fill="none" {...st(p.a, 3)} />
      <path d="M40 40C24 40 18 22 28 10C30 22 38 26 46 30Z" fill={p.w} {...st(p.o, 2.5)} />
      <path d="M80 40C96 40 102 22 92 10C90 22 82 26 74 30Z" fill={p.w} {...st(p.o, 2.5)} />
      <path d="M40 44C40 28 80 28 80 44L80 60Q80 76 60 84Q40 76 40 60Z" fill={p.b} {...st(p.o)} />
      <path d="M40 44C40 28 80 28 80 44L80 52Q60 44 40 52Z" fill={p.k} {...st(p.o, 2)} />
      <rect x={43} y={51} width={12} height={7} rx={3.5} fill={p.w} />
      <rect x={65} y={51} width={12} height={7} rx={3.5} fill={p.w} />
      <rect x={47} y={52.5} width={5} height={4} rx={1.5} fill={p.k} />
      <rect x={69} y={52.5} width={5} height={4} rx={1.5} fill={p.k} />
      <path d="M56 68L64 68M58 72L62 72" {...st(p.o, 2)} />
      <path d="M52 82L60 98L68 82Q60 88 52 82Z" fill={p.w} {...st(p.o, 2)} />
      <path d="M92 70L82 122" {...st(p.o, 4)} />
      <path d="M92 72C112 68 114 92 92 94C98 88 98 78 92 72Z" fill={p.w} {...st(p.o, 2.5)} />
      <Hand x={84} y={108} p={p} />
    </g>
  ),
  pirata: (p) => (
    <g>
      <path d="M28 106C14 112 18 128 32 124M92 106C106 112 102 128 88 124M44 118C40 130 52 134 54 124M76 118C80 130 68 134 66 124" fill="none" {...st(p.o, 7)} />
      <path d="M28 106C14 112 18 128 32 124M92 106C106 112 102 128 88 124M44 118C40 130 52 134 54 124M76 118C80 130 68 134 66 124" fill="none" stroke={p.b} strokeWidth={3} strokeLinecap="round" />
      <path d="M30 96C26 52 94 52 90 96C90 110 80 116 60 116C40 116 30 110 30 96Z" fill={p.b} {...st(p.o)} />
      <path d="M34 66C32 44 88 44 86 66Q60 56 34 66Z" fill={p.b} />
      <circle cx={46} cy={78} r={7} fill={p.w} />
      <circle cx={47} cy={79} r={3} fill={p.k} />
      <path d="M62 70L84 90" {...st(p.k, 3.5)} />
      <ellipse cx={72} cy={80} rx={8} ry={7.5} fill={p.k} {...st(p.o, 2.2)} />
      <path d="M44 94Q55 102 66 94" fill="none" {...st(p.o, 2.4)} />
      <path d="M26 50L40 24Q60 30 80 24L94 50Q60 44 26 50Z" fill={p.k} {...st(p.o)} />
      <path d="M28 50Q60 42 92 50" fill="none" stroke={p.a} strokeWidth={3.5} />
      <circle cx={60} cy={36} r={5} fill={p.w} />
      <path d="M56 40L64 40M57 38L57 36M63 38L63 36" stroke={p.k} strokeWidth={1.6} />
      <path d="M100 112L100 74" {...st(p.o, 4)} />
      <path d="M100 74C112 62 112 52 106 46C106 56 100 62 100 74Z" fill={p.w} {...st(p.o, 2.2)} />
      <path d="M94 108L106 108" {...st(p.a, 3.5)} />
    </g>
  ),
};

export function RoleCharacter({
  roleId,
  faction,
  className,
  title,
  ground = true,
}: {
  roleId: RoleId;
  faction: Faction;
  className?: string;
  title?: string;
  ground?: boolean;
}) {
  const p = FACTION_PAL[faction];
  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {ground && <ellipse cx={60} cy={133} rx={32} ry={4.2} fill="#000" opacity={0.45} />}
      {art[roleId](p)}
    </svg>
  );
}
