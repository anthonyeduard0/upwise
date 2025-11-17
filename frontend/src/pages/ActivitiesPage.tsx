import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import type { UserData, Page, QuizResult } from '../utils/types.ts'; // CORRIGIDO: Adicionado import type
import { initialQuestions } from '../utils/types.ts'; // initialQuestions não é um tipo, mantém import normal

interface ActivitiesPageProps {
  user: UserData;
  setCurrentPage: (page: Page) => void;
}

const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ user, setCurrentPage }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(new Array(initialQuestions.length).fill(null));
  const [quizFinished, setQuizFinished] = useState<QuizResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = initialQuestions[currentQuestionIndex];
  const totalQuestions = initialQuestions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
        console.log("Por favor, selecione uma opção antes de prosseguir.");
        return;
    }
    
    // Salva a resposta do usuário
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(newAnswers);

    // Reinicia a opção selecionada para a próxima pergunta
    setSelectedOption(null);

    // Avança para a próxima pergunta ou finaliza o quiz
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (answers: (string | null)[]) => {
    let score = 0;
    
    initialQuestions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    const accuracy = (score / totalQuestions) * 100;
    
    // Lógica Adaptativa Simulada (Funcionalidade 3)
    let feedbackMessage = '';
    let nextLevel: 'fácil' | 'médio' | 'difícil' = 'médio'; 
    
    if (accuracy >= 80) { // Acertou ≥ 80% (ex: 4 ou 5/5)
        feedbackMessage = "Fantástico! Seu desempenho foi excelente. Vamos aumentar o nível na próxima para um novo desafio. Você está indo muito bem, continue assim! (Funcionalidade 5)";
        nextLevel = 'difícil';
    } else if (accuracy >= 60) { // Acertou entre 60% e 79% (ex: 3/5)
        feedbackMessage = "Muito bom! Você está no caminho certo. Continue praticando, e o sistema manterá o nível de desafio para consolidar seu aprendizado. (Funcionalidade 5)";
        nextLevel = 'médio';
    } else { // Acertou < 60% (ex: 0, 1 ou 2/5)
        feedbackMessage = "Não se preocupe! Identificamos algumas áreas de melhoria. Que tal revisar o conteúdo anterior antes de avançar? A próxima atividade será um pouco mais focada no básico. (Funcionalidade 5)";
        nextLevel = 'fácil';
    }
    
    const quizResult: QuizResult = {
        score,
        total: totalQuestions,
        accuracy,
        feedbackMessage,
        nextLevel,
    };
    
    setQuizFinished(quizResult);
    
    // ATENÇÃO: Em um projeto real, essa lógica de atualização deve ser feita
    // no contexto global ou via API (backend) para garantir que a mudança
    // seja refletida em todas as telas (como o Dashboard).
    // Aqui, estamos simulando a atualização no objeto global (mockUser).
    user.totalActivities += 1;
    user.score += score * 10;
    user.accuracy = parseFloat(((user.accuracy * (user.totalActivities - 1) + accuracy) / user.totalActivities).toFixed(1));
    user.level = nextLevel === 'difícil' ? 'Avançado' : nextLevel === 'médio' ? 'Intermediário' : 'Iniciante';
  };
  
  // Componente de Resultado
  if (quizFinished) {
    const isSuccess = quizFinished.accuracy >= 60;
    const feedbackColor = isSuccess ? 'text-green-400' : 'text-yellow-400';
    
    return (
        <div className="p-6 md:p-10 flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                <div className={`p-4 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${isSuccess ? 'bg-green-600' : 'bg-yellow-600'}`}>
                    {isSuccess ? <CheckCircle size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">Resultado da Atividade</h2>
                
                <p className="text-5xl font-extrabold mb-6" style={{color: '#8B5CF6'}}>{quizFinished.accuracy.toFixed(1)}%</p>
                <p className="text-xl font-medium text-gray-200 mb-6">{quizFinished.score} / {quizFinished.total} Acertos</p>
                
                {/* Feedback Automático e Recomendações (Funcionalidade 5) */}
                <div className={`p-4 rounded-lg border-l-4 mb-8 ${isSuccess ? 'border-green-400 bg-green-900/50' : 'border-yellow-400 bg-yellow-900/50'}`}>
                    <p className={`font-semibold ${feedbackColor}`}>Feedback do Upwise:</p>
                    <p className="text-gray-300 mt-2">{quizFinished.feedbackMessage}</p>
                </div>
                
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="w-full mt-4 flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]"
                >
                    Voltar para o Dashboard
                    <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
        </div>
    );
  }

  // Componente de Quiz
  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">Atividade Adaptativa (5 Questões)</h2>
      <div className="mb-6 text-sm text-gray-400 flex justify-between items-center">
        <span>Nível Atual: <span className="font-semibold text-indigo-400">{user.level}</span></span>
        <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
      </div>
      
      {/* Barra de Progresso */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
        <div className="h-2.5 rounded-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                ${selectedOption === option 
                  ? 'border-purple-500 bg-purple-900 text-white shadow-lg' 
                  : 'border-gray-700 bg-gray-700 hover:border-indigo-500 text-gray-300'
                }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={selectedOption === null}
          className={`w-full mt-8 flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white transition duration-300 transform hover:scale-[1.01]
            ${selectedOption !== null 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-gray-600 cursor-not-allowed'
            }`}
        >
          {currentQuestionIndex < totalQuestions - 1 ? 'Próxima Questão' : 'Finalizar Atividade'}
          <ArrowRight size={20} className="ml-2" />
        </button>
        
        {selectedOption === null && <p className="mt-4 text-center text-sm text-gray-400">Selecione uma opção para continuar.</p>}
      </div>
    </div>
  );
};

export default ActivitiesPage;