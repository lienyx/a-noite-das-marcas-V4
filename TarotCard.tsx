import { ROLES, type RoleId } from '../../shared/gameData';
import { CREATURE, FACTION_PAL, ROMAN, RoleCharacter } from './Characters';

/** Carta de tarô de um papel: numeral romano nos cantos, personagem no centro e fita com o nome. */
export function TarotCard({
  roleId,
  size = 'md',
  tilt = 0,
  hideName = false,
}: {
  roleId: RoleId;
  size?: 'sm' | 'md' | 'lg';
  tilt?: number;
  hideName?: boolean;
}) {
  const role = ROLES[roleId];
  const pal = FACTION_PAL[role.faction];
  return (
    <figure
      className={`tarot tarot-${size}`}
      style={{ ['--o' as string]: pal.o, ['--a' as string]: pal.a, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      <span className="tarot-num tarot-num-l">{ROMAN[roleId]}</span>
      <span className="tarot-num tarot-num-r">{ROMAN[roleId]}</span>
      <div className="tarot-art">
        <RoleCharacter roleId={roleId} faction={role.faction} title={`${role.name}: ${CREATURE[roleId]}`} />
      </div>
      {!hideName && (
        <figcaption className="tarot-name">
          <strong className={role.name.length > 14 ? 'is-xlong' : role.name.length > 11 ? 'is-long' : undefined}>{role.name}</strong>
          <span>{CREATURE[roleId]}</span>
        </figcaption>
      )}
    </figure>
  );
}
