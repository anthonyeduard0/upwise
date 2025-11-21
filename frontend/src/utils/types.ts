// frontend/src/utils/types.ts
export type Page = 'login' | 'dashboard' | 'activities' | 'progress' | 'profile' | 'rewards';

export type UserLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface UserData {
  id: number; // Adicionado ID que vem do banco
  name: string;
  email: string;
  level: UserLevel;
  score: number;
  totalActivities: number;
  accuracy: number;
}

export interface Question {
  id: number;
  question: string; // O backend manda como "question" no to_dict, mas no banco é statement
  options: string[];
  difficulty: 'fácil' | 'médio' | 'difícil';
  topic?: string;
}

export interface QuizResult {
    score: number;
    total: number;
    accuracy: number;
    feedbackMessage: string;
    nextLevel: 'fácil' | 'médio' | 'difícil';
    newScore: number; // Adicionado para feedback visual
}