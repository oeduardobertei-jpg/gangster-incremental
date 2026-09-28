export type FactionId = 'vermelha' | 'azul' | 'neutra';

export type RivalType = 
  | 'olheiro'          // Olheiro rival desarmado/fuga rápida
  | 'soldado_pistola'  // Soldado armado da facção rival
  | 'atirador_fuzil'   // Atirador de elite à distância
  | 'gerente_boca'     // Gerente de boca / suporte moral
  | 'blindado_choque'  // Encouraçado / Mini-chefe
  | 'chefe_morro';     // Líder de facção rival / Boss de Zona

export type AllyType =
  | 'soldado_base'     // Convocado recém-recrutado
  | 'soldado_fuzil'    // Fuzileiro / Atirador pesado
  | 'batedor_moto'     // Motoqueiro ágil
  | 'seguranca_pesado'; // Linha de frente

export interface RivalEntity {
  id: string;
  type: RivalType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  attackTimer: number;
  targetId: string | null;
  state: 'idle' | 'patrol' | 'flee' | 'attack';
  color: string;
  radius: number;
  factionTag: string;
  facingAngle?: number;
  recoilTimer?: number;
  walkDistance?: number;
  variant?: number;
  patrolTargetX?: number;
  patrolTargetY?: number;
  patrolWaitTimer?: number;
  originBuilding?: string;
}

export interface AllyEntity {
  id: string;
  type: AllyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  attackTimer: number;
  targetId: string | null;
  color: string;
  radius: number;
  scavengeCooldown?: number;
  facingAngle?: number;
  recoilTimer?: number;
  walkDistance?: number;
  variant?: number;
}

export interface FallenEntity {
  id: string;
  x: number;
  y: number;
  type: string;
  name: string;
  decayTime: number; // tempo para recolher armas/saquear
  maxDecayTime: number;
  harvested: boolean;
  bountyCash: number;
  bountyAmmo: number;
}

export interface BulletProjectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  source: 'ally' | 'rival' | 'tactical';
  color: string;
  radius: number;
  isExplosive?: boolean;
}

export type CoverObstacleType = 
  | 'cacamba_entulho'   // Caçamba de metal com entulho
  | 'carro_abandonado'  // Carro abandonado/sucata com fumaça e explosão
  | 'muro_concreto'     // Muro de tijolo/concreto para cobertura
  | 'botijao_gas';      // Botijão de gás explosivo (P-13)

export interface CoverObstacle {
  id: string;
  type: CoverObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  isExplosive: boolean;
  destroyed: boolean;
  rotation?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  vy: number;
  life: number;
}

export interface GroundMark {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
  type: 'bullet_mark' | 'grafite' | 'smoke';
}

export interface TearGasZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  damagePerSec: number;
}

export interface TacticalOrder {
  id: string;
  name: string;
  shortcut: string;
  description: string;
  intelCost: number;     // Custo em Comunicação/Intel (Substituto da Mana)
  ammoCost: number;      // Custo em Munição
  unlocked: boolean;
  icon: string;
  cooldown: number;
  currentCooldown: number;
}

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'armory' | 'boca' | 'intel' | 'sindicato';
  description: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  currency: 'grana' | 'municao' | 'respeito' | 'contatos';
  effectDescription: string;
}

export interface SyndicatePrestigeTalent {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  effectMultiplier: number;
}

export interface TerritoryZone {
  id: number;
  name: string;
  description: string;
  requiredTakes: number; // Abates / domínios necessários
  bgColor: string;
  accentColor: string;
  unlocked: boolean;
  rivalPool: {
    olheiro: number;
    soldado_pistola: number;
    atirador_fuzil: number;
    gerente_boca: number;
    blindado_choque: number;
    chefe_morro: number;
  };
  spawnRate: number;
  maxRivals: number;
  bountyMultiplier: number;
}

export interface GameStats {
  totalRivalsNeutralized: number;
  totalAlliesRecruited: number;
  totalCashEarned: number;
  totalAmmoSeized: number;
  totalRespectEarned: number;
  totalContactsAcquired: number;
  highestTerritoryReached: number;
  hegemonyRituals: number; // Quantidade de prestígios
  timePlayedSeconds: number;
}

export interface FactionConfig {
  id: FactionId;
  name: string;
  tag: string;
  color: string;
  rivalName: string;
  rivalTag: string;
  rivalColor: string;
  motto: string;
}

export interface GameState {
  // Configuração da Facção do Jogador
  playerFaction: FactionId;

  // Recursos da Facção
  intel: number;         // Inteligência / Rádio (Regenera no tempo, substitui Mana)
  maxIntel: number;
  intelRegen: number;

  cash: number;          // Grana / Dinheiro Sujo (Substitui Sangue)
  ammo: number;          // Caixas de Munição & Armas (Substitui Ossos)
  respect: number;       // Respeito das Ruas / Moral (Substitui Almas)
  runRespectEarned?: number; // Respeito acumulado exclusivamente na rodada atual para Prestígio
  contacts: number;      // Contatos de Alto Escalão / Escutas (Substitui Cérebros)
  hegemonyEmblems: number; // Emblemas de Hegemonia (Substitui Crânios / Prestígio)

  // Território & Batalha
  currentTerritoryId: number;
  territoryTakes: number;

  // Limites
  maxAllies: number;

  // Upgrades & Árvores
  upgrades: Record<string, number>;
  talents: Record<string, number>;

  // Automações
  autoRecruitFallen: boolean;
  autoSniperFire: boolean;
  autoCollectAmmo: boolean;

  // Configurações
  gameSpeed: number; // 0, 1, 2, 5
  soundVolume: number;
  soundMuted: boolean;
  showDamageNumbers: boolean;
  showCombatSplatters: boolean;

  // Metadados
  stats: GameStats;
  lastSaveTimestamp: number;
}
