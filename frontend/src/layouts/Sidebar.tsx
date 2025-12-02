import React from 'react';
import { LayoutDashboard, User, BarChart3, LogIn, Award, Menu, X, Activity, CreditCard, Crown } from 'lucide-react';
import type { Page, UserData } from '../utils/types.ts';
import logoIcon from '../assets/logo-icon.png'; 

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: UserData;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  onLogout: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, user, isMobileMenuOpen, toggleMobileMenu, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' as Page },
    { name: 'Atividades', icon: Activity, page: 'activities' as Page },
    { name: 'Progresso', icon: BarChart3, page: 'progress' as Page },
    { name: 'Perfil', icon: User, page: 'profile' as Page },
    { name: 'Recompensas', icon: Award, page: 'rewards' as Page },
    { name: 'Planos', icon: CreditCard, page: 'subscription' as Page },
  ];

  return (
    <>
      <button 
        className="md:hidden p-3 fixed top-4 left-4 z-50 text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition duration-300"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40 md:static md:flex md:flex-col md:h-auto md:w-64 flex-shrink-0 border-r border-gray-800`}>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <img src={logoIcon} alt="Upwise Logo" className="w-8 h-8 mr-2" />
            <span className="text-xl font-bold text-indigo-400">Upwise</span>
          </div>
          <button className="md:hidden text-white p-1" onClick={toggleMobileMenu}>
            <X size={24} />
          </button>
        </div>

        <div className="mb-8 p-4 bg-gray-800 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Bem-vindo(a),</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold truncate">{user.name}</p>
            {/* CORREÇÃO: Usando uma div wrapper para o title */}
            {user.isPremium && (
              <div title="Usuário Premium" className="cursor-help">
                <Crown size={16} className="text-yellow-400" />
              </div>
            )}
          </div>
          <div className="mt-2 text-xs font-medium px-3 py-1 bg-indigo-600 rounded-full w-fit">
            {user.level}
          </div>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map(item => {
              const isActive = currentPage === item.page;
              return (
                <li key={item.page}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.page);
                      if (isMobileMenuOpen) toggleMobileMenu();
                    }}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={`mr-3 ${item.page === 'subscription' && !user.isPremium ? 'text-yellow-400' : ''}`} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {!user.isPremium && (
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl border border-purple-500/30 text-center">
                <p className="text-sm font-bold text-white mb-2">Seja Premium! 🚀</p>
                <button 
                    onClick={() => setCurrentPage('subscription')}
                    className="text-xs w-full bg-white text-indigo-900 font-bold py-2 rounded hover:bg-gray-100 transition"
                >
                    Ver Planos
                </button>
            </div>
        )}

        <button
          onClick={onLogout} 
          className="w-full mt-auto flex items-center justify-center p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white font-medium"
        >
          <LogIn size={20} className="mr-2" />
          Sair
        </button>
      </div>
    </>
  );
};

export default Sidebar;