// Mock data — faithful TypeScript port of Swift MockData.swift + SocialAndHealthModels.swift
import type {
  Treino, FeedPost, RegistroEvolucao, Nutricionista, Academia,
  ProfissionalMapa, LojaSuplemento,
} from './types';

export const mockTreinos: Treino[] = [
  {
    id: '1',
    titulo: 'Peito & Tríceps - Hipertrofia',
    modalidade: 'musculacao',
    exercicios: [
      { id: 'e1', nome: 'Supino Reto', grupoMuscular: 'Peito', series: 4, repeticoes: '8-10', metodo: 'piramideCrescente' },
      { id: 'e2', nome: 'Supino Inclinado + Crucifixo', grupoMuscular: 'Peito', series: 3, repeticoes: '10-12', metodo: 'biSet' },
      { id: 'e3', nome: 'Tríceps Testa', grupoMuscular: 'Tríceps', series: 3, repeticoes: '10', metodo: 'dropSet' },
      { id: 'e4', nome: 'Tríceps Corda', grupoMuscular: 'Tríceps', series: 4, repeticoes: '12-15', metodo: 'myoReps' },
    ],
    duracaoEstimadaMin: 55,
    nivel: 'Intermediário',
  },
  {
    id: '2',
    titulo: 'Corrida Intervalada - Performance',
    modalidade: 'corredor',
    exercicios: [
      { id: 'e5', nome: 'Tiro 400m', grupoMuscular: 'Cardio', series: 6, repeticoes: '1 tiro', observacoes: 'Recuperação 90s trote leve' },
      { id: 'e6', nome: 'Agachamento Búlgaro', grupoMuscular: 'Pernas', series: 3, repeticoes: '10 cada', metodo: 'cadenciaControlada' },
      { id: 'e7', nome: 'Panturrilha em pé', grupoMuscular: 'Panturrilha', series: 4, repeticoes: '15', metodo: 'stripSet' },
    ],
    duracaoEstimadaMin: 45,
    nivel: 'Avançado',
  },
  {
    id: '3',
    titulo: 'Potência para Futebol',
    modalidade: 'futebol',
    exercicios: [
      { id: 'e8', nome: 'Agachamento Livre', grupoMuscular: 'Pernas', series: 5, repeticoes: '5', metodo: 'piramideDecrescente' },
      { id: 'e9', nome: 'Sprints 30m', grupoMuscular: 'Explosão', series: 8, repeticoes: '1 sprint' },
      { id: 'e10', nome: 'Prancha + Elevação de perna', grupoMuscular: 'Core', series: 3, repeticoes: '40s', metodo: 'serieGigante' },
    ],
    duracaoEstimadaMin: 60,
    nivel: 'Intermediário',
  },
  {
    id: '4',
    titulo: 'Costas & Bíceps - GVT',
    modalidade: 'musculacao',
    exercicios: [
      { id: 'e11', nome: 'Puxada Frente', grupoMuscular: 'Costas', series: 10, repeticoes: '10', metodo: 'gvt' },
      { id: 'e12', nome: 'Remada Curvada', grupoMuscular: 'Costas', series: 4, repeticoes: '8-10', metodo: 'restPause' },
      { id: 'e13', nome: 'Rosca Direta', grupoMuscular: 'Bíceps', series: 4, repeticoes: '10-12', metodo: 'fst7' },
    ],
    duracaoEstimadaMin: 70,
    nivel: 'Avançado',
  },
  {
    id: '5',
    titulo: 'Endurance para Ciclismo',
    modalidade: 'ciclista',
    exercicios: [
      { id: 'e14', nome: 'Cadência alta (90rpm+)', grupoMuscular: 'Cardio', series: 3, repeticoes: '10 min' },
      { id: 'e15', nome: 'Leg Press', grupoMuscular: 'Pernas', series: 4, repeticoes: '15-20', metodo: 'dropSet' },
      { id: 'e16', nome: 'Flexão de joelho', grupoMuscular: 'Posterior', series: 3, repeticoes: '12', metodo: 'cadenciaControlada' },
    ],
    duracaoEstimadaMin: 50,
    nivel: 'Intermediário',
  },
];

export const mockFeed: FeedPost[] = [
  {
    id: 'f1',
    autor: 'Carlos Silva',
    avatarIcon: 'person',
    imageIcon: 'barbell',
    legenda: 'Dia de peito intenso! Drop-set no supino reto até a falha absoluta. 💪 #musculacao #treino',
    curtidas: 42,
    tipo: 'treino',
    data: new Date(Date.now() - 3600000),
  },
  {
    id: 'f2',
    autor: 'Ana Costa',
    avatarIcon: 'person',
    imageIcon: 'trending-up',
    legenda: 'Menos 2kg esse mês! A consistência está dando resultado. Acompanhamento com minha nutricionista tem sido incrível! 🥗',
    curtidas: 87,
    tipo: 'evolucao',
    data: new Date(Date.now() - 7200000),
  },
  {
    id: 'f3',
    autor: 'Rafael Melo',
    avatarIcon: 'person',
    imageIcon: 'trophy',
    legenda: 'Primeiro treino de Cross Training concluído! Achei que ia morrer mas sobrevivi hahaha 🏆',
    curtidas: 31,
    tipo: 'conquista',
    data: new Date(Date.now() - 18000000),
  },
  {
    id: 'f4',
    autor: 'Juliana Rocha',
    avatarIcon: 'person',
    imageIcon: 'flame',
    legenda: 'Semana 4 de GVT. 10x10 no agachamento. Pernas destruídas mas valeu cada série! 🔥 #gvt #pernas',
    curtidas: 56,
    tipo: 'treino',
    data: new Date(Date.now() - 86400000),
  },
];

export const mockEvolucao: RegistroEvolucao[] = [
  { id: 'ev1', data: new Date('2025-09-01'), pesoKg: 83.5, percentualGordura: 22, fotoIcon: 'person' },
  { id: 'ev2', data: new Date('2025-09-15'), pesoKg: 82.0, percentualGordura: 21, fotoIcon: 'person' },
  { id: 'ev3', data: new Date('2025-10-01'), pesoKg: 80.5, percentualGordura: 20, fotoIcon: 'person' },
  { id: 'ev4', data: new Date('2025-10-10'), pesoKg: 79.2, percentualGordura: 19, fotoIcon: 'person' },
];

export const mockNutricionistas: Nutricionista[] = [
  { id: 'n1', nome: 'Dra. Camila Souza', crn: 'CRN-5 12345', especialidade: 'Nutrição Esportiva', avaliacao: 4.9, precoConsultaAprox: 'R$ 180/consulta', atendeOnline: true },
  { id: 'n2', nome: 'Dr. Paulo Ferreira', crn: 'CRN-5 54321', especialidade: 'Emagrecimento e Hipertrofia', avaliacao: 4.7, precoConsultaAprox: 'R$ 150/consulta', atendeOnline: true },
  { id: 'n3', nome: 'Dra. Marina Lima', crn: 'CRN-5 98765', especialidade: 'Nutrição Funcional', avaliacao: 4.8, precoConsultaAprox: 'R$ 200/consulta', atendeOnline: false },
];

export const mockAcademias: Academia[] = [
  { id: 'a1', nome: 'PowerFit Studio', endereco: 'Av. Central, 120', avaliacao: 4.7, modalidades: ['Musculação', 'Cross Training'] },
  { id: 'a2', nome: 'Corpo & Cia Fitness', endereco: 'Rua das Flores, 45', avaliacao: 4.4, modalidades: ['Musculação', 'Funcional'] },
  { id: 'a3', nome: 'Arena Esportiva Bahia', endereco: 'Rua do Sol, 88', avaliacao: 4.9, modalidades: ['Futebol', 'Corrida'] },
];

export const mockProfissionaisMapa: ProfissionalMapa[] = [
  { id: 'p1', nome: 'João Almeida', especialidade: 'Personal Trainer', avaliacao: 4.8, precoConsultaAprox: 'R$ 90/sessão' },
  { id: 'p2', nome: 'Dra. Camila Souza', especialidade: 'Nutricionista Esportiva', avaliacao: 4.9, precoConsultaAprox: 'R$ 180/consulta' },
  { id: 'p3', nome: 'Rafael Costa', especialidade: 'Fisioterapeuta', avaliacao: 4.6, precoConsultaAprox: 'R$ 120/sessão' },
];

export const mockLojas: LojaSuplemento[] = [
  {
    id: 'l1',
    nome: 'NutriMax Suplementos',
    logoIcon: 'medkit',
    produtos: [
      { id: 'pr1', nome: 'Whey Protein Concentrado 900g', preco: 149.90, categoria: 'Proteína' },
      { id: 'pr2', nome: 'Creatina Monohidratada 300g', preco: 89.90, categoria: 'Performance' },
    ],
  },
  {
    id: 'l2',
    nome: 'Vida Fit Store',
    logoIcon: 'leaf',
    produtos: [
      { id: 'pr3', nome: 'BCAA 2:1:1 120 cáps', preco: 59.90, categoria: 'Aminoácidos' },
      { id: 'pr4', nome: 'Multivitamínico Esportivo', preco: 45.00, categoria: 'Vitaminas' },
    ],
  },
];
