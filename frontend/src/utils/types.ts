// Tipos para navegação e estado geral
export type Page = 'login' | 'dashboard' | 'activities' | 'progress' | 'profile' | 'rewards';

export type UserLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface UserData {
  name: string;
  email: string;
  level: UserLevel;
  score: number;
  totalActivities: number;
  accuracy: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
}

export interface QuizResult {
    score: number;
    total: number;
    accuracy: number;
    feedbackMessage: string;
    nextLevel: 'fácil' | 'médio' | 'difícil';
}

// Dados Mock
export const mockUser: UserData = {
  name: 'Aluno Exemplo',
  email: 'aluno@upwise.edu',
  level: 'Intermediário',
  score: 450,
  totalActivities: 13,
  accuracy: 75.8,
};

export const initialQuestions: Question[] = [
  { id: 1, question: "Qual é o principal componente do núcleo de uma célula eucariótica?", options: ["Mitocôndria", "Membrana Plasmática", "Núcleo", "Ribossomo"], correctAnswer: "Núcleo", difficulty: "fácil" },
  { id: 2, question: "O que é React Hooks?", options: ["Funções que permitem usar o state e outros recursos do React sem escrever uma classe", "Uma biblioteca de CSS", "Um componente de roteamento", "Um novo tipo de componente de classe"], correctAnswer: "Funções que permitem usar o state e outros recursos do React sem escrever uma classe", difficulty: "médio" },
  { id: 3, question: "Qual lei de Newton descreve que a força é igual à massa vezes a aceleração ($$F=m \cdot a$$)?", options: ["Primeira Lei", "Segunda Lei", "Terceira Lei", "Lei da Gravitação"], correctAnswer: "Segunda Lei", difficulty: "difícil" },
  { id: 4, question: "Quem escreveu o clássico 'Dom Quixote'?", options: ["Gabriel García Márquez", "Miguel de Cervantes", "William Shakespeare", "Jorge Luis Borges"], correctAnswer: "Miguel de Cervantes", difficulty: "fácil" },
  { id: 5, question: "O que é o Teorema de Pitágoras?", options: ["$$A = \pi r^2$$", "$$a^2 + b^2 = c^2$$", "$$E = mc^2$$", "$$H_2O$$"], correctAnswer: "$$a^2 + b^2 = c^2$$", difficulty: "médio" },
];