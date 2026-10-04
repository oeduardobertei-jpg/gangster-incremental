import type { RivalType } from '../types/game';

export type CampaignObjectiveKind =
  | 'sweep'
  | 'interdiction'
  | 'breakthrough'
  | 'siege'
  | 'encirclement'
  | 'decapitation';

export interface WeightedRivalType {
  type: RivalType;
  weight: number;
}

export interface CampaignExternalEntry {
  x: number;
  y: number;
  label: string;
}

export interface CampaignMilestone {
  id: string;
  at: number;
  label: string;
  forcedTypes: readonly RivalType[];
}

export type ReinforcementEntryPattern = 'random' | 'flanks' | 'cycle' | 'command';

export interface ReinforcementDoctrine {
  name: string;
  entryPattern: ReinforcementEntryPattern;
  intervalMultiplier: number;
  normalBatch: number;
  depletedBatch: number;
  dominatedBatch: number;
  composition: readonly WeightedRivalType[];
  escalationAt: number;
  lateComposition: readonly WeightedRivalType[];
}
export interface TerritoryCampaignProfile {
  territoryId: number;
  operationName: string;
  objectiveKind: CampaignObjectiveKind;
  objectiveLabel: string;
  objectiveDescription: string;
  tacticalHint: string;
  externalEntries: readonly CampaignExternalEntry[];
  milestones: readonly CampaignMilestone[];
  reinforcement: ReinforcementDoctrine;
}

const C = (type: RivalType, weight: number): WeightedRivalType => ({ type, weight });

export const TERRITORY_CAMPAIGNS: Record<number, TerritoryCampaignProfile> = {
  1: {
    territoryId: 1,
    operationName: 'Operação Varredura',
    objectiveKind: 'sweep',
    objectiveLabel: 'VARREDURA',
    objectiveDescription: 'Quebre a presença rival nas vielas e consolide o primeiro distrito.',
    tacticalHint: 'Pressão curta e direta. Batedores encontram alvos; fuzileiros limpam corredores.',
    externalEntries: [
      { x:-.02,y:.52,label:'Viela Oeste' }, { x:1.02,y:.47,label:'Viela Leste' }, { x:.50,y:-.03,label:'Subida Norte' }
    ],
    milestones:[{id:'t1-varredura',at:.55,label:'VARREDURA: RESPOSTA LOCAL',forcedTypes:['soldado_pistola','atirador_fuzil']}],
    reinforcement: {
      name:'Resposta local', entryPattern:'random', intervalMultiplier:1.05, normalBatch:1, depletedBatch:1, dominatedBatch:1,
      composition:[C('olheiro',24),C('soldado_pistola',56),C('atirador_fuzil',15),C('gerente_boca',5)], escalationAt:.70, lateComposition:[C('olheiro',20),C('soldado_pistola',52),C('atirador_fuzil',20),C('gerente_boca',8)]
    }
  },
  2: {
    territoryId: 2,
    operationName: 'Operação Linha Cortada',
    objectiveKind: 'interdiction',
    objectiveLabel: 'INTERDIÇÃO',
    objectiveDescription: 'Interrompa a resposta rival entre a feira, os trilhos e as passagens laterais.',
    tacticalHint: 'Os reforços tendem aos flancos. Controle visual dos dois lados vale mais que correr pelo centro.',
    externalEntries: [
      { x:-.02,y:.60,label:'Feira Oeste' }, { x:1.02,y:.60,label:'Feira Leste' },
      { x:.50,y:-.03,label:'Passagem da Estação' }
    ],
    milestones:[
      {id:'t2-oeste',at:.35,label:'INTERDI??O: FLANCO EM ALERTA',forcedTypes:['atirador_fuzil']},
      {id:'t2-estacao',at:.70,label:'INTERDI??O: RESERVA DA ESTA??O',forcedTypes:['atirador_fuzil','gerente_boca']}
    ],
    reinforcement: {
      name:'Flancos da feira', entryPattern:'flanks', intervalMultiplier:1.00, normalBatch:1, depletedBatch:2, dominatedBatch:1,
      composition:[C('olheiro',12),C('soldado_pistola',44),C('atirador_fuzil',30),C('gerente_boca',14)], escalationAt:.60, lateComposition:[C('olheiro',8),C('soldado_pistola',40),C('atirador_fuzil',36),C('gerente_boca',16)]
    }
  },
  3: {
    territoryId: 3,
    operationName: 'Operação Pátio de Aço',
    objectiveKind: 'breakthrough',
    objectiveLabel: 'RUPTURA',
    objectiveDescription: 'Rompa a defesa das oficinas e empurre a linha de frente através do pátio industrial.',
    tacticalHint: 'Fuzileiros rivais dominam corredores longos. Use mobilidade para quebrar linhas de tiro.',
    externalEntries: [
      { x:-.02,y:.52,label:'Portão de Serviço Oeste' },
      { x:1.02,y:.52,label:'Portão de Serviço Leste' }, { x:.50,y:-.03,label:'Avenida Norte' }
    ],
    milestones:[{id:'t3-aco',at:.50,label:'RUPTURA: RESERVA DAS OFICINAS',forcedTypes:['atirador_fuzil','blindado_choque']}],
    reinforcement: {
      name:'Equipes de oficina', entryPattern:'cycle', intervalMultiplier:.94, normalBatch:1, depletedBatch:2, dominatedBatch:1,
      composition:[C('olheiro',8),C('soldado_pistola',38),C('atirador_fuzil',34),C('gerente_boca',12),C('blindado_choque',8)], escalationAt:.55, lateComposition:[C('soldado_pistola',32),C('atirador_fuzil',38),C('gerente_boca',15),C('blindado_choque',15)]
    }
  },
  4: {
    territoryId: 4,
    operationName: 'Operação Quebra-Reduto',
    objectiveKind: 'siege',
    objectiveLabel: 'CERCO',
    objectiveDescription: 'Suba os terraços, desgaste a defesa fortificada e quebre o reduto do morro.',
    tacticalHint: 'A defesa pesada segura gargalos. Fuzileiros devem trabalhar atrás da linha de frente.',
    externalEntries: [
      { x:-.02,y:.68,label:'Escadaria Oeste' }, { x:1.02,y:.63,label:'Escadaria Leste' }, { x:.50,y:-.03,label:'Subida Norte' }
    ],
    milestones:[
      {id:'t4-linha',at:.40,label:'CERCO: LINHA FORTIFICADA',forcedTypes:['blindado_choque']},
      {id:'t4-reduto',at:.75,label:'CERCO: REDUTO EM ALERTA',forcedTypes:['blindado_choque','gerente_boca']}
    ],
    reinforcement: {
      name:'Defesa do reduto', entryPattern:'cycle', intervalMultiplier:1.08, normalBatch:1, depletedBatch:2, dominatedBatch:2,
      composition:[C('soldado_pistola',30),C('atirador_fuzil',28),C('gerente_boca',18),C('blindado_choque',24)], escalationAt:.50, lateComposition:[C('soldado_pistola',20),C('atirador_fuzil',25),C('gerente_boca',20),C('blindado_choque',35)]
    }
  },
  5: {
    territoryId: 5,
    operationName: 'Operação Cerco da Orla',
    objectiveKind: 'encirclement',
    objectiveLabel: 'ENCURRALAR',
    objectiveDescription: 'Feche as rotas dos condomínios e force as equipes rivais para fora das zonas protegidas.',
    tacticalHint: 'As entradas são distantes. Mobilidade e alcance precisam trabalhar juntos.',
    externalEntries: [
      { x:-.02,y:.44,label:'Portaria Oeste' }, { x:1.02,y:.74,label:'Portaria Leste' }, { x:.50,y:-.03,label:'Boulevard Norte' }
    ],
    milestones:[
      {id:'t5-seguranca',at:.35,label:'ENCURRALAR: SEGURANÇA MOBILIZADA',forcedTypes:['atirador_fuzil','blindado_choque']},
      {id:'t5-cerco',at:.68,label:'ENCURRALAR: CERCO FECHANDO',forcedTypes:['gerente_boca','blindado_choque']}
    ],
    reinforcement: {
      name:'Resposta de segurança', entryPattern:'flanks', intervalMultiplier:.90, normalBatch:1, depletedBatch:2, dominatedBatch:2,
      composition:[C('soldado_pistola',24),C('atirador_fuzil',38),C('gerente_boca',16),C('blindado_choque',22)], escalationAt:.45, lateComposition:[C('soldado_pistola',12),C('atirador_fuzil',40),C('gerente_boca',18),C('blindado_choque',30)]
    }
  },
  6: {
    territoryId: 6,
    operationName: 'Operação Decapitação',
    objectiveKind: 'decapitation',
    objectiveLabel: 'COMANDO',
    objectiveDescription: 'Atravesse o perímetro, desorganize o comando e sustente a pressão sobre o QG central.',
    tacticalHint: 'Gerentes coordenam a defesa e pesados travam o eixo. Eliminar suporte abre janelas de avanço.',
    externalEntries: [
      { x:.28,y:-.03,label:'Perímetro Noroeste' }, { x:.72,y:-.03,label:'Perímetro Nordeste' }, { x:.50,y:-.03,label:'Eixo Norte' }
    ],
    milestones:[
      {id:'t6-reserva',at:.25,label:'COMANDO: RESERVA MOBILIZADA',forcedTypes:['gerente_boca','atirador_fuzil']},
      {id:'t6-protocolo',at:.55,label:'COMANDO: PROTOCOLO DE DEFESA',forcedTypes:['blindado_choque','gerente_boca']},
      {id:'t6-ultima',at:.80,label:'COMANDO: ÚLTIMA LINHA DO QG',forcedTypes:['blindado_choque','gerente_boca']}
    ],
    reinforcement: {
      name:'Reserva do comando', entryPattern:'command', intervalMultiplier:.86, normalBatch:1, depletedBatch:2, dominatedBatch:2,
      composition:[C('soldado_pistola',18),C('atirador_fuzil',32),C('gerente_boca',22),C('blindado_choque',28)], escalationAt:.35, lateComposition:[C('soldado_pistola',10),C('atirador_fuzil',30),C('gerente_boca',25),C('blindado_choque',35)]
    }
  }
};

export const getTerritoryCampaignProfile = (territoryId: number): TerritoryCampaignProfile =>
  TERRITORY_CAMPAIGNS[territoryId] ?? TERRITORY_CAMPAIGNS[1];

export const getCampaignExternalEntries = (
  territoryId: number,
  width: number,
  height: number
): readonly { x:number; y:number; label:string }[] =>
  getTerritoryCampaignProfile(territoryId).externalEntries.map(entry => ({
    x: entry.x * width,
    y: entry.y * height,
    label: entry.label
  }));
