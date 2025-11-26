import { useState, useMemo, useCallback } from 'react';
import type { Page, UserData } from './utils/types.ts'; 
import Sidebar from './layouts/Sidebar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ActivitiesPage from './pages/ActivitiesPage.tsx';
import ProgressPage from './pages/ProgressPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import RewardsPage from './pages/RewardsPage.tsx'; 

const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="p-10 flex-1 flex items-center justify-center text-3xl font-bold text-gray-500">Página {title} (Em Breve)</div>
);

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const handleLoginSuccess = (userData: UserData) => { setUser(userData); setCurrentPage('dashboard'); };
  const handleLogout = () => { setUser(null); setCurrentPage('login'); setIsMobileMenuOpen(false); };

  const renderPage = useMemo(() => {
    if (currentPage === 'login') return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    if (!user) { setCurrentPage('login'); return null; }

    switch (currentPage) {
      case 'dashboard': return <DashboardPage user={user} setCurrentPage={setCurrentPage} />;
      case 'activities': return <ActivitiesPage user={user} setUser={setUser} setCurrentPage={setCurrentPage} />; 
      case 'progress': return <ProgressPage user={user} setCurrentPage={setCurrentPage} />;
      case 'profile': return <ProfilePage user={user} setCurrentPage={setCurrentPage} />;
      case 'rewards': return <RewardsPage user={user} setCurrentPage={setCurrentPage} />; // NOVA PÁGINA
      default: return <PlaceholderPage title="Não Encontrada" />;
    }
  }, [currentPage, user]);

  const appContent = useMemo(() => {
    if (currentPage === 'login') return renderPage;
    return (
      <div className="flex h-screen bg-gray-900 text-white font-inter">
        {user && <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} userName={user.name} userLevel={user.level} isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} onLogout={handleLogout} />}
        {isMobileMenuOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" onClick={toggleMobileMenu}></div>}
        <div className="flex-1 flex flex-col overflow-hidden">{renderPage}</div>
      </div>
    );
  }, [currentPage, renderPage, user, isMobileMenuOpen, toggleMobileMenu]);

  return appContent;
}
export default App;