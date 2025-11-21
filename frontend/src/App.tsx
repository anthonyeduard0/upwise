import { useState, useMemo, useCallback } from 'react';
import type { Page, UserData } from './utils/types.ts'; 
import Sidebar from './layouts/Sidebar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ActivitiesPage from './pages/ActivitiesPage.tsx';
import ProgressPage from './pages/ProgressPage.tsx';

// Componente para páginas em desenvolvimento
const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="p-10 flex-1 flex items-center justify-center text-3xl font-bold text-gray-500">
        Página {title} (Em Breve)
    </div>
);

// --- Componente Principal (App) ---
function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado para armazenar o usuário real vindo do Backend
  const [user, setUser] = useState<UserData | null>(null);

  // Função para alternar o menu mobile
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Função chamada ao fazer login com sucesso
  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // Função de Logout (Limpa o usuário e volta pro login)
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setIsMobileMenuOpen(false);
  };

  const renderPage = useMemo(() => {
    // 1. Se for página de login, renderiza e retorna (encerra a função aqui)
    if (currentPage === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // 2. Se o código chegou aqui, o TypeScript sabe que currentPage NÃO É 'login'.
    // Então só precisamos checar se o usuário existe.
    if (!user) {
      // Se não tem usuário e não é a tela de login, manda pro login (Segurança)
      setCurrentPage('login');
      return null;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
      case 'activities':
        // Passamos setUser para que a atividade possa atualizar os pontos/nível
        return <ActivitiesPage user={user} setUser={setUser} setCurrentPage={setCurrentPage} />; 
      case 'progress':
        // Renderiza a nova página de progresso conectada ao backend
        return <ProgressPage user={user} setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <PlaceholderPage title="Perfil do Usuário" />;
      case 'rewards':
        return <PlaceholderPage title="Recompensas" />;
      default:
        return <PlaceholderPage title="Não Encontrada" />;
    }
  }, [currentPage, user]);

  // Conteúdo principal da aplicação
  const appContent = useMemo(() => {
    if (currentPage === 'login') {
      return renderPage;
    }

    return (
      <div className="flex h-screen bg-gray-900 text-white font-inter">
        {user && (
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            userName={user.name} 
            userLevel={user.level}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
            onLogout={handleLogout} // Passando a função de logout
          />
        )}
        
        {/* Overlay para o mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
            onClick={toggleMobileMenu}
          ></div>
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderPage}
        </div>
      </div>
    );
  }, [currentPage, renderPage, user, isMobileMenuOpen, toggleMobileMenu]);

  return appContent;
}

export default App;