import React, { useEffect, useState } from 'react';
import { Trophy, Star, Flag, Lock, Zap, Crown, Crosshair, Gem } from 'lucide-react';
import type { UserData, Page, Achievement } from '../utils/types.ts';

interface RewardsPageProps {
  user: UserData;
  setCurrentPage: (page: Page) => void;
}

const RewardsPage: React.FC<RewardsPageProps> = ({ user }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Lista mestre de todas as conquistas possíveis para renderizar
  const allBadges = [
    { title: "Primeiros Passos", description: "Concluiu a primeira atividade.", icon: "flag" },
    { title: "Estudante Dedicado", description: "Alcançou 100 pontos de experiência.", icon: "star" },
    { title: "Mestre", description: "Chegou ao nível Avançado.", icon: "trophy" },
    { title: "Imparável", description: "20 questões respondidas.", icon: "target" },
    { title: "Maratonista", description: "50 questões respondidas.", icon: "zap" },
    { title: "Lendário", description: "Acumulou 1000 pontos XP.", icon: "crown" },
    { title: "Na Mosca!", description: "Acertou 100% em uma rodada.", icon: "crosshair" },
    { title: "Membro VIP", description: "Tornou-se um assinante Premium.", icon: "gem" }
  ];

  useEffect(() => {
    const fetchRewards = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/user/achievements/${user.id}`);
            const data = await res.json();
            setAchievements(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchRewards();
  }, [user.id]);

  const getIcon = (name: string, unlocked: boolean) => {
      const className = `w-8 h-8 ${unlocked ? 'text-yellow-400' : 'text-gray-500'}`;
      switch (name) {
          case 'trophy': return <Trophy className={className} />;
          case 'star': return <Star className={className} />;
          case 'flag': return <Flag className={className} />;
          case 'zap': return <Zap className={className} />;
          case 'crown': return <Crown className={className} />;
          case 'crosshair': return <Crosshair className={className} />;
          case 'gem': return <Gem className={className} />;
          default: return <Flag className={className} />;
      }
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto bg-gray-900 min-h-full">
      <h2 className="text-3xl font-bold text-gray-100 mb-2">Minhas Conquistas 🏆</h2>
      <p className="text-gray-400 mb-8">Colecione medalhas conforme você aprende e evolui.</p>

      {loading ? (
          <div className="text-white">Carregando conquistas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {allBadges.map((badge, idx) => {
                const unlocked = achievements.find(a => a.title === badge.title);
                
                return (
                    <div key={idx} className={`p-6 rounded-xl border transition-all duration-300 ${unlocked ? 'bg-gray-800 border-yellow-500/50 shadow-lg shadow-yellow-900/20 transform hover:-translate-y-1' : 'bg-gray-800/30 border-gray-700 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-full ${unlocked ? 'bg-yellow-900/30' : 'bg-gray-700'}`}>
                                {getIcon(badge.icon, !!unlocked)}
                            </div>
                            {!unlocked && <Lock size={16} className="text-gray-500" />}
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-400'}`}>{badge.title}</h3>
                        <p className="text-sm text-gray-400">{badge.description}</p>
                        {unlocked && (
                            <p className="text-xs text-yellow-500/80 mt-3 font-mono">Desbloqueado em {unlocked.date}</p>
                        )}
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;