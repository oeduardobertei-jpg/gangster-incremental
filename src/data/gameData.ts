import { 
  UpgradeItem, 
  SyndicatePrestigeTalent, 
  TerritoryZone, 
  TacticalOrder,
  FactionConfig 
} from '../types/game';

export const FACTION_CONFIGS: Record<string, FactionConfig> = {
  vermelha: {
    id: 'vermelha',
    name: 'Comando Vermelho / Falange Rubra',
    tag: 'CV',
    color: '#ef4444',
    rivalName: 'Primeiro Comando / Cartel Azul',
    rivalTag: 'PCC',
    rivalColor: '#3b82f6',
    motto: 'Paz, Justiça e Liberdade nas Ruas'
  },
  azul: {
    id: 'azul',
    name: 'Primeiro Comando da Capital',
    tag: 'PCC',
    color: '#3b82f6',
    rivalName: 'Comando Vermelho / Bonde dos Aberto',
    rivalTag: 'CV',
    rivalColor: '#ef4444',
    motto: '1533 - Lealdade, Disciplina e Progresso'
  }
};

export const INITIAL_UPGRADES: UpgradeItem[] = [
  // --- 1. ARSENAL & PODER BÉLICO (Substitui Laboratório de Sangue / Custo: Grana) ---
  {
    id: 'armory_bulletproof_vest',
    name: 'Coletes Balísticos Nível III',
    category: 'armory',
    description: 'Equipa os soldados da facção com coletes pesados de kevlar, aumentando o HP máximo.',
    level: 0,
    maxLevel: 50,
    baseCost: 25,
    costMultiplier: 1.15,
    currency: 'grana',
    effectDescription: '+20% Vida Máxima dos Soldados por nível'
  },
  {
    id: 'armory_heavy_calibers',
    name: 'Munição Ponta Oca 7.62 & 9mm',
    category: 'armory',
    description: 'Armamento de alto calibre com maior poder de parada e dano por disparo.',
    level: 0,
    maxLevel: 50,
    baseCost: 35,
    costMultiplier: 1.16,
    currency: 'grana',
    effectDescription: '+15% Dano de Ataque dos Soldados por nível'
  },
  {
    id: 'armory_motorcycle_squad',
    name: 'Bonde das Motos (Batedores)',
    category: 'armory',
    description: 'Motos preparadas de alta cilindrada para perseguição rápida de rivais em fuga.',
    level: 0,
    maxLevel: 30,
    baseCost: 50,
    costMultiplier: 1.2,
    currency: 'grana',
    effectDescription: '+8% Velocidade e chance de despachar Batedores de Moto velozes'
  },
  {
    id: 'armory_medics_safehouse',
    name: 'Médicos de Plantão nos Esconderijos',
    category: 'armory',
    description: 'Equipes clandestinas de atendimento rápido cuidam dos feridos em campo.',
    level: 0,
    maxLevel: 25,
    baseCost: 150,
    costMultiplier: 1.22,
    currency: 'grana',
    effectDescription: '+1.5 HP/segundo de Regeneração dos Soldados'
  },

  // --- 2. BOCA & PONTOS DE APOIO (Substitui Forja de Ossos / Custo: Munição) ---
  {
    id: 'boca_fortified_bunkers',
    name: 'Fortificação de Esconderijos & Bocas',
    category: 'boca',
    description: 'Expande a rede de casas seguras, permitindo manter mais soldados ativos na favela.',
    level: 0,
    maxLevel: 40,
    baseCost: 15,
    costMultiplier: 1.25,
    currency: 'municao',
    effectDescription: '+3 Limite Máximo de Soldados Ativos na Facção'
  },
  {
    id: 'boca_barricades',
    name: 'Barricadas de Aço e Concreto',
    category: 'boca',
    description: 'Tranqueiras que bloqueiam linhas de tiro inimigas nas esquinas.',
    level: 0,
    maxLevel: 25,
    baseCost: 30,
    costMultiplier: 1.22,
    currency: 'municao',
    effectDescription: 'Reduz dano recebido pelos soldados em +3% (máx 60%)'
  },
  {
    id: 'boca_fuzileiros_elite',
    name: 'Fuzileiros de Elite (AR-15 / Fal)',
    category: 'boca',
    description: 'Permite converter 15% dos caídos recrutados em atiradores pesados com rifles de assalto.',
    level: 0,
    maxLevel: 10,
    baseCost: 80,
    costMultiplier: 1.35,
    currency: 'municao',
    effectDescription: '+5% Chance de recrutar Fuzileiro de Longo Alcance'
  },
  {
    id: 'boca_auto_ammo_scavenge',
    name: 'Recolhimento Rápido de Cápsulas',
    category: 'boca',
    description: 'Equipe de recolhimento que garante fluxo automático de munição das carcaças caídas.',
    level: 0,
    maxLevel: 15,
    baseCost: 120,
    costMultiplier: 1.3,
    currency: 'municao',
    effectDescription: '+1 Caixa de Munição gerada a cada 5 segundos'
  },

  // --- 3. INTEL, RADIOS & COMUNICAÇÃO (Substitui Grimório Arcano / Custo: Respeito) ---
  {
    id: 'intel_radio_network',
    name: 'Frequência de Rádio Criptografada',
    category: 'intel',
    description: 'Rádios comunicadores modernos que aceleram a recuperação de Inteligência Tática.',
    level: 0,
    maxLevel: 50,
    baseCost: 25,
    costMultiplier: 1.2,
    currency: 'respeito',
    effectDescription: '+0.8 Inteligência por segundo de Recuperação'
  },
  {
    id: 'intel_central_command',
    name: 'Central de Monitoramento & Drones',
    category: 'intel',
    description: 'Aumenta a capacidade máxima de ordens táticas simultâneas.',
    level: 0,
    maxLevel: 40,
    baseCost: 40,
    costMultiplier: 1.18,
    currency: 'respeito',
    effectDescription: '+20 Limite Máximo de Inteligência'
  },
  {
    id: 'intel_tactical_training',
    name: 'Treinamento Balístico de Guerrilha',
    category: 'intel',
    description: 'Instruções táticas de tiro que aumentam a letalidade de todos os seus recrutas.',
    level: 0,
    maxLevel: 30,
    baseCost: 60,
    costMultiplier: 1.22,
    currency: 'respeito',
    effectDescription: '+15% Dano nos disparos de todos os seus soldados'
  },

  // --- 4. SINDICATO & CONEXÕES (Substitui Laboratório Cerebral / Custo: Contatos) ---
  {
    id: 'sindicato_auto_recruit',
    name: 'Convocação Automática de Recrutas',
    category: 'sindicato',
    description: 'A central do rádio envia reforços automaticamente a cada poucos segundos sem gastar inteligência.',
    level: 0,
    maxLevel: 10,
    baseCost: 5,
    costMultiplier: 1.5,
    currency: 'contatos',
    effectDescription: 'Convoca automaticamente 1 soldado a cada (10 - Nível)s'
  },
  {
    id: 'sindicato_double_reinforcements',
    name: 'Reforços em Dobro',
    category: 'sindicato',
    description: 'Chance de convocar 2 soldados de uma só vez pelo custo de apenas 1 recruta.',
    level: 0,
    maxLevel: 10,
    baseCost: 10,
    costMultiplier: 1.6,
    currency: 'contatos',
    effectDescription: '+8% de Chance de gerar 2 recrutas simultâneos'
  }
];

export const INITIAL_PRESTIGE_TALENTS: SyndicatePrestigeTalent[] = [
  {
    id: 'talent_cartel_cash',
    name: 'Rota Internacional de Lucros',
    description: 'Aumenta permanentemente toda a Grana recolhida em todas as rodadas futuras.',
    level: 0,
    maxLevel: 25,
    cost: 1,
    effectMultiplier: 0.5 // +50% grana por nível
  },
  {
    id: 'talent_intel_network',
    name: 'Satélites e Escutas Clandestinas',
    description: 'Começa qualquer tomada com Inteligência base ampliada e rádio veloz.',
    level: 0,
    maxLevel: 20,
    cost: 2,
    effectMultiplier: 0.3 // +30% regen intel
  },
  {
    id: 'talent_veteran_enforcers',
    name: 'Tropa de Elite Veterana',
    description: 'Multiplica o poder de fogo, armadura e vida de todos os soldados da facção permanentemente.',
    level: 0,
    maxLevel: 30,
    cost: 3,
    effectMultiplier: 0.25 // +25% stats
  },
  {
    id: 'talent_starter_gang',
    name: 'Bonde Inicial Armado',
    description: 'Ao proclamar a Hegemonia, já inicia o novo mapa com soldados armados no território imediatamente.',
    level: 0,
    maxLevel: 10,
    cost: 5,
    effectMultiplier: 2 // +2 soldados iniciais
  },
  {
    id: 'talent_hegemony_monopoly',
    name: 'Tributo do Sindicato Central',
    description: 'Aumenta a quantidade de Emblemas de Hegemonia recebidos a cada grande reset.',
    level: 0,
    maxLevel: 10,
    cost: 8,
    effectMultiplier: 0.2 // +20% emblemas
  }
];

export const TERRITORIES: TerritoryZone[] = [
  {
    id: 1,
    name: 'Beco dos Descalços (Periferia)',
    description: 'Entrada da favela disputada com olheiros desarmados e soldados novatos da facção rival.',
    requiredTakes: 20,
    bgColor: '#0f1118',
    accentColor: '#10b981',
    unlocked: true,
    rivalPool: {
      olheiro: 70,
      soldado_pistola: 25,
      atirador_fuzil: 5,
      gerente_boca: 0,
      blindado_choque: 0,
      chefe_morro: 0
    },
    spawnRate: 2200,
    maxRivals: 12,
    bountyMultiplier: 1.0
  },
  {
    id: 2,
    name: 'Praça da Feira & Linha do Trem',
    description: 'Zona de comércio informal com intenso trânsito de motos e soldados rivais com pistolas automáticas.',
    requiredTakes: 40,
    bgColor: '#13141f',
    accentColor: '#eab308',
    unlocked: false,
    rivalPool: {
      olheiro: 45,
      soldado_pistola: 35,
      atirador_fuzil: 15,
      gerente_boca: 5,
      blindado_choque: 0,
      chefe_morro: 0
    },
    spawnRate: 2000,
    maxRivals: 16,
    bountyMultiplier: 1.3
  },
  {
    id: 3,
    name: 'Avenida das Oficinas & Galpões',
    description: 'Área industrial abandonada onde o cartel rival estoca munições e veículos blindados.',
    requiredTakes: 60,
    bgColor: '#171824',
    accentColor: '#f97316',
    unlocked: false,
    rivalPool: {
      olheiro: 25,
      soldado_pistola: 40,
      atirador_fuzil: 25,
      gerente_boca: 10,
      blindado_choque: 0,
      chefe_morro: 0
    },
    spawnRate: 1800,
    maxRivals: 20,
    bountyMultiplier: 1.7
  },
  {
    id: 4,
    name: 'Morro Alto (Reduto Fortificado)',
    description: 'Asfalto inclinado protegido por fuzileiros em lajes com linhas de tiro cruzadas.',
    requiredTakes: 80,
    bgColor: '#181b2a',
    accentColor: '#ef4444',
    unlocked: false,
    rivalPool: {
      olheiro: 10,
      soldado_pistola: 40,
      atirador_fuzil: 30,
      gerente_boca: 15,
      blindado_choque: 5,
      chefe_morro: 0
    },
    spawnRate: 1600,
    maxRivals: 24,
    bountyMultiplier: 2.2
  },
  {
    id: 5,
    name: 'Mansões da Orla & Condomínios',
    description: 'Bairro nobre onde a cúpula do cartel rival gerencia a lavagem de dinheiro com seguranças pesados.',
    requiredTakes: 120,
    bgColor: '#1a182b',
    accentColor: '#a855f7',
    unlocked: false,
    rivalPool: {
      olheiro: 5,
      soldado_pistola: 30,
      atirador_fuzil: 30,
      gerente_boca: 20,
      blindado_choque: 12,
      chefe_morro: 3
    },
    spawnRate: 1400,
    maxRivals: 28,
    bountyMultiplier: 3.0
  },
  {
    id: 6,
    name: 'Complexo Central (Quartel-General)',
    description: 'O coração do império rival. O Grande Chefe do Morro comanda com poder de fogo máximo.',
    requiredTakes: 200,
    bgColor: '#211822',
    accentColor: '#f43f5e',
    unlocked: false,
    rivalPool: {
      olheiro: 0,
      soldado_pistola: 20,
      atirador_fuzil: 25,
      gerente_boca: 25,
      blindado_choque: 20,
      chefe_morro: 10
    },
    spawnRate: 1200,
    maxRivals: 32,
    bountyMultiplier: 4.5
  }
];

export const TACTICAL_ORDERS: TacticalOrder[] = [
  {
    id: 'recruit_fallen',
    name: 'Convocar Soldado / Recruta',
    shortcut: 'Espaço ou Clique',
    description: 'Chama pelo rádio 1 novo soldado armado da facção diretamente para o combate (Custa 10 de Inteligência).',
    intelCost: 10,
    ammoCost: 0,
    unlocked: true,
    icon: 'UserPlus',
    cooldown: 0.1,
    currentCooldown: 0
  },
  {
    id: 'drive_by',
    name: 'Apoio Motorizado (Drive-By)',
    shortcut: '2',
    description: 'Bonde de motos e viaturas corta o território, elevando a moral e triplicando a grana colhida.',
    intelCost: 40,
    ammoCost: 0,
    unlocked: true,
    icon: 'Car',
    cooldown: 6.0,
    currentCooldown: 0
  }
];
