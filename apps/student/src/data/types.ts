// Data types — faithful TypeScript port of Swift models
// Sources: TrainingModels.swift, SocialAndHealthModels.swift, MockData.swift

export type Sexo = 'masculino' | 'feminino';

export type NivelAtividade = 'sedentario' | 'leve' | 'moderado' | 'ativo' | 'muitoAtivo';

export type ModalidadeAtleta =
  | 'corredor' | 'futebol' | 'musculacao' | 'ciclista' | 'natacao' | 'crossTraining';

export type MetodoTreinamento =
  | 'biSet' | 'triSet' | 'serieGigante' | 'dropSet' | 'restPause' | 'clusterSets'
  | 'picoDeContracao' | 'repeticoesNegativas' | 'sst' | 'fst7' | 'gvt' | 'heavyDuty'
  | 'piramideCrescente' | 'piramideDecrescente' | 'cadenciaControlada'
  | 'oclusaoVascular' | 'repeticoesForcadas' | 'stripSet' | 'myoReps' | 'powerbuilding';

export type TipoPost = 'treino' | 'evolucao' | 'conquista';

export type ObjetivoMacro = 'emagrecimento' | 'manutencao' | 'hipertrofia';

export interface PerfilUsuario {
  nome: string;
  sexo: Sexo;
  idade: number;
  pesoKg: number;
  alturaCm: number;
  nivelAtividade: NivelAtividade;
  modalidadePrincipal: ModalidadeAtleta;
}

export const defaultPerfil: PerfilUsuario = {
  nome: '',
  sexo: 'masculino',
  idade: 25,
  pesoKg: 75,
  alturaCm: 175,
  nivelAtividade: 'moderado',
  modalidadePrincipal: 'musculacao',
};

export interface Exercicio {
  id: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  metodo?: MetodoTreinamento;
  observacoes?: string;
}

export interface Treino {
  id: string;
  titulo: string;
  modalidade: ModalidadeAtleta;
  exercicios: Exercicio[];
  duracaoEstimadaMin: number;
  nivel: string;
}

export interface FeedPost {
  id: string;
  autor: string;
  avatarIcon: string;
  imageIcon: string;
  legenda: string;
  curtidas: number;
  tipo: TipoPost;
  data: Date;
}

export interface RegistroEvolucao {
  id: string;
  data: Date;
  pesoKg: number;
  percentualGordura?: number;
  fotoIcon: string;
}

export interface Nutricionista {
  id: string;
  nome: string;
  crn: string;
  especialidade: string;
  avaliacao: number;
  precoConsultaAprox: string;
  atendeOnline: boolean;
}

export interface Academia {
  id: string;
  nome: string;
  endereco: string;
  avaliacao: number;
  modalidades: string[];
}

export interface ProfissionalMapa {
  id: string;
  nome: string;
  especialidade: string;
  avaliacao: number;
  precoConsultaAprox: string;
}

export interface ProdutoSuplemento {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
}

export interface LojaSuplemento {
  id: string;
  nome: string;
  logoIcon: string;
  produtos: ProdutoSuplemento[];
}

export interface WatchNotification {
  id: string;
  titulo: string;
  corpo: string;
  data: Date;
}

// ─── Labels / helpers ────────────────────────────────────────────────────────

export const nivelAtividadeLabel: Record<NivelAtividade, string> = {
  sedentario: 'Sedentário (pouco ou nenhum exercício)',
  leve: 'Leve (exercício 1-3x/semana)',
  moderado: 'Moderado (exercício 3-5x/semana)',
  ativo: 'Ativo (exercício 6-7x/semana)',
  muitoAtivo: 'Muito ativo (atleta / 2x por dia)',
};

export const modalidadeLabel: Record<ModalidadeAtleta, string> = {
  corredor: 'Corredor',
  futebol: 'Jogador de Futebol',
  musculacao: 'Musculação / Hipertrofia',
  ciclista: 'Ciclista',
  natacao: 'Nadador',
  crossTraining: 'Cross Training',
};

export const tipoPostLabel: Record<TipoPost, string> = {
  treino: 'Treino',
  evolucao: 'Evolução',
  conquista: 'Conquista',
};

export const objetivoMacroLabel: Record<ObjetivoMacro, string> = {
  emagrecimento: 'Emagrecimento',
  manutencao: 'Manutenção',
  hipertrofia: 'Hipertrofia',
};

export const metodoTreinamentoInfo: Record<MetodoTreinamento, { titulo: string; descricao: string; nivelRecomendado: string }> = {
  biSet: { titulo: 'Bi-Set (Série Composta)', descricao: 'Dois exercícios seguidos para o mesmo grupo muscular, sem descanso entre eles.', nivelRecomendado: 'Iniciante/Intermediário' },
  triSet: { titulo: 'Tri-Set', descricao: 'Três exercícios seguidos para o mesmo grupo muscular, sem intervalo.', nivelRecomendado: 'Iniciante/Intermediário' },
  serieGigante: { titulo: 'Série Gigante', descricao: 'Quatro ou mais exercícios para o mesmo músculo (ou diferentes) em sequência, sem descanso.', nivelRecomendado: 'Avançado' },
  dropSet: { titulo: 'Drop-Set', descricao: 'Execute até a falha, reduza o peso em 20-30% imediatamente e continue até falhar de novo.', nivelRecomendado: 'Intermediário' },
  restPause: { titulo: 'Rest-Pause', descricao: 'Série até a falha, descanso de 10-15s e retomada com a mesma carga até falhar novamente.', nivelRecomendado: 'Intermediário' },
  clusterSets: { titulo: 'Cluster Sets', descricao: 'Divida a série em pequenos blocos com micro-pausas (ex: 3 reps, 15s, 3 reps...) para usar cargas mais altas.', nivelRecomendado: 'Intermediário' },
  picoDeContracao: { titulo: 'Pico de Contração', descricao: 'Pause e contraia com força máxima por 2-3s no ponto mais alto do movimento em cada repetição.', nivelRecomendado: 'Intermediário' },
  repeticoesNegativas: { titulo: 'Repetições Negativas (Excêntricas)', descricao: 'Fase excêntrica (descida) extremamente lenta, de 4 a 6 segundos por repetição.', nivelRecomendado: 'Avançado' },
  sst: { titulo: 'SST (Sarcoplasma Stimulating Training)', descricao: 'Mistura drop-sets, rest-pause e variações de velocidade em uma série até o esgotamento.', nivelRecomendado: 'Avançado' },
  fst7: { titulo: 'FST-7 (Fascia Stretch Training 7)', descricao: '7 séries de 10-12 repetições no último exercício, com descanso curto de 30-45s.', nivelRecomendado: 'Avançado' },
  gvt: { titulo: 'GVT (German Volume Training)', descricao: '10 séries de 10 repetições com carga fixa (~60% de 1RM), descansos de 60-90s.', nivelRecomendado: 'Avançado' },
  heavyDuty: { titulo: 'Heavy Duty', descricao: 'Altíssima intensidade e baixíssimo volume: uma série de esforço absoluto até a falha total por exercício.', nivelRecomendado: 'Avançado' },
  piramideCrescente: { titulo: 'Série Pirâmide Crescente', descricao: 'Aumenta o peso a cada série enquanto diminui as repetições.', nivelRecomendado: 'Iniciante/Intermediário' },
  piramideDecrescente: { titulo: 'Série Pirâmide Decrescente', descricao: 'Começa com maior carga e menos repetições, reduzindo peso e aumentando reps a cada série.', nivelRecomendado: 'Iniciante/Intermediário' },
  cadenciaControlada: { titulo: 'Série Progressiva de Tempo (Cadência)', descricao: 'Controle o tempo exato de cada fase do movimento (ex: 4-1-2-0).', nivelRecomendado: 'Iniciante/Intermediário' },
  oclusaoVascular: { titulo: 'Oclusão Vascular (Kaatsu)', descricao: 'Faixas/manguitos restringem parcialmente o fluxo sanguíneo enquanto treina com cargas leves.', nivelRecomendado: 'Avançado' },
  repeticoesForcadas: { titulo: 'Repetições Forçadas', descricao: 'Ao atingir a falha, um parceiro ajuda levemente na fase concêntrica para mais 2-3 repetições.', nivelRecomendado: 'Avançado' },
  stripSet: { titulo: 'Strip-Set', descricao: 'Como o drop-set, mas retirando anilhas continuamente até restar a barra vazia ou carga mínima.', nivelRecomendado: 'Intermediário' },
  myoReps: { titulo: 'MYO-Reps', descricao: 'Série inicial até quase a falha, descanso de 15s, seguida de 3-5 minisséries de 3 repetições.', nivelRecomendado: 'Intermediário' },
  powerbuilding: { titulo: 'Treino Híbrido (Powerbuilding)', descricao: 'Mescla força pura (low reps) no início com hipertrofia (high reps) no final da sessão.', nivelRecomendado: 'Intermediário' },
};

export const allMetodos: MetodoTreinamento[] = [
  'biSet', 'triSet', 'serieGigante', 'dropSet', 'restPause', 'clusterSets',
  'picoDeContracao', 'repeticoesNegativas', 'sst', 'fst7', 'gvt', 'heavyDuty',
  'piramideCrescente', 'piramideDecrescente', 'cadenciaControlada',
  'oclusaoVascular', 'repeticoesForcadas', 'stripSet', 'myoReps', 'powerbuilding',
];
