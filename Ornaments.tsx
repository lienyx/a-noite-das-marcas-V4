/* Ornamentos de apoio: caveira, corvo, bandeira, fita, dado, morcego, pentagrama e a marca do jogo. */
const ICE = '#8FD0EE';
const BONE = '#F4F1FA';
const INK = '#090C13';
const BLOOD = '#E23B4E';

const line = (c: string, w = 3) => ({
  stroke: c,
  strokeWidth: w,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
});

export function Skull({ className, tint = BONE }: { className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 6C17 6 9 16 9 28C9 36 13 41 18 44L18 54L26 54L26 50L30 54L34 54L38 50L38 54L46 54L46 44C51 41 55 36 55 28C55 16 47 6 32 6Z" fill={tint} {...line(INK, 3)} />
      <ellipse cx={22} cy={31} rx={7} ry={8} fill={INK} />
      <ellipse cx={42} cy={31} rx={7} ry={8} fill={INK} />
      <path d="M32 38L28 46L36 46Z" fill={INK} />
      <path d="M26 54L26 48M32 54L32 48M38 54L38 48" {...line(INK, 2)} />
    </svg>
  );
}

export function Raven({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 120" className={className} aria-hidden="true">
      <path d="M96 30C96 14 82 6 68 10C56 14 52 24 52 32L26 40L50 48C50 56 54 62 60 66C48 74 38 92 34 112L60 100L68 114L78 100C100 96 124 74 126 56C126 40 108 32 96 30Z" fill={INK} {...line(ICE, 3)} />
      <path d="M52 32L24 40L52 46Z" fill={ICE} {...line(INK, 2)} />
      <circle cx={70} cy={26} r={5} fill={BONE} />
      <circle cx={71} cy={27} r={2} fill={INK} />
      <path d="M70 60C84 62 108 56 120 52M66 72C80 76 100 72 112 66" fill="none" {...line(ICE, 2)} opacity={0.65} />
      <path d="M60 114L58 124M70 114L72 124" {...line(ICE, 3)} />
    </svg>
  );
}

export function Bat({ className, tint = BONE }: { className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <path d="M60 22L66 14L68 26C78 20 96 18 112 26C106 32 104 40 106 50C98 44 90 46 86 54C80 48 72 50 68 58L60 70L52 58C48 50 40 48 34 54C30 46 22 44 14 50C16 40 14 32 8 26C24 18 42 20 52 26L54 14Z" fill={tint} {...line(INK, 3)} />
      <circle cx={54} cy={34} r={3.4} fill={INK} />
      <circle cx={66} cy={34} r={3.4} fill={INK} />
      <path d="M56 44L58 49L60 44L62 49L64 44" fill="none" {...line(INK, 1.6)} />
    </svg>
  );
}

export function Pentagram({ className, color = INK, ring = true }: { className?: string; color?: string; ring?: boolean }) {
  const pts = [0, 2, 4, 1, 3, 0]
    .map((i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return `${(50 + Math.cos(a) * 36).toFixed(1)},${(50 + Math.sin(a) * 36).toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {ring && <circle cx={50} cy={50} r={40} fill="none" stroke={color} strokeWidth={4} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
}

/** A bandeira com pentagrama pendurada num mastro de ossos (referência do pacote de stream). */
export function Banner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 150" className={className} aria-hidden="true">
      <path d="M10 18L80 18" {...line(ICE, 4)} />
      <circle cx={10} cy={18} r={4} fill={BONE} {...line(INK, 2)} />
      <circle cx={80} cy={18} r={4} fill={BONE} {...line(INK, 2)} />
      <path d="M16 20L74 20L74 98L45 112L16 98Z" fill={BONE} {...line(INK, 3)} />
      <g transform="translate(25 34) scale(0.4)">
        <circle cx={50} cy={50} r={40} fill="none" stroke={INK} strokeWidth={7} />
        <polyline points="50,14 78.5,84.5 18.5,38 81.5,38 21.5,84.5 50,14" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g>
      <path d="M45 112L45 146" {...line(ICE, 4)} />
    </svg>
  );
}

export function Ribbon({ className, label }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 220 56" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d="M2 14L28 14L28 46L2 46L14 30Z" fill="#8E1B33" {...line(INK, 3)} />
      <path d="M218 14L192 14L192 46L218 46L206 30Z" fill="#8E1B33" {...line(INK, 3)} />
      <path d="M22 8L198 8L198 40L22 40Z" fill={BLOOD} {...line(INK, 3)} />
      <path d="M22 40L34 50L34 40Z M198 40L186 50L186 40Z" fill="#8E1B33" {...line(INK, 2.5)} />
    </svg>
  );
}

export function D20({ className, tint = ICE }: { className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 4L56 18L56 46L32 60L8 46L8 18Z" fill={INK} {...line(tint, 3)} />
      <path d="M32 18L46 42L18 42Z" fill="none" {...line(tint, 2.5)} />
      <path d="M32 4L32 18M56 18L46 42M8 18L18 42M18 42L32 60M46 42L32 60M32 18L56 18M32 18L8 18" fill="none" {...line(tint, 2)} opacity={0.8} />
    </svg>
  );
}

export function Drips({ className, color = ICE }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 40" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0 0L200 0L200 8C196 8 196 30 190 30C184 30 186 10 178 10C170 10 172 22 166 22C160 22 162 8 150 8C140 8 144 36 134 36C126 36 130 12 118 12C108 12 112 26 104 26C96 26 100 8 86 8C74 8 80 20 70 20C62 20 64 6 52 6C42 6 46 32 36 32C28 32 32 10 20 10C12 10 14 22 6 22C2 22 2 8 0 8Z" fill={color} />
    </svg>
  );
}

/** Marca do jogo: caveira com o "selo" riscado na testa. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="42" height="46" viewBox="0 0 64 70" fill="none" aria-hidden="true">
      <path d="M32 6C17 6 9 16 9 28C9 36 13 41 18 44L18 54L26 54L26 50L30 54L34 54L38 50L38 54L46 54L46 44C51 41 55 36 55 28C55 16 47 6 32 6Z" fill="#F4F1FA" stroke="#090C13" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="22" cy="33" rx="7" ry="8" fill="#090C13" />
      <ellipse cx="42" cy="33" rx="7" ry="8" fill="#090C13" />
      <circle cx="23" cy="31" r="2" fill="#8FD0EE" />
      <circle cx="43" cy="31" r="2" fill="#8FD0EE" />
      <path d="M32 40L28 47L36 47Z" fill="#090C13" />
      <path d="M26 17L38 17M32 12L32 22" stroke="#E23B4E" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M26 54L26 48M32 54L32 48M38 54L38 48" stroke="#090C13" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Moon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx={60} cy={60} r={46} fill="#D5F0FB" />
      <circle cx={44} cy={48} r={8} fill="#B4DCEE" />
      <circle cx={74} cy={72} r={11} fill="#B4DCEE" />
      <circle cx={70} cy={38} r={5} fill="#B4DCEE" />
    </svg>
  );
}
