import { User } from 'lucide-react';
import { ROLES, type Faction, type RoleId } from '../shared/gameData';
import { RoleCharacter } from './art/Characters';

export function getFactionMeta(faction: Faction): {
  label: string;
  textColor: string;
  borderColor: string;
  bgTint: string;
} {
  switch (faction) {
    case 'CIDADE':
      return {
        label: 'Cidade',
        textColor: 'text-[#8FD0EE]',
        borderColor: 'border-[#8FD0EE]/40',
        bgTint: 'bg-[#8FD0EE]/10',
      };
    case 'MAFIA':
      return {
        label: 'Máfia',
        textColor: 'text-[#FF7A8A]',
        borderColor: 'border-[#E23B4E]/50',
        bgTint: 'bg-[#E23B4E]/12',
      };
    case 'NEUTRO_MATADOR':
      return {
        label: 'Neutro Matador',
        textColor: 'text-[#C4A3FF]',
        borderColor: 'border-[#B58CFF]/45',
        bgTint: 'bg-[#B58CFF]/12',
      };
    case 'NEUTRO_CAOS':
      return {
        label: 'Neutro Caos',
        textColor: 'text-[#FF9DCF]',
        borderColor: 'border-[#FF8AC4]/45',
        bgTint: 'bg-[#FF8AC4]/12',
      };
    case 'NEUTRO_BENIGNO':
      return {
        label: 'Neutro Benigno',
        textColor: 'text-[#EDEAF4]',
        borderColor: 'border-white/25',
        bgTint: 'bg-white/5',
      };
  }
}

/** O personagem do papel (cada papel tem o seu bichinho). Dimensione com `className`, ex.: "w-9 h-10". */
export function RoleIcon({
  roleId,
  className = 'w-9 h-10',
}: {
  roleId: RoleId | null;
  className?: string;
}) {
  if (!roleId) return <User className={className} />;
  return <RoleCharacter roleId={roleId} faction={ROLES[roleId].faction} className={className} ground={false} />;
}
