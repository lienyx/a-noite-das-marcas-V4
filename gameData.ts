export type RoleId =
  | 'xerife'
  | 'investigador'
  | 'legista'
  | 'doutor'
  | 'guarda_costas'
  | 'carcereiro'
  | 'justiceiro'
  | 'prefeito'
  | 'marechal'
  | 'medium'
  | 'retribucionista'
  | 'dancarina'
  | 'convidado'
  | 'chefao'
  | 'mafioso'
  | 'chantagista'
  | 'conselheiro'
  | 'consorte'
  | 'sobrevivente'
  | 'anjo_da_guarda'
  | 'assassino_em_serie'
  | 'incendiario'
  | 'bobo_da_corte'
  | 'carrasco'
  | 'pirata';

export type Faction =
  | 'CIDADE'
  | 'MAFIA'
  | 'NEUTRO_MATADOR'
  | 'NEUTRO_BENIGNO'
  | 'NEUTRO_CAOS';

export type Appearance = 'INOCENTE' | 'SUSPEITO';

export type StickerType =
  | 'red_seal'
  | 'black_seal'
  | 'blue_drop'
  | 'white_amulet'
  | 'gold_shield'
  | 'orange_deco';

export type SlipType =
  | 'match'
  | 'bullet'
  | 'execution'
  | 'silence'
  | 'vest';

export type DeckMode = 'classic' | 'categories' | 'free';

export type KillerPace = 'normal' | 'fast' | 'slow';

export type GamePhase =
  | 'LOBBY'
  | 'NOITE_ZERO'
  | 'CACADA'
  | 'BADALADA'
  | 'DANCA_DOS_SELOS'
  | 'TRIBUNAL'
  | 'FIM_DE_JOGO';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  categoryHeader: string;
  faction: Faction;
  appearance: Appearance;
  groupLabel: string;
  summary: string;
  victoryText: string;
  initialStickers: Partial<Record<StickerType, number>>;
  initialSlips: Partial<Record<SlipType, number>>;
  maxCopies: number;
}

export const ROLES: Record<RoleId, RoleDefinition> = {
  xerife: {
    id: 'xerife',
    name: 'Xerife',
    categoryHeader: 'CIDADE · INVESTIGATIVO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: INVEST.',
    summary:
      'Uma vez por rodada, investigue alguém em segredo e peça a faixa de Aparência (SUSPEITO ou INOCENTE). Cuidado: o Chefão da Máfia sempre aparece como INOCENTE.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  investigador: {
    id: 'investigador',
    name: 'Investigador',
    categoryHeader: 'CIDADE · INVESTIGATIVO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: INVEST.',
    summary:
      'Uma vez por rodada, investigue alguém e descubra o Grupo do papel (ex.: Cidade: Protetor, Máfia: Apoio), mas não o papel exato.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  legista: {
    id: 'legista',
    name: 'Legista',
    categoryHeader: 'CIDADE · INVESTIGATIVO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: INVEST.',
    summary:
      'Uma vez por rodada, examine um fantasma que morreu (não vale para presos que já revelaram o pergaminho no Tribunal) para descobrir papel e lado exatos.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  doutor: {
    id: 'doutor',
    name: 'Doutor',
    categoryHeader: 'CIDADE · PROTETOR',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: PROTETOR',
    summary:
      'Tem 6 amuletos brancos. Uma vez por rodada, cole um nas costas de outra pessoa. Na Badalada, quem tiver amuleto se salva de selo e de fogo, e todos os adesivos dela saem.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { white_amulet: 6, orange_deco: 6 },
    initialSlips: {},
    maxCopies: 1,
  },
  guarda_costas: {
    id: 'guarda_costas',
    name: 'Guarda-Costas',
    categoryHeader: 'CIDADE · PROTETOR',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: PROTETOR',
    summary:
      'Tem 4 escudos dourados. Uma vez por rodada, cole um nas costas de alguém. Se essa pessoa for atingida por selo ou fogo na Dança dos Selos, você morre no lugar dela e ela se salva.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { gold_shield: 4, orange_deco: 8 },
    initialSlips: {},
    maxCopies: 1,
  },
  carcereiro: {
    id: 'carcereiro',
    name: 'Carcereiro',
    categoryHeader: 'CIDADE · MATADOR',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: MATADOR',
    summary:
      'Uma vez por rodada, prenda alguém na Masmorra e interrogue anonimamente. Presa, a pessoa perde os poderes até a Badalada. Você tem 1 ficha EXECUÇÃO para usar na Urna.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: { execution: 1 },
    maxCopies: 1,
  },
  justiceiro: {
    id: 'justiceiro',
    name: 'Justiceiro',
    categoryHeader: 'CIDADE · MATADOR',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: MATADOR',
    summary:
      'Tem 1 BALA. Uma vez na noite, escolha um alvo e solte-a na Urna: essa pessoa morre (mesmo com amuleto). Se for da Cidade, você também morre de culpa e é revelado.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: { bullet: 1 },
    maxCopies: 1,
  },
  prefeito: {
    id: 'prefeito',
    name: 'Prefeito',
    categoryHeader: 'CIDADE · APOIO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: APOIO',
    summary:
      'A qualquer momento você pode se REVELAR publicamente a todos. Depois disso, seu voto no Tribunal conta TRIPLO (3x). Cuidado com os assassinos!',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  marechal: {
    id: 'marechal',
    name: 'Marechal',
    categoryHeader: 'CIDADE · APOIO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: APOIO',
    summary:
      'Uma vez por jogo, REVELE-SE a todos. No próximo Tribunal, os dois mais apontados são presos. Depois disso, todos sabem quem você é.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  medium: {
    id: 'medium',
    name: 'Médium',
    categoryHeader: 'CIDADE · APOIO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: APOIO',
    summary:
      'Fantasmas não podem falar sobre o jogo com vivos, mas com você podem! Converse livremente no canal mediúnico (fantasmas só sabem quem você é se você revelar).',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  retribucionista: {
    id: 'retribucionista',
    name: 'Retribucionista',
    categoryHeader: 'CIDADE · APOIO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: APOIO',
    summary:
      'Uma vez por jogo, escolha um fantasma. Se ele era da Cidade, volta à vida na próxima Badalada e retoma o papel. Se não era, nada acontece e você gastou a chance.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  dancarina: {
    id: 'dancarina',
    name: 'Dançarina',
    categoryHeader: 'CIDADE · APOIO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: APOIO',
    summary:
      'Uma vez por rodada, bloqueie alguém até a próxima Badalada: a pessoa perde os poderes (não cola adesivo, não interroga, não solta fichas).',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  convidado: {
    id: 'convidado',
    name: 'Convidado',
    categoryHeader: 'CIDADE · CIDADÃO',
    faction: 'CIDADE',
    appearance: 'INOCENTE',
    groupLabel: 'CIDADE: CIDADÃO',
    summary:
      'Você é um cidadão da Cidade. Observe as costas de todo mundo, desconfie, forme alianças e ajude o Tribunal. Nunca avise alguém que foi marcado.',
    victoryText: 'Vence com a Cidade.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 3,
  },
  chefao: {
    id: 'chefao',
    name: 'Chefão',
    categoryHeader: 'MÁFIA · MATADOR',
    faction: 'MAFIA',
    appearance: 'INOCENTE',
    groupLabel: 'MÁFIA: MATADOR',
    summary:
      'Você lidera a Máfia. Tem 12 selos vermelhos. A Máfia toda cola no máximo 1 selo vermelho por rodada (padrão). O Xerife te vê como INOCENTE.',
    victoryText: 'Vence se os mafiosos vivos forem metade ou mais dos vivos.',
    initialStickers: { red_seal: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  mafioso: {
    id: 'mafioso',
    name: 'Mafioso',
    categoryHeader: 'MÁFIA · MATADOR',
    faction: 'MAFIA',
    appearance: 'SUSPEITO',
    groupLabel: 'MÁFIA: MATADOR',
    summary:
      'Você é o braço da Máfia. Tem 12 selos vermelhos (compartilha o limite de 1 selo vermelho por rodada da Máfia). Se o Chefão cair, você continua.',
    victoryText: 'Vence se os mafiosos vivos forem metade ou mais dos vivos.',
    initialStickers: { red_seal: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  chantagista: {
    id: 'chantagista',
    name: 'Chantagista',
    categoryHeader: 'MÁFIA · APOIO',
    faction: 'MAFIA',
    appearance: 'SUSPEITO',
    groupLabel: 'MÁFIA: APOIO',
    summary:
      'Tem 4 fichas CALE-SE. Uma vez por rodada, envie uma em segredo para alguém: ela não pode falar no próximo Tribunal (só ouve e vota).',
    victoryText: 'Vence com a Máfia (metade ou mais dos vivos).',
    initialStickers: { orange_deco: 12 },
    initialSlips: { silence: 4 },
    maxCopies: 1,
  },
  conselheiro: {
    id: 'conselheiro',
    name: 'Conselheiro',
    categoryHeader: 'MÁFIA · APOIO',
    faction: 'MAFIA',
    appearance: 'SUSPEITO',
    groupLabel: 'MÁFIA: APOIO',
    summary:
      'Uma vez por rodada, investigue alguém em segredo e descubra o papel exato dela.',
    victoryText: 'Vence com a Máfia (metade ou mais dos vivos).',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  consorte: {
    id: 'consorte',
    name: 'Consorte',
    categoryHeader: 'MÁFIA · APOIO',
    faction: 'MAFIA',
    appearance: 'SUSPEITO',
    groupLabel: 'MÁFIA: APOIO',
    summary:
      'Uma vez por rodada, bloqueie alguém até a próxima Badalada: a pessoa perde os poderes do pergaminho (não cola adesivo, não interroga, não solta fichas).',
    victoryText: 'Vence com a Máfia (metade ou mais dos vivos).',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  sobrevivente: {
    id: 'sobrevivente',
    name: 'Sobrevivente',
    categoryHeader: 'NEUTRO · BENIGNO',
    faction: 'NEUTRO_BENIGNO',
    appearance: 'INOCENTE',
    groupLabel: 'NEUTRO: BENIGNO',
    summary:
      'Você só quer viver. Tem 2 fichas COLETE: na Badalada, ative o COLETE para sobreviver a selos e fogo daquela rodada.',
    victoryText: 'Vence se estiver vivo no fim do jogo, não importa quem ganhe.',
    initialStickers: { orange_deco: 12 },
    initialSlips: { vest: 2 },
    maxCopies: 1,
  },
  anjo_da_guarda: {
    id: 'anjo_da_guarda',
    name: 'Anjo da Guarda',
    categoryHeader: 'NEUTRO · BENIGNO',
    faction: 'NEUTRO_BENIGNO',
    appearance: 'INOCENTE',
    groupLabel: 'NEUTRO: BENIGNO',
    summary:
      'Seu protegido é a pessoa à sua DIREITA no círculo do sorteio. Tem 2 amuletos brancos para colocar nas costas dele quando quiser. Se ele morrer, você vira Convidado.',
    victoryText: 'Vence se o protegido estiver vivo no fim do jogo.',
    initialStickers: { white_amulet: 2 },
    initialSlips: {},
    maxCopies: 1,
  },
  assassino_em_serie: {
    id: 'assassino_em_serie',
    name: 'Assassino em Série',
    categoryHeader: 'NEUTRO · MATADOR',
    faction: 'NEUTRO_MATADOR',
    appearance: 'SUSPEITO',
    groupLabel: 'NEUTRO: MATADOR',
    summary:
      'Tem 12 selos negros. Cole 1 selo negro por rodada nas costas de alguém em segredo. O Xerife te vê como SUSPEITO.',
    victoryText: 'Vence se sobrar só você e mais 1 pessoa viva.',
    initialStickers: { black_seal: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  incendiario: {
    id: 'incendiario',
    name: 'Incendiário',
    categoryHeader: 'NEUTRO · MATADOR',
    faction: 'NEUTRO_MATADOR',
    appearance: 'SUSPEITO',
    groupLabel: 'NEUTRO: MATADOR',
    summary:
      'Tem 12 gotas azuis e 3 FÓSFOROS. Cole gotas nas costas de quem quiser (ficam lá se não queimar). Na Badalada, solte um Fósforo na Urna: todos com gota azul queimam e morrem.',
    victoryText: 'Vence se sobrar só você e mais 1 pessoa viva.',
    initialStickers: { blue_drop: 12 },
    initialSlips: { match: 3 },
    maxCopies: 1,
  },
  bobo_da_corte: {
    id: 'bobo_da_corte',
    name: 'Bobo da Corte',
    categoryHeader: 'NEUTRO · CAOS',
    faction: 'NEUTRO_CAOS',
    appearance: 'INOCENTE',
    groupLabel: 'NEUTRO: CAOS',
    summary:
      'Você quer ser PRESO! Aja de forma suspeita e convença a mesa a apontar você no Tribunal. Se for preso, vence sozinho e escolhe 1 dos que votaram em você para virar fantasma.',
    victoryText: 'Vence sozinho se for preso no Tribunal.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  carrasco: {
    id: 'carrasco',
    name: 'Carrasco',
    categoryHeader: 'NEUTRO · CAOS',
    faction: 'NEUTRO_CAOS',
    appearance: 'INOCENTE',
    groupLabel: 'NEUTRO: CAOS',
    summary:
      'Seu alvo é a pessoa à sua ESQUERDA no círculo do sorteio. Convença a mesa a prendê-la no Tribunal! Se ela morrer de outro jeito, você vira Convidado.',
    victoryText: 'Vence sozinho se o alvo for preso no Tribunal.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
  pirata: {
    id: 'pirata',
    name: 'Pirata',
    categoryHeader: 'NEUTRO · CAOS',
    faction: 'NEUTRO_CAOS',
    appearance: 'INOCENTE',
    groupLabel: 'NEUTRO: CAOS',
    summary:
      'Uma vez por rodada, desafie alguém para um duelo de Pedra, Papel e Tesoura (melhor de 3). A pessoa é obrigada a duelar. Vença 2 duelos na noite e você vence sozinho!',
    victoryText: 'Vence sozinho ao conquistar 2 vitórias em duelos.',
    initialStickers: { orange_deco: 12 },
    initialSlips: {},
    maxCopies: 1,
  },
};

export const ALL_ROLE_IDS = Object.keys(ROLES) as RoleId[];

export const SECRET_MISSIONS: string[] = [
  'Faça 3 pessoas diferentes dizerem a palavra "abóbora" em voz alta.',
  'Olhe fixamente nos olhos de alguém por 10 segundos, sem rir, e depois vá embora em silêncio.',
  'Troque de lugar com alguém sem explicar o motivo.',
  'Seja a sombra de alguém: fique 2 minutos atrás da pessoa, sem falar.',
  'Escreva algo num papel ou bloco de notas, olhando em volta, e guarde. Se perguntarem, diga "nada".',
  'Diga a 3 pessoas diferentes: "Sinto cheiro de mentira...".',
  'Fique 5 minutos com as mãos nos bolsos, sem tirar por nada.',
  'Pergunte a 3 pessoas: "Onde você estava às 22h?" e anote as respostas.',
  'Acuse alguém, em voz alta, de algo ridículo ("Você roubou a abóbora!") e depois peça desculpas.',
  'Fique 3 minutos sozinho(a) em outro cômodo e saia com cara de culpado(a).',
  'Sussurre "a lua está cheia" no ouvido de 3 pessoas, e saia sem explicar.',
  'Atravesse a sala andando de costas pelo menos uma vez.',
  'Converse com um copo ou objeto como se fosse seu informante secreto.',
  'Peça a 3 pessoas que mostrem a mão esquerda e diga "Hmm, interessante...".',
  'Mude um objeto pequeno da mesa de lugar e depois diga a alguém que viu um vulto levá-lo.',
  'Use um nome falso numa conversa de 5 minutos e não se corrija.',
  'Peça um abraço a 2 pessoas "só por precaução" (sem espiar telas!).',
  'Aponte para o teto e diga "Vocês ouviram isso?" para 3 grupos diferentes.',
  'Tente fazer alguém jurar que é inocente, com a mão no peito.',
  'Fique 2 minutos parado(a) como estátua num canto, observando todo mundo.',
];

export const NOITE_ZERO_SCRIPT = [
  {
    text: 'Boa noite, convidados. Sentem-se em círculo, fechem os olhos e baixem os celulares sobre o colo. Ninguém espia.',
    delaySec: 8,
  },
  {
    text: 'A Máfia acorda. Mafiosos, abram os olhos devagar, olhem para a tela do celular para reconhecer seus parceiros e entreolhem-se em silêncio.',
    delaySec: 15,
  },
  {
    text: 'Mafiosos, fechem os olhos novamente e escondam o rosto.',
    delaySec: 5,
  },
  {
    text: 'A noite começa. Todos abram os olhos. Que o jogo comece... e que ninguém desça à cripta sozinho.',
    delaySec: 0,
  },
];

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateClassicDeck(playerCount: number): RoleId[] {
  const base13: RoleId[] = [
    'chefao',
    'mafioso',
    'chantagista',
    'assassino_em_serie',
    'bobo_da_corte',
    'carrasco',
    'xerife',
    'legista',
    'doutor',
    'justiceiro',
    'prefeito',
    'medium',
    'dancarina',
  ];

  if (playerCount === 13) return base13;
  if (playerCount === 14) return [...base13, 'convidado'];
  if (playerCount >= 15) {
    const extra = Array.from({ length: playerCount - 13 }, () => 'convidado' as RoleId);
    return [...base13, ...extra];
  }

  // Scaled classic preset for smaller parties (4-12 players) keeping ~60%+ Cidade
  const smallPresets: Record<number, RoleId[]> = {
    4: ['chefao', 'xerife', 'doutor', 'convidado'],
    5: ['chefao', 'xerife', 'doutor', 'bobo_da_corte', 'convidado'],
    6: ['chefao', 'mafioso', 'xerife', 'doutor', 'dancarina', 'convidado'],
    7: ['chefao', 'mafioso', 'xerife', 'doutor', 'justiceiro', 'bobo_da_corte', 'convidado'],
    8: ['chefao', 'mafioso', 'assassino_em_serie', 'xerife', 'doutor', 'legista', 'prefeito', 'convidado'],
    9: ['chefao', 'mafioso', 'chantagista', 'xerife', 'doutor', 'legista', 'justiceiro', 'bobo_da_corte', 'convidado'],
    10: ['chefao', 'mafioso', 'chantagista', 'assassino_em_serie', 'xerife', 'doutor', 'legista', 'justiceiro', 'prefeito', 'convidado'],
    11: ['chefao', 'mafioso', 'chantagista', 'assassino_em_serie', 'bobo_da_corte', 'xerife', 'doutor', 'legista', 'justiceiro', 'prefeito', 'medium'],
    12: ['chefao', 'mafioso', 'chantagista', 'assassino_em_serie', 'bobo_da_corte', 'xerife', 'doutor', 'legista', 'justiceiro', 'prefeito', 'medium', 'dancarina'],
  };

  if (smallPresets[playerCount]) {
    return smallPresets[playerCount];
  }

  // Fallback for < 4 players (testing)
  return base13.slice(0, Math.max(2, playerCount));
}

export function generateCategoriesDeck(playerCount: number): RoleId[] {
  const mafiaSupportPool: RoleId[] = shuffleArray(['chantagista', 'conselheiro', 'consorte']);
  const neutralKillerPool: RoleId[] = shuffleArray(['assassino_em_serie', 'incendiario']);
  const neutralChaosBenignPool: RoleId[] = shuffleArray([
    'sobrevivente',
    'anjo_da_guarda',
    'bobo_da_corte',
    'carrasco',
    'pirata',
  ]);
  const townInvestPool: RoleId[] = shuffleArray(['xerife', 'investigador', 'legista']);
  const townProtPool: RoleId[] = shuffleArray(['doutor', 'guarda_costas']);
  const townKillPool: RoleId[] = shuffleArray(['carcereiro', 'justiceiro']);
  const townSupportPool: RoleId[] = shuffleArray([
    'prefeito',
    'marechal',
    'medium',
    'retribucionista',
    'dancarina',
  ]);

  if (playerCount >= 13) {
    const deck: RoleId[] = [];
    deck.push('chefao', 'mafioso', mafiaSupportPool[0]);
    deck.push(neutralKillerPool[0]);

    const neutralCount = playerCount >= 14 ? 2 : 1;
    for (let i = 0; i < neutralCount; i++) {
      deck.push(neutralChaosBenignPool[i]);
    }

    deck.push(townInvestPool[0], townInvestPool[1]);
    deck.push(townProtPool[0]);
    deck.push(townKillPool[0]);
    deck.push(townSupportPool[0], townSupportPool[1]);

    // Cidade Aleatório (qualquer pilha da Cidade restante)
    const remainingTown = shuffleArray([
      ...townInvestPool.slice(2),
      ...townProtPool.slice(1),
      ...townKillPool.slice(1),
      ...townSupportPool.slice(2),
    ]);
    const townRandomCount = playerCount >= 15 ? 2 : 1;
    for (let i = 0; i < townRandomCount; i++) {
      deck.push(remainingTown[i] || 'convidado');
    }

    // 1 Convidado (ou mais se >15)
    while (deck.length < playerCount) {
      deck.push('convidado');
    }

    return deck;
  }

  // Scaled categories for < 13 players
  const deck: RoleId[] = ['chefao'];
  if (playerCount >= 6) deck.push('mafioso');
  if (playerCount >= 8) deck.push(mafiaSupportPool[0]);
  if (playerCount >= 10) deck.push(neutralKillerPool[0]);
  if (playerCount >= 7) {
    // Evitar Anjo e Carrasco juntos com menos de 13 jogadores
    const safeNeutrals = neutralChaosBenignPool.filter((r) => r !== 'anjo_da_guarda');
    deck.push(safeNeutrals[0]);
  }
  if (playerCount >= 5) deck.push(townInvestPool[0]);
  if (playerCount >= 5) deck.push(townProtPool[0]);
  if (playerCount >= 9) deck.push(townInvestPool[1]);
  if (playerCount >= 7) deck.push(townKillPool[0]);
  if (playerCount >= 8) deck.push(townSupportPool[0]);
  if (playerCount >= 11) deck.push(townSupportPool[1]);

  while (deck.length < playerCount) {
    deck.push('convidado');
  }
  return deck.slice(0, playerCount);
}

export function validateFreeDeck(deck: RoleId[], playerCount: number): string[] {
  const warnings: string[] = [];
  if (deck.length !== playerCount) {
    warnings.push(`O baralho precisa ter exatamente ${playerCount} cartas (atualmente ${deck.length}).`);
  }
  if (deck.length === 0) return warnings;

  const townCount = deck.filter((r) => ROLES[r].faction === 'CIDADE').length;
  const killerCount = deck.filter(
    (r) => ROLES[r].faction === 'MAFIA' || ROLES[r].faction === 'NEUTRO_MATADOR'
  ).length;

  if (townCount / deck.length < 0.6) {
    warnings.push('Recomendado manter pelo menos 60% de papéis da Cidade.');
  }
  if (killerCount > 4) {
    warnings.push('Recomendado no máximo 4 matadores (Máfia + Neutros Matadores).');
  }
  if (!deck.includes('medium') && !deck.includes('legista') && playerCount >= 10) {
    warnings.push('Recomendado incluir Médium e Legista para partidas com muitos mortos.');
  }
  if (playerCount < 13 && deck.includes('anjo_da_guarda') && deck.includes('carrasco')) {
    warnings.push('Regra sugere evitar Anjo da Guarda e Carrasco juntos com menos de 13 jogadores.');
  }
  return warnings;
}

export const STICKER_META: Record<
  StickerType,
  { label: string; shortLabel: string; colorClass: string; badgeText: string }
> = {
  red_seal: {
    label: 'Selo Vermelho',
    shortLabel: 'Selo Verm.',
    colorClass: 'bg-[#C83232]/20 text-[#F28B82] border-[#C83232]/40',
    badgeText: 'Selo Vermelho',
  },
  black_seal: {
    label: 'Selo Negro',
    shortLabel: 'Selo Negro',
    colorClass: 'bg-[#1F2430] text-[#E2E8F0] border-[#475569]',
    badgeText: 'Selo Negro',
  },
  blue_drop: {
    label: 'Gota Azul',
    shortLabel: 'Gota Azul',
    colorClass: 'bg-[#2563EB]/20 text-[#93C5FD] border-[#3B82F6]/40',
    badgeText: 'Gota Azul',
  },
  white_amulet: {
    label: 'Amuleto Branco',
    shortLabel: 'Amuleto',
    colorClass: 'bg-[#F8FAFC]/15 text-[#F8FAFC] border-[#F8FAFC]/40',
    badgeText: 'Amuleto Branco',
  },
  gold_shield: {
    label: 'Escudo Dourado',
    shortLabel: 'Escudo',
    colorClass: 'bg-[#D99B26]/20 text-[#FCD34D] border-[#D99B26]/45',
    badgeText: 'Escudo Dourado',
  },
  orange_deco: {
    label: 'Adesivo Laranja (Enfeite)',
    shortLabel: 'Laranja',
    colorClass: 'bg-[#EA580C]/20 text-[#FDBA74] border-[#EA580C]/40',
    badgeText: 'Adesivo Laranja',
  },
};
