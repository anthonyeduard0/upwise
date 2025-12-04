import React, { useState } from 'react';
import { Check, X, Sparkles, Star } from 'lucide-react';
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
        alert('Parabéns! Você agora é Upwise Premium! 🚀');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar assinatura.');
    } finally {
      setIsLoading(false);
    }
  };

  const Card = ({ title, price, features, active, popular, buttonText, onClick, disabled }: any) => (
    <div className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
      active 
        ? 'bg-indigo-900/40 border-indigo-500 shadow-2xl scale-105 z-10' 
        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg">
          <Star size={12} className="mr-1 fill-current" /> Popular
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        <p className="text-2xl font-bold text-white mt-2">{price}</p>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f: any, i: number) => (
          <li key={i} className="flex items-start text-sm">
            {f.included ? (
              <Check className="text-white mr-3 shrink-0" size={18} />
            ) : (
              <X className="text-gray-600 mr-3 shrink-0" size={18} />
            )}
            <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
          active
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
            : disabled
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-700/20 text-yellow-500 border border-yellow-700/50 hover:bg-yellow-700/30'
        }`}
      >
        {disabled ? 'Plano Atual' : isLoading && active ? 'Processando...' : buttonText}
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto bg-[#0B0C15] min-h-full flex flex-col items-center">
      <div className="text-center max-w-2xl mx-auto mb-16 mt-8">
        <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
          Assinaturas Upwise <Sparkles className="text-yellow-400" />
        </h2>
        <p className="text-gray-400">
          Invista no seu aprendizado e desbloqueie novas conquistas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
        {/* Plano Iniciante */}
        <Card
          title="Plano Iniciante - Grátis"
          price="R$ 0,00"
          features={[
            { text: "Acesso às atividades básicas", included: true },
            { text: 'Medalha "Primeiros Passos"', included: true },
            { text: "Sem certificados", included: false },
            { text: "Sem conteúdos avançados", included: false },
          ]}
          buttonText="Você já está nesse plano"
          disabled={true}
        />

        {/* Plano Premium */}
        <Card
          title="Premium"
          price="R$ 24,90/mês"
          active={true}
          popular={true}
          features={[
            { text: "Conteúdos completos", included: true },
            { text: "Certificados", included: true },
            { text: "+50% XP em tudo", included: true },
            { text: "Suporte prioritário", included: true },
          ]}
          buttonText={user.isPremium ? "Plano Atual" : "Assinar Agora"}
          onClick={handleSubscribe}
          disabled={user.isPremium}
        />

        {/* Plano Lifetime */}
        <Card
          title="Lifetime"
          price="R$ 199,00"
          features={[
            { text: "Acesso vitalício", included: true },
            { text: "Emblema dourado no perfil", included: true },
            { text: "Todas as atualizações liberadas", included: true },
          ]}
          buttonText="Obter Lifetime"
          onClick={() => alert('Em breve!')}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;