// frontend/src/utils/types.ts
export type Page = 'login' | 'dashboard' | 'activities' | 'progress' | 'profile' | 'rewards' | 'subscription';
export type UserLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface UserData {
  id: number;
  name: string;
  email: string;
  level: UserLevel;
  score: number;
  totalActivities: number;
  accuracy: number;
  isPremium: boolean;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  difficulty: 'fácil' | 'médio' | 'difícil';
  topic?: string;
}

export interface CorrectionDetail {
    question_id: number;
    correct_answer: string;
    user_answer: string;
    is_correct: boolean;
}

export interface QuizResult {
    score: number;
    total: number;
    accuracy: number;
    feedbackMessage: string;
    nextLevel: 'fácil' | 'médio' | 'difícil';
    newScore: number;
    ai_feedback?: string;
    new_achievements?: string[];
    correction_details?: CorrectionDetail[];
}

export interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: string;
    date: string;
}