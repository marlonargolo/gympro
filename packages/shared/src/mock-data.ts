import type {
  Professional,
  Student,
  Workout,
  ScheduledSession,
  NutritionPlan,
  WorkoutLog,
  ProgressEntry,
  Conversation,
} from './types';

// ─── Professionals ───────────────────────────────────────────────────────────

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'pro_1',
    name: 'Carlos Mendes',
    email: 'carlos@gympro.app',
    role: 'personal',
    specialty: 'personal',
    cref: '012345-G/SP',
    bio: 'Personal trainer com 8 anos de experiência em hipertrofia e emagrecimento.',
    studentIds: ['stu_1', 'stu_2', 'stu_3'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'pro_2',
    name: 'Ana Lima',
    email: 'ana@gympro.app',
    role: 'nutritionist',
    specialty: 'both',
    crn: '12345/SP',
    cref: '054321-G/SP',
    bio: 'Nutricionista esportiva e personal trainer, especialista em nutrição funcional.',
    studentIds: ['stu_1', 'stu_3', 'stu_4'],
    createdAt: '2024-01-12T08:00:00Z',
  },
];

// ─── Students ────────────────────────────────────────────────────────────────

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'stu_1',
    name: 'Marlon Argolo',
    email: 'marlon@gympro.app',
    role: 'student',
    goal: 'hypertrophy',
    level: 'intermediate',
    personalId: 'pro_1',
    nutritionistId: 'pro_2',
    plan: 'pro',
    metrics: [
      { weight: 82, height: 178, bodyFat: 18, muscleMass: 38, recordedAt: '2024-10-01T08:00:00Z' },
      { weight: 80.5, height: 178, bodyFat: 16.5, muscleMass: 39, recordedAt: '2024-10-14T08:00:00Z' },
    ],
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'stu_2',
    name: 'Fernanda Costa',
    email: 'fernanda@gympro.app',
    role: 'student',
    goal: 'weight_loss',
    level: 'beginner',
    personalId: 'pro_1',
    plan: 'pro',
    metrics: [
      { weight: 68, height: 165, bodyFat: 28, recordedAt: '2024-10-01T08:00:00Z' },
      { weight: 66.8, height: 165, bodyFat: 26.5, recordedAt: '2024-10-14T08:00:00Z' },
    ],
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'stu_3',
    name: 'Rafael Souza',
    email: 'rafael@gympro.app',
    role: 'student',
    goal: 'hypertrophy',
    level: 'advanced',
    personalId: 'pro_1',
    nutritionistId: 'pro_2',
    plan: 'pro',
    metrics: [
      { weight: 90, height: 182, bodyFat: 12, muscleMass: 48, recordedAt: '2024-10-01T08:00:00Z' },
    ],
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'stu_4',
    name: 'Juliana Martins',
    email: 'juliana@gympro.app',
    role: 'student',
    goal: 'health',
    level: 'beginner',
    nutritionistId: 'pro_2',
    plan: 'free',
    metrics: [
      { weight: 72, height: 168, bodyFat: 30, recordedAt: '2024-10-05T08:00:00Z' },
    ],
    createdAt: '2024-03-10T08:00:00Z',
  },
];

// ─── Workouts ────────────────────────────────────────────────────────────────

export const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'wkt_1',
    name: 'Peito & Tríceps',
    muscleGroups: ['chest', 'triceps'],
    durationMinutes: 55,
    level: 'intermediate',
    createdBy: 'pro_1',
    assignedTo: 'stu_1',
    createdAt: '2024-10-01T08:00:00Z',
    exercises: [
      { id: 'ex_1', name: 'Supino Reto', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'ex_2', name: 'Supino Inclinado Halteres', sets: 3, reps: '10-12', restSeconds: 75 },
      { id: 'ex_3', name: 'Crucifixo', sets: 3, reps: '12-15', restSeconds: 60 },
      { id: 'ex_4', name: 'Tríceps Pulley', sets: 4, reps: '10-12', restSeconds: 60 },
      { id: 'ex_5', name: 'Tríceps Francês', sets: 3, reps: '10-12', restSeconds: 60 },
    ],
  },
  {
    id: 'wkt_2',
    name: 'Costas & Bíceps',
    muscleGroups: ['back', 'biceps'],
    durationMinutes: 50,
    level: 'intermediate',
    createdBy: 'pro_1',
    assignedTo: 'stu_1',
    createdAt: '2024-10-01T08:00:00Z',
    exercises: [
      { id: 'ex_6', name: 'Puxada Frontal', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'ex_7', name: 'Remada Curvada', sets: 4, reps: '8-10', restSeconds: 90 },
      { id: 'ex_8', name: 'Remada Unilateral', sets: 3, reps: '10-12', restSeconds: 60 },
      { id: 'ex_9', name: 'Rosca Direta', sets: 3, reps: '10-12', restSeconds: 60 },
      { id: 'ex_10', name: 'Rosca Martelo', sets: 3, reps: '10-12', restSeconds: 60 },
    ],
  },
  {
    id: 'wkt_3',
    name: 'HIIT Cardio',
    muscleGroups: ['cardio', 'full_body'],
    durationMinutes: 30,
    level: 'advanced',
    createdBy: 'pro_1',
    assignedTo: 'stu_3',
    createdAt: '2024-10-02T08:00:00Z',
    exercises: [
      { id: 'ex_11', name: 'Burpee', sets: 4, reps: '30s', restSeconds: 30 },
      { id: 'ex_12', name: 'Mountain Climber', sets: 4, reps: '30s', restSeconds: 30 },
      { id: 'ex_13', name: 'Jump Squat', sets: 4, reps: '30s', restSeconds: 30 },
      { id: 'ex_14', name: 'Box Jump', sets: 4, reps: '30s', restSeconds: 30 },
    ],
  },
];

// ─── Scheduled Sessions ──────────────────────────────────────────────────────

export const MOCK_SESSIONS: ScheduledSession[] = [
  { id: 'sess_1', studentId: 'stu_1', professionalId: 'pro_1', workoutId: 'wkt_1', weekDay: 'monday', time: '07:00' },
  { id: 'sess_2', studentId: 'stu_1', professionalId: 'pro_1', workoutId: 'wkt_2', weekDay: 'wednesday', time: '07:00' },
  { id: 'sess_3', studentId: 'stu_2', professionalId: 'pro_1', workoutId: 'wkt_1', weekDay: 'tuesday', time: '06:00' },
  { id: 'sess_4', studentId: 'stu_2', professionalId: 'pro_1', workoutId: 'wkt_2', weekDay: 'thursday', time: '06:00' },
  { id: 'sess_5', studentId: 'stu_3', professionalId: 'pro_1', workoutId: 'wkt_3', weekDay: 'friday', time: '18:00' },
];

// ─── Nutrition Plans ─────────────────────────────────────────────────────────

export const MOCK_NUTRITION_PLANS: NutritionPlan[] = [
  {
    id: 'nut_1',
    studentId: 'stu_1',
    nutritionistId: 'pro_2',
    name: 'Plano Hipertrofia — Marlon',
    dailyCalories: 3200,
    dailyProtein: 180,
    dailyCarbs: 380,
    dailyFat: 90,
    startDate: '2024-10-01',
    createdAt: '2024-10-01T08:00:00Z',
    meals: [
      {
        type: 'breakfast',
        time: '06:30',
        foods: [
          { name: 'Ovos mexidos', quantity: '4 unidades', calories: 280, protein: 24, carbs: 2, fat: 20 },
          { name: 'Pão integral', quantity: '2 fatias', calories: 160, protein: 8, carbs: 30, fat: 2 },
          { name: 'Banana', quantity: '1 unidade', calories: 90, protein: 1, carbs: 23, fat: 0 },
        ],
      },
      {
        type: 'lunch',
        time: '12:00',
        foods: [
          { name: 'Frango grelhado', quantity: '200g', calories: 330, protein: 62, carbs: 0, fat: 7 },
          { name: 'Arroz integral', quantity: '150g', calories: 195, protein: 4, carbs: 42, fat: 1 },
          { name: 'Brócolis', quantity: '100g', calories: 35, protein: 3, carbs: 7, fat: 0 },
        ],
      },
    ],
  },
];

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export const MOCK_WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: 'log_1',
    workoutId: 'wkt_1',
    studentId: 'stu_1',
    date: '2024-10-14T07:00:00Z',
    durationMinutes: 58,
    rating: 4,
    exercises: [
      { exerciseId: 'ex_1', setsCompleted: 4, repsPerSet: [10, 9, 8, 8], weightKgPerSet: [80, 80, 82, 82] },
      { exerciseId: 'ex_2', setsCompleted: 3, repsPerSet: [12, 11, 10], weightKgPerSet: [22, 22, 24] },
    ],
  },
  {
    id: 'log_2',
    workoutId: 'wkt_2',
    studentId: 'stu_1',
    date: '2024-10-12T07:00:00Z',
    durationMinutes: 52,
    rating: 5,
    exercises: [
      { exerciseId: 'ex_6', setsCompleted: 4, repsPerSet: [10, 10, 9, 8], weightKgPerSet: [60, 60, 65, 65] },
    ],
  },
];

// ─── Progress ────────────────────────────────────────────────────────────────

export const MOCK_PROGRESS: ProgressEntry[] = [
  {
    id: 'prog_1',
    studentId: 'stu_1',
    date: '2024-10-01',
    metrics: { weight: 82, height: 178, bodyFat: 18, muscleMass: 38, recordedAt: '2024-10-01T08:00:00Z' },
    workoutsThisMonth: 8,
    nutritionAdherence: 80,
  },
  {
    id: 'prog_2',
    studentId: 'stu_1',
    date: '2024-10-14',
    metrics: { weight: 80.5, height: 178, bodyFat: 16.5, muscleMass: 39, recordedAt: '2024-10-14T08:00:00Z' },
    workoutsThisMonth: 12,
    nutritionAdherence: 85,
  },
];

// ─── Conversations ────────────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantIds: ['pro_1', 'stu_1'],
    updatedAt: '2024-10-14T09:30:00Z',
    lastMessage: {
      id: 'msg_3',
      conversationId: 'conv_1',
      senderId: 'stu_1',
      text: 'Consegui bater os 82kg no supino hoje! 🔥',
      sentAt: '2024-10-14T09:30:00Z',
    },
  },
  {
    id: 'conv_2',
    participantIds: ['pro_1', 'stu_2'],
    updatedAt: '2024-10-13T18:00:00Z',
    lastMessage: {
      id: 'msg_6',
      conversationId: 'conv_2',
      senderId: 'pro_1',
      text: 'Ótimo progresso Fernanda! Continue assim 💪',
      sentAt: '2024-10-13T18:00:00Z',
    },
  },
];
