// upwise/frontend/src/App.tsx
import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Courses from './pages/Courses';
import Header from './components/Header';
import GlobalStyle from './styles/GlobalStyle';
// Importa a nova página
import Register from './pages/Register';

// CORREÇÃO: Adiciona 'register' aos tipos de tela
export type Screen = 'home' | 'login' | 'courses' | 'about' | 'contact' | 'register';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      // CORREÇÃO: Adiciona o case para a tela de registro
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'courses':
        return <Courses onNavigate={handleNavigate} />;
      case 'about':
        return <div>Página Sobre (em construção)</div>;
      case 'contact':
        return <div>Página Contato (em construção)</div>;
      default:
        return <Login onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <Header onNavigate={handleNavigate} />
      
      <div className="main-content">
        {renderScreen()}
      </div>
    </>
  );
};

export default App;