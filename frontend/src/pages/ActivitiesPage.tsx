import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, XCircle, Loader2, Sparkles, Trophy, X } from 'lucide-react';
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
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/activities/next/${user.id}`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchQuestions();
  }, [user.id]);

  const handleNextQuestion = () => {
    if (!selectedOption || !questions[currentQuestionIndex]) return;
    const updated = [...userAnswers, { question_id: questions[currentQuestionIndex].id, answer: selectedOption }];
    setUserAnswers(updated);
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(updated);
    }
  };

  const submitQuiz = async (finalAnswers: any[]) => {
    setLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/activities/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, answers: finalAnswers })
        });
        const result = await res.json();
        
        setUser({ ...user, score: result.new_score, level: result.new_level, accuracy: result.accuracy, totalActivities: user.totalActivities + finalAnswers.length });

        if (result.new_achievements?.length > 0) {
            setNewBadges(result.new_achievements);
            setShowBadgeModal(true);
        }

        setQuizFinished({
            score: Math.round((result.round_accuracy / 100) * finalAnswers.length),
            total: finalAnswers.length,
            accuracy: result.round_accuracy,
            feedbackMessage: result.round_accuracy >= 60 ? "Mandou bem!" : "Vamos revisar.",
            nextLevel: result.new_level,
            newScore: result.new_score,
            ai_feedback: result.ai_feedback,
            correction_details: result.correction_details // Guarda o gabarito oficial
        });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  
  const cleanText = (text: string) => text.replace(/^[A-Da-d1-4][\)\.]\s*/, '').trim();

  if (loading) return <div className="h-full flex items-center justify-center flex-col gap-4"><Loader2 size={48} className="animate-spin text-purple-500" /><p className="text-gray-400 animate-pulse">Analisando respostas...</p></div>;

  if (quizFinished) {
    return (
        <div className="p-6 md:p-10 flex-1 overflow-auto relative">
            {showBadgeModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gradient-to-br from-yellow-600 to-orange-700 p-1 rounded-2xl shadow-2xl max-w-sm w-full animate-bounce-in">
                        <div className="bg-gray-900 rounded-xl p-8 text-center relative">
                            <button onClick={() => setShowBadgeModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X size={24} /></button>
                            <div className="mx-auto bg-yellow-500/20 w-20 h-20 rounded-full flex items-center justify-center mb-4"><Trophy size={40} className="text-yellow-400" /></div>
                            <h3 className="text-2xl font-bold text-white mb-2">Parabéns!</h3>
                            <div className="space-y-2">{newBadges.map((b, i) => <div key={i} className="bg-gray-800 p-3 rounded-lg font-semibold text-yellow-200 border border-yellow-500/30">{b}</div>)}</div>
                            <button onClick={() => setShowBadgeModal(false)} className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition">Incrível!</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border border-gray-700">
                    <div className={`p-4 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${quizFinished.accuracy >= 60 ? 'bg-green-600' : 'bg-yellow-600'}`}>
                        {quizFinished.accuracy >= 60 ? <CheckCircle size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Atividade Concluída</h2>
                    <p className="text-5xl font-extrabold mb-4" style={{color: '#8B5CF6'}}>{quizFinished.accuracy.toFixed(0)}%</p>
                    {quizFinished.ai_feedback && <div className="mt-6 p-4 rounded-lg border border-indigo-500/30 bg-indigo-900/20 text-left"><div className="flex items-center gap-2 mb-2 text-indigo-400"><Sparkles size={20} /><span className="font-bold text-xs uppercase tracking-wider">Análise da IA</span></div><p className="text-gray-200 italic text-sm">"{quizFinished.ai_feedback}"</p></div>}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white pl-2 border-l-4 border-purple-500">Gabarito da Rodada</h3>
                    {questions.map((q, index) => {
                        // Busca o detalhe da correção usando o ID da questão
                        const detail = quizFinished.correction_details?.find(d => d.question_id === q.id);
                        
                        // Se não achar (erro raro), define padrão
                        const isCorrect = detail?.is_correct ?? false;
                        const correctText = detail?.correct_answer || "Indisponível";
                        const userText = detail?.user_answer || "Não respondeu";

                        return (
                            <div key={q.id} className={`bg-gray-800 p-5 rounded-xl border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                                <div className="flex gap-3">
                                    <div className="mt-1">{isCorrect ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}</div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium mb-3">{index + 1}. {q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-900/20 text-green-200' : 'bg-red-900/20 text-red-200'}`}>
                                                <span className="block text-xs opacity-70 mb-1 font-bold uppercase">Sua Resposta</span>
                                                {cleanText(userText)}
                                            </div>
                                            {!isCorrect && (
                                                <div className="p-3 rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600">
                                                    <span className="block text-xs opacity-70 mb-1 font-bold uppercase text-indigo-400">Resposta Correta</span>
                                                    {cleanText(correctText)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pb-8">
                    <button onClick={() => setCurrentPage('dashboard')} className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transition transform hover:scale-105">Voltar para o Painel <ArrowRight size={20} className="ml-2" /></button>
                </div>
            </div>
        </div>
    );
  }

  if (questions.length === 0) return <div className="p-10 text-center text-white">Nenhuma questão encontrada.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Quiz <span className="text-purple-400">Adaptativo</span></h2>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">Nível {currentQuestion.difficulty}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-8"><div className="h-2 rounded-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div>
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="text-xl text-white font-medium leading-relaxed mb-8">{currentQuestion.question}</h3>
            <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => setSelectedOption(option)} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${selectedOption === option ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-gray-700 bg-gray-700/50 text-gray-300 hover:border-indigo-500 hover:bg-gray-700'}`}>
                <span>{cleanText(option)}</span>
                {selectedOption === option && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                </button>
            ))}
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={handleNextQuestion} disabled={selectedOption === null} className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 flex items-center ${selectedOption !== null ? 'bg-white text-gray-900 hover:bg-gray-200 shadow-lg transform hover:-translate-y-1' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                {currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Finalizar'} <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;