import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Shield, X } from 'lucide-react';
import type { UserData } from '../utils/types.ts';

interface SubscriptionPageProps {
  user: UserData;
  setUser: (user: UserData) => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ user, setUser }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        if (data.new_achievements && data.new_achievements.length > 0) {
             alert(`Parabéns! Você é PRO e desbloqueou: ${data.new_achievements.join(', ')}! 🚀`);
        } else {
             alert('Parabéns! Você agora é Upwise PRO! 🚀');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar assinatura.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto bg-gray-900 min-h-full">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Invista no seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Futuro</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Desbloqueie todo o potencial da plataforma com o plano Pro e acelere seu aprendizado.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Plano Gratuito */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl flex flex-col relative opacity-80 hover:opacity-100 transition duration-300">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">Básico</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-white">R$ 0</span>
              <span className="ml-1 text-xl font-medium text-gray-500">/mês</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-gray-300">
              <Check className="text-green-500 mr-3" size={20} /> Acesso a questões diárias
            </li>
            <li className="flex items-center text-gray-300">
              <Check className="text-green-500 mr-3" size={20} /> Acompanhamento de progresso básico
            </li>
            <li className="flex items-center text-gray-300">
              <Check className="text-green-500 mr-3" size={20} /> Modo claro/escuro
            </li>
            <li className="flex items-center text-gray-500">
              <X className="text-gray-600 mr-3" size={20} /> Feedback detalhado da IA
            </li>
            <li className="flex items-center text-gray-500">
              <X className="text-gray-600 mr-3" size={20} /> Certificados de conclusão
            </li>
          </ul>

          <button className="w-full py-3 px-4 rounded-xl border border-gray-600 text-gray-300 font-bold hover:bg-gray-700 transition cursor-not-allowed" disabled>
            Plano Atual
          </button>
        </div>

        {/* Plano PRO */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-1 shadow-2xl relative transform md:-translate-y-4 hover:scale-[1.02] transition duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Mais Popular
            </div>
            <div className="bg-gray-900 rounded-xl p-8 h-full flex flex-col">
                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-indigo-400 uppercase tracking-widest">Upwise PRO</h3>
                        <Crown className="text-yellow-400" size={24} />
                    </div>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-5xl font-extrabold text-white">R$ 29</span>
                        <span className="ml-1 text-xl font-medium text-gray-400">/mês</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Cancele quando quiser.</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center text-white">
                        <div className="bg-green-500/20 p-1 rounded-full mr-3"><Check className="text-green-400" size={16} /></div>
                        Tudo do plano Básico
                    </li>
                    <li className="flex items-center text-white">
                        <div className="bg-indigo-500/20 p-1 rounded-full mr-3"><Zap className="text-indigo-400" size={16} /></div>
                        <strong>Feedback ilimitado da IA</strong>
                    </li>
                    <li className="flex items-center text-white">
                        <div className="bg-purple-500/20 p-1 rounded-full mr-3"><Shield className="text-purple-400" size={16} /></div>
                        Sem anúncios e distrações
                    </li>
                    <li className="flex items-center text-white">
                        <div className="bg-yellow-500/20 p-1 rounded-full mr-3"><Star className="text-yellow-400" size={16} /></div>
                        Questões exclusivas de alto nível
                    </li>
                    <li className="flex items-center text-white">
                        <div className="bg-pink-500/20 p-1 rounded-full mr-3"><Crown className="text-pink-400" size={16} /></div>
                        Certificados oficiais
                    </li>
                </ul>

                {user.isPremium ? (
                    <button className="w-full py-4 px-4 rounded-xl bg-green-600 text-white font-bold shadow-lg cursor-default flex items-center justify-center" disabled>
                        <Check className="mr-2" size={20} /> Você já é PRO
                    </button>
                ) : (
                    <button 
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-900/50 transition duration-300 flex items-center justify-center group disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center">Processando...</span>
                        ) : (
                            <>
                                Assinar Agora <Zap size={20} className="ml-2 group-hover:text-yellow-300 transition-colors" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
      </div>
      
      <div className="text-center border-t border-gray-800 pt-8 pb-4">
          <p className="text-gray-500 text-sm">Pagamento seguro processado externamente. Dúvidas? Contate o suporte.</p>
      </div>
    </div>
  );
};

export default SubscriptionPage;