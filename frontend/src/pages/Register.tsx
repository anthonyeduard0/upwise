// upwise/frontend/src/pages/Register.tsx
import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles/GlobalStyle';
import type { Screen } from '../App';

// --- STYLES ---
// (Estilos são muito similares ao Login.tsx)

const PageContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; 
  padding: 40px 0;
  min-height: 80vh;
`;

const FormSection = styled.div`
  flex: 1;
  max-width: 400px;
`;

const Title = styled.h2`
  font-size: 42px;
  margin-bottom: 10px;
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: 18px;
  color: ${colors.textLight}; 
  margin-bottom: 40px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 15px;
  margin-bottom: 20px;
  background-color: ${colors.background}; 
  border: 1px solid ${colors.border};     
  border-radius: 8px;
  font-size: 16px;
  color: ${colors.textDark}; 

  &:focus {
    outline: 2px solid ${colors.primary};
    border-color: transparent;
  }
`;

const MainButton = styled.button`
  width: 100%;
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: 14px 15px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  margin-top: 10px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${colors.buttonHover};
  }
`;

const LoginText = styled.p`
  font-size: 14px;
  color: ${colors.textLight}; 
  margin-top: 25px;

  a {
    color: ${colors.primary};
    font-weight: 500;
    margin-left: 5px;
    cursor: pointer; // Adicionado para links 'a' sem href
  }
`;

// --- COMPONENT ---

interface RegisterProps {
  onNavigate: (screen: Screen) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  return (
    <PageContainer>
      <FormSection>
        <Title>Crie sua conta</Title>
        <Description>Rápido e fácil.</Description>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <Input type="text" placeholder="Nome completo" />
          <Input type="email" placeholder="E-mail" />
          <Input type="password" placeholder="Senha" />
          <Input type="password" placeholder="Confirmar Senha" />
          
          <MainButton type="submit">Cadastrar</MainButton>
        </form>
        
        <LoginText>
          Já possui uma conta?
          <a onClick={() => onNavigate('login')}>
            Entrar
          </a>
        </LoginText>
      </FormSection>
    </PageContainer>
  );
};

export default Register;