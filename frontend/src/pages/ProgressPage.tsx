// frontend/src/pages/ProgressPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import type { UserData, Page } from '../utils/types.ts';

// Registrar componentes do gráfico de linha
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/progress/${user.id}`);
        const data = await response.json();

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Média de Precisão Diária (%)',
              data: data.data,
              borderColor: 'rgb(147, 51, 234)', // Roxo (Purple-600)
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              tension: 0.4, // Curva suave
              fill: true,
              pointBackgroundColor: '#fff',
              pointBorderColor: 'rgb(147, 51, 234)',
              pointHoverBackgroundColor: 'rgb(147, 51, 234)',
              pointBorderWidth: 2,
              pointRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#cbd5e1' }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">Relatório de Progresso 📈</h2>
      <p className="text-gray-400 mb-8">Acompanhe sua evolução dia a dia.</p>

      {/* Resumo Rápido */}
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
            <p className="text-2xl font-bold text-white">{user.totalActivities} <span className="text-xs font-normal text-gray-500">concluídas</span></p>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-6">Curva de Aprendizado</h3>
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-500">Carregando dados...</div>
          ) : chartData && chartData.labels.length > 0 ? (
            <Line options={options} data={chartData} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Ainda não há dados suficientes para gerar o gráfico de evolução.</p>
                <p className="text-sm mt-2">Continue praticando!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;