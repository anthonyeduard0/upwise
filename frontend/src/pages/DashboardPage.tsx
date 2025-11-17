import React from 'react';
import { ArrowRight, BookOpen, Award, BookA } from 'lucide-react';
import StatCard from '../components/StatCard.tsx';
import type { UserData, Page } from '../utils/types.ts'; // CORRIGIDO: Adicionado import type

interface DashboardPageProps {
  user: UserData;
  setCurrentPage: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, setCurrentPage }) => {
  // Simulação de renderização do Chart.js
  const ProgressChart = () => (
    <div className="bg-gray-700 p-6 rounded-xl shadow-inner h-64 flex items-center justify-center">
      <p className="text-indigo-300 italic">
        [Placeholder Chart.js: Gráfico de Progresso Aqui]
        <br/>
        Precisão: {user.accuracy}%
      </p>
    </div>
  );

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-8">Painel Principal</h2>

      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Pontuação Total" value={user.score} icon={Award} color="bg-indigo-600" />
        <StatCard title="Atividades Concluídas" value={user.totalActivities} icon={BookOpen} color="bg-purple-600" />
        <StatCard title="Nível Atual" value={user.level} icon={BookA} color="bg-pink-600" />
      </div>

      {/* Seção Principal de Progresso e Ação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Progresso (2/3 da largura em telas grandes) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Seu Desempenho Recente</h3>
            <ProgressChart />
            <p className="mt-4 text-sm text-gray-400">
              Acompanhe sua evolução. O sistema adapta as atividades com base nesses resultados.
            </p>
          </div>
        </div>

        {/* Card de Início Rápido (1/3 da largura em telas grandes) */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-8 rounded-xl shadow-xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Pronto para a Próxima?</h3>
              <p className="text-indigo-200 mb-6">
                O Upwise preparou a próxima rodada de atividades, adaptada ao seu nível atual de conhecimento.
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