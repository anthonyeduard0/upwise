import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import type { UserData, Page } from '../utils/types.ts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressPageProps {
  user: UserData;
  setCurrentPage: (page: Page) => void;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ user }) => {
  const [historyData, setHistoryData] = useState<any>(null);
  const [topicData, setTopicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/progress/${user.id}`);
        const data = await response.json();

        // Verifica se há dados de histórico para montar o gráfico de linha
        if (data.history && data.history.labels && data.history.labels.length > 0) {
            setHistoryData({
            labels: data.history.labels,
            datasets: [
                {
                label: 'Precisão Diária (%)',
                data: data.history.data,
                borderColor: 'rgb(147, 51, 234)', 
                backgroundColor: 'rgba(147, 51, 234, 0.2)',
                tension: 0.4, 
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: 'rgb(147, 51, 234)',
                pointHoverBackgroundColor: 'rgb(147, 51, 234)',
                pointBorderWidth: 2,
                pointRadius: 6,
                },
            ],
            });
        }

        // Verifica se há dados de tópicos para montar o gráfico de barras
        if (data.topics && data.topics.labels && data.topics.labels.length > 0) {
            setTopicData({
            labels: data.topics.labels,
            datasets: [
                {
                label: 'Desempenho por Matéria (%)',
                data: data.topics.data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                ],
                borderRadius: 6,
                },
            ],
            });
        }

      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false }
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
        y: { ticks: { color: '#e2e8f0', font: { weight: 'bold' as const } } }
    }
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">Relatório de Progresso 📈</h2>
      <p className="text-gray-400 mb-8">Acompanhe sua evolução diária e suas habilidades atuais.</p>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-purple-500 shadow-lg">
            <div className="flex items-center gap-3 mb-1">
                <Target className="text-purple-400" size={20} />
                <span className="text-gray-400 text-sm font-medium">Precisão Geral</span>
            </div>
            <p className="text-2xl font-bold text-white">{user.accuracy}%</p>
        </div>
        
        <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-indigo-500 shadow-lg">
            <div className="flex items-center gap-3 mb-1">
                <TrendingUp className="text-indigo-400" size={20} />
                <span className="text-gray-400 text-sm font-medium">Total de Pontos</span>
            </div>
            <p className="text-2xl font-bold text-white">{user.score}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-pink-500 shadow-lg">
            <div className="flex items-center gap-3 mb-1">
                <Calendar className="text-pink-400" size={20} />
                <span className="text-gray-400 text-sm font-medium">Atividades</span>
            </div>
            <p className="text-2xl font-bold text-white">{user.totalActivities}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Temporal */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2"><TrendingUp size={20}/> Evolução Diária</h3>
            <div className="flex-1 min-h-[250px] w-full relative">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Carregando...</div>
            ) : historyData ? (
                <Line options={lineOptions} data={historyData} />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <p>Sem dados de histórico suficientes.</p>
                    <p className="text-xs mt-2 opacity-60">Complete atividades em dias diferentes para ver o gráfico.</p>
                </div>
            )}
            </div>
        </div>

        {/* Gráfico por Tópico (Imediato) */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2"><Zap size={20} className="text-yellow-400"/> Desempenho por Matéria</h3>
            <div className="flex-1 min-h-[250px] w-full relative">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Carregando...</div>
            ) : topicData ? (
                <Bar options={barOptions} data={topicData} />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <p>Complete atividades para ver suas forças.</p>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;