import { useState, useMemo, useCallback } from 'react';
// Importação de Tipos e Dados Mock
import type { Page } from './utils/types.ts'; // CORRIGIDO: Adicionado import type
import { mockUser } from './utils/types.ts'; // mockUser não é um tipo, mantém import normal

// Importação de Componentes
import Sidebar from './layouts/Sidebar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ActivitiesPage from './pages/ActivitiesPage.tsx';

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
  
  // Função para alternar o menu mobile
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Simulação de autenticação (usuário logado)
  const isAuthenticated = currentPage !== 'login';
  const user = mockUser; 

  const renderPage = useMemo(() => {
    switch (currentPage) {
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
      case 'activities':
        return <ActivitiesPage user={user} setCurrentPage={setCurrentPage} />; 
      case 'progress':
        return <PlaceholderPage title="Relatório de Progresso" />;
      case 'profile':
        return <PlaceholderPage title="Perfil do Usuário" />;
      case 'rewards':
        return <PlaceholderPage title="Recompensas" />;
      default:
        return <PlaceholderPage title="Não Encontrada" />;
    }
  }, [currentPage, user, setCurrentPage]);

  // Conteúdo principal da aplicação
  const appContent = useMemo(() => {
    if (!isAuthenticated) {
      return renderPage; // Apenas a tela de Login
    }

    return (
      <div className="flex h-screen bg-gray-900 text-white font-inter">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          userName={user.name} 
          userLevel={user.level}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
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
  }, [isAuthenticated, currentPage, renderPage, user, isMobileMenuOpen, toggleMobileMenu]);

  return appContent;
}

export default App;