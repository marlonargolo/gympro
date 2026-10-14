// ─── Core user types ────────────────────────────────────────────────────────

export type UserRole = 'student' | 'personal' | 'nutritionist';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

// ─── Professional ────────────────────────────────────────────────────────────

export type ProfessionalSpecialty = 'personal' | 'nutritionist' | 'both';

export interface Professional extends User {
  role: 'personal' | 'nutritionist';
  specialty: ProfessionalSpecialty;
  cref?: string;           // Registro personal
  crn?: string;            // Registro nutricionista
  bio: string;
  studentIds: string[];
}

// ─── Student ─────────────────────────────────────────────────────────────────

export type FitnessGoal =
  | 'hypertrophy'
  | 'weight_loss'
  | 'endurance'
  | 'flexibility'
  | 'health';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface BodyMetrics {
  weight: number;       // kg
  height: number;       // cm
  bodyFat?: number;     // %
  muscleMass?: number;  // kg
  recordedAt: string;
}

export interface Student extends User {
  role: 'student';
  goal: FitnessGoal;
  level: FitnessLevel;
  personalId?: string;
  nutritionistId?: string;
  metrics: BodyMetrics[];
  plan: 'free' | 'pro';
}

// ─── Workout ─────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full_body';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;          // "10-12" or "30s"
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
}

export interface Workout {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
  durationMinutes: number;
  level: FitnessLevel;
  createdBy: string;     // professionalId
  assignedTo?: string;   // studentId (null = template)
  createdAt: string;
}

// ─── Workout Log ─────────────────────────────────────────────────────────────

export interface ExerciseLog {
  exerciseId: string;
  setsCompleted: number;
  repsPerSet: number[];
  weightKgPerSet: number[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  studentId: string;
  date: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ScheduledSession {
  id: string;
  studentId: string;
  professionalId: string;
  workoutId: string;
  weekDay: WeekDay;
  time: string;          // "07:00"
  notes?: string;
}

// ─── Nutrition ───────────────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper';

export interface FoodItem {
  name: string;
  quantity: string;      // "150g", "1 unidade"
  calories: number;
  protein: number;       // g
  carbs: number;         // g
  fat: number;           // g
}

export interface Meal {
  type: MealType;
  time: string;
  foods: FoodItem[];
}

export interface NutritionPlan {
  id: string;
  studentId: string;
  nutritionistId: string;
  name: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  meals: Meal[];
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  id: string;
  studentId: string;
  date: string;
  metrics: BodyMetrics;
  workoutsThisMonth: number;
  nutritionAdherence?: number;  // 0–100%
  notes?: string;
}

// ─── Messaging ───────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];  // [professionalId, studentId]
  lastMessage?: Message;
  updatedAt: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | 'new_workout'
  | 'new_nutrition_plan'
  | 'session_reminder'
  | 'progress_feedback'
  | 'message';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  readAt?: string;
  createdAt: string;
}
