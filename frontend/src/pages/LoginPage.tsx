import React, { useState } from 'react';
import type { Page } from '../utils/types.ts';
// Importa a imagem local ao invés de usar o placeholder
import logoIcon from '../assets/logo-icon.png'; 

interface LoginPageProps {
  setCurrentPage: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login/cadastro
    if (email && password) {
      if (isLogin) {
        // Simulação de sucesso
        setMessage('Login bem-sucedido! Redirecionando...');
        setTimeout(() => setCurrentPage('dashboard'), 1000);
      } else {
        // Simulação de cadastro
        setMessage('Cadastro realizado com sucesso! Faça login.');
        setTimeout(() => {
          setIsLogin(true);
          setMessage('');
        }, 1500);
      }
    } else {
      setMessage('Por favor, preencha todos os campos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition duration-500">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition duration-500">
        <div className="flex justify-center items-center">
          {/* A imagem agora será carregada corretamente */}
          <img src={logoIcon} alt="Upwise Logo" className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Upwise</h1>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Plataforma de Aprendizado Adaptativo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                placeholder="Seu nome"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
              placeholder="seu.email@faculdade.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300"
          >
            {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
          </button>
        </form>

        {message && (
          <p className={`text-center text-sm font-medium p-2 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'}`}>
            {message}
          </p>
        )}

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;