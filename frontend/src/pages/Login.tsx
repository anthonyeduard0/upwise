// upwise/frontend/src/pages/Login.tsx
import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles/GlobalStyle';
import type { Screen } from '../App';

// --- STYLES ---

// Container principal da página, layout simples
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  padding: 40px 0;
`;

// Seção do formulário com largura máxima
const FormSection = styled.div`
  flex: 1;
  max-width: 400px;
`;

const Title = styled.h2`
  font-size: 42px;
  margin-bottom: 10px;
  line-height: 1.2;
`;
// ... (outros estilos do Login que não afetam o layout principal)
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

const LinkWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  margin-top: -10px; 
`;

const ForgotPassword = styled.a`
  font-size: 14px;
  color: ${colors.link};
`;

const SignUpText = styled.p`
  font-size: 14px;
  color: ${colors.textLight}; 
  margin-top: 25px;

  a {
    color: ${colors.primary};
    font-weight: 500;
    margin-left: 5px;
    cursor: pointer;
  }
`;


// --- COMPONENT ---

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  return (
    <PageContainer>
      <FormSection>
        <Title>Bem-vindo ao Upwise</Title>
        <Description>A plataforma de aprendizado adaptativo</Description>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <Input type="email" placeholder="E-mail" />
          <Input type="password" placeholder="Senha" />
          
          <LinkWrapper>
            <ForgotPassword href="#">Esqueceu a senha?</ForgotPassword>
          </LinkWrapper>
          
          <MainButton type="submit">Entrar</MainButton>
        </form>
        
        <SignUpText>
          Ainda não possui uma conta?
          <a onClick={() => onNavigate('register')}>
            Cadastre-se
          </a>
        </SignUpText>
      </FormSection>
      {/* NENHUM 'ILLUSTRATION' OU 'ASSET SPACE' AQUI */}
    </PageContainer>
  );
};

export default Login;