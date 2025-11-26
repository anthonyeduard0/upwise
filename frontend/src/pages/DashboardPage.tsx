// frontend/src/pages/DashboardPage.tsx
import React from 'react';
import { ArrowRight, BookOpen, Award, Activity } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import StatCard from '../components/StatCard.tsx';
import type { UserData, Page } from '../utils/types.ts';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardPageProps {
  user: UserData;
  setCurrentPage: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, setCurrentPage }) => {
  
  const totalQuestions = user.totalActivities; 
  const correctAnswers = Math.round(totalQuestions * (user.accuracy / 100));
  const wrongAnswers = totalQuestions - correctAnswers;

  const chartData = {
    labels: ['Acertos', 'Erros'],
    datasets: [
      {
        data: [correctAnswers, wrongAnswers],
        backgroundColor: [
          'rgba(74, 222, 128, 0.8)', 
          'rgba(248, 113, 113, 0.8)', 
        ],
        borderColor: [
          'rgba(74, 222, 128, 1)',
          'rgba(248, 113, 113, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#e5e7eb' } 
      }
    },
    cutout: '70%', 
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-8">Olá, {user.name.split(' ')[0]}! 👋</h2>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Pontuação Total" value={user.score} icon={Award} color="bg-indigo-600" />
        <StatCard title="Questões Respondidas" value={user.totalActivities} icon={BookOpen} color="bg-purple-600" />
        <StatCard title="Nível Atual" value={user.level} icon={Activity} color="bg-pink-600" />
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-around">
          <div className="mb-6 md:mb-0 md:w-1/2">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">Sua Precisão</h3>
            <p className="text-gray-400 mb-4">
              Veja como está seu desempenho geral nas atividades.
            </p>
            <div className="text-4xl font-bold text-white">
              {user.accuracy}% <span className="text-sm font-normal text-gray-500">de aproveitamento</span>
            </div>
          </div>
          
          <div className="w-48 h-48 relative">
            {totalQuestions > 0 ? (
                <Doughnut data={chartData} options={chartOptions} />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm text-center">
                    Sem dados suficientes ainda.
                </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-8 rounded-xl shadow-xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Pronto para evoluir?</h3>
              <p className="text-indigo-200 mb-6">
                O Upwise selecionou novas questões nível <strong className="text-white uppercase">{user.level}</strong> para você.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('activities')}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-indigo-700 bg-white hover:bg-gray-100 transition duration-300 transform hover:scale-[1.02]"
            >
              Iniciar Atividade
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;