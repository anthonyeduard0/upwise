// upwise/frontend/src/components/Header.tsx
import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles/GlobalStyle';
import type { Screen } from '../App';
import LogoIcon from '../assets/logo-icon.png'; 

// --- STYLES ---

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between; 
  align-items: center;
  
  /* ESTA É A REGRA PRINCIPAL PARA A EXPANSÃO DO HEADER */
  width: 100%; /* Garante que o header ocupe a largura */
  max-width: 1100px; /* Mesmo max-width do .main-content */
  margin: 0 auto; /* Centraliza o header */
  
  padding: 30px 20px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    width: 45px; 
    height: 45px;
    margin-right: 12px;
  }
  span {
    font-size: 32px;
    font-weight: bold;
    color: ${colors.primary};
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 35px;
  a {
    color: ${colors.textLight}; 
    font-size: 18px; 
    font-weight: 500;
    transition: color 0.2s;
    padding: 5px;
    cursor: pointer;
    &:hover {
      color: ${colors.primary};
    }
  }
`;

// --- COMPONENT ---

interface HeaderProps {
  onNavigate: (screen: Screen) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <HeaderContainer>
      <Logo onClick={() => onNavigate('home')}>
        <img src={LogoIcon} alt="Upwise Logo" />
        <span>Upwise</span>
      </Logo>
      <Nav>
        <a onClick={() => onNavigate('courses')}>Cursos</a>
        <a onClick={() => onNavigate('about')}>Sobre</a>
        <a onClick={() => onNavigate('contact')}>Contato</a>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;