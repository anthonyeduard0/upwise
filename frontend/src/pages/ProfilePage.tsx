// frontend/src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { User, Mail, Save, GraduationCap, Trophy, Target } from 'lucide-react';
import type { UserData, Page } from '../utils/types.ts';

interface ProfilePageProps {
  user: UserData;
  setCurrentPage: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  // Estado local para edição (apenas visual por enquanto)
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      // Chama a API para salvar (criamos essa rota update_user_profile no backend)
      const response = await fetch(`http://localhost:5000/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      if (response.ok) {
        setMessage('Perfil atualizado com sucesso!');
        user.name = name; // Atualiza o objeto local (idealmente usaria setUser do App)
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao atualizar perfil.');
      }
    } catch (error) {
      setMessage('Erro de conexão.');
    }
  };

  return (
    <div className="p-6 md:p-10 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-8">Meu Perfil</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cartão de Edição de Dados */}
        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mr-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{user.name}</h3>
              <p className="text-indigo-400">{user.level}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={name}
                  disabled={!isEditing}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 block w-full rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled={!isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 block w-full rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {message && (
              <p className={`text-sm ${message.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
            )}

            <div className="pt-4 flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    <Save size={18} className="mr-2" /> Salvar
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setName(user.name); setEmail(user.email); }}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cartão de Resumo de Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
              <Trophy className="mr-2 text-yellow-500" /> Suas Conquistas
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">Pontuação Atual</span>
                    <span className="font-bold text-yellow-400">{user.score} XP</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">Precisão</span>
                    <span className="font-bold text-green-400">{user.accuracy}%</span>
                </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
              <GraduationCap className="mr-2 text-purple-500" /> Detalhes do Nível
            </h4>
            <p className="text-sm text-gray-400 mb-4">
                Seu nível atual determina a dificuldade das questões que o sistema seleciona para você.
            </p>
            <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                    className={`h-4 rounded-full ${user.level === 'Iniciante' ? 'bg-green-500 w-1/3' : user.level === 'Intermediário' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'}`}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Iniciante</span>
                <span>Intermediário</span>
                <span>Avançado</span>
            </div>
            <div className="mt-4 text-center">
                <span className="px-3 py-1 bg-gray-700 rounded text-sm font-bold text-white border border-gray-600">
                    {user.level}
                </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;