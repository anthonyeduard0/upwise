// frontend/src/pages/ActivitiesPage.tsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, XCircle, Loader2, BrainCircuit } from 'lucide-react'; // Import BrainCircuit
import type { UserData, Page, QuizResult, Question } from '../utils/types.ts';

interface ActivitiesPageProps {
  user: UserData;
  setUser: (user: UserData) => void;
  setCurrentPage: (page: Page) => void;
}

const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ user, setUser, setCurrentPage }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{question_id: number, answer: string}[]>([]);
  const [quizFinished, setQuizFinished] = useState<QuizResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/activities/next/${user.id}`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Erro ao buscar questões:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user.id]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (!selectedOption || !questions[currentQuestionIndex]) return;
    const currentQ = questions[currentQuestionIndex];
    const newAnswer = { question_id: currentQ.id, answer: selectedOption };
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: {question_id: number, answer: string}[]) => {
    setLoading(true);
    try {
        const response = await fetch('http://localhost:5000/api/activities/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                answers: finalAnswers
            })
        });
        
        const resultData = await response.json();
        
        const updatedUser = {
            ...user,
            score: resultData.new_score,
            level: resultData.new_level,
            accuracy: resultData.accuracy,
            totalActivities: user.totalActivities + finalAnswers.length
        };
        setUser(updatedUser);

        const isSuccess = resultData.round_accuracy >= 60;
        const feedback = isSuccess 
            ? "Excelente! Você dominou este tópico." 
            : "Bom esforço. Vamos praticar mais o básico.";

        const nextLvl = resultData.new_level === 'Avançado' ? 'difícil' : resultData.new_level === 'Intermediário' ? 'médio' : 'fácil';

        setQuizFinished({
            score: Math.round((resultData.round_accuracy / 100) * finalAnswers.length),
            total: finalAnswers.length,
            accuracy: resultData.round_accuracy,
            feedbackMessage: feedback,
            nextLevel: nextLvl,
            newScore: resultData.new_score,
            ai_feedback: resultData.ai_feedback // Pega o feedback da IA
        });

    } catch (error) {
        console.error("Erro ao enviar quiz:", error);
    } finally {
        setLoading(false);
    }
  };
  
  if (loading) {
      return (
          <div className="h-full flex items-center justify-center flex-col gap-4">
              <Loader2 size={48} className="animate-spin text-purple-500" />
              <p className="text-gray-400 animate-pulse">A IA está analisando suas respostas...</p>
          </div>
      );
  }

  if (quizFinished) {
    const isSuccess = quizFinished.accuracy >= 60;
    
    return (
        <div className="p-6 md:p-10 flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
                <div className={`p-4 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${isSuccess ? 'bg-green-600' : 'bg-yellow-600'}`}>
                    {isSuccess ? <CheckCircle size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">Atividade Concluída</h2>
                <p className="text-5xl font-extrabold mb-6" style={{color: '#8B5CF6'}}>{quizFinished.accuracy.toFixed(1)}%</p>
                
                {/* Feedback da IA */}
                {quizFinished.ai_feedback && (
                    <div className="p-6 rounded-lg border border-indigo-500/30 bg-indigo-900/20 mb-8 text-left">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <BrainCircuit size={20} />
                            <span className="font-bold text-sm uppercase tracking-wider">Feedback Inteligente</span>
                        </div>
                        <p className="text-gray-200 italic">"{quizFinished.ai_feedback}"</p>
                    </div>
                )}
                
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="w-full mt-4 flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
                >
                    Voltar para o Dashboard
                    <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
        </div>
    );
  }

  if (questions.length === 0) {
      return <div className="p-10 text-center text-white">Nenhuma questão encontrada para o seu nível no momento.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">Atividade Adaptativa</h2>
      <div className="mb-6 text-sm text-gray-400 flex justify-between items-center">
        <span>Nível: <span className="font-semibold text-indigo-400 uppercase">{currentQuestion.difficulty}</span></span>
        <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
      </div>
      
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
          {currentQuestionIndex < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Atividade'}
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ActivitiesPage;