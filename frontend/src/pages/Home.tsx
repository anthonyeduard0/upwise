// upwise/frontend/src/pages/Home.tsx
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
  padding: 40px 0; /* Apenas padding vertical, pois o .main-content já cuida do horizontal */
`;

// Seção de conteúdo com largura máxima
const ContentSection = styled.div`
  flex: 1;
  max-width: 700px; /* O conteúdo em si pode ter um max-width menor */
`;

const Title = styled.h1`
  font-size: 52px;
  margin-bottom: 20px;
  line-height: 1.2;
`;
// ... (outros estilos da Home que não afetam o layout principal)
const Description = styled.p`
  font-size: 18px;
  color: ${colors.textLight};
  margin-bottom: 40px;
`;

const ExploreButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: 15px 35px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${colors.buttonHover};
  }
`;

const CategoryList = styled.ul`
  list-style: disc;
  list-style-position: inside;
  margin-top: 50px;
  padding-left: 5px;
  
  li {
    font-size: 16px;
    color: ${colors.textLight};
    line-height: 2.2;
  }
`;

// --- COMPONENT ---

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <PageContainer>
      <ContentSection>
        <Title>Cursos para todos!</Title>
        <Description>
          Acesse uma variedade de cursos e aprenda algo novo hoje
        </Description>
        <ExploreButton onClick={() => onNavigate('courses')}>
          Explorar cursos
        </ExploreButton>
        <CategoryList>
          <li>Tecnologia</li>
          <li>Negócios</li>
          <li>Saúde</li>
        </CategoryList>
      </ContentSection>
      {/* NENHUM 'ILLUSTRATION' OU 'ASSET SPACE' AQUI */}
    </PageContainer>
  );
};

export default Home;