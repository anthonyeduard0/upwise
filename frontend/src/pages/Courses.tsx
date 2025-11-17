// upwise/frontend/src/pages/Courses.tsx
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

// Seção dos cards com largura máxima
const CardsSection = styled.div`
  flex: 1;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  gap: 25px; 
`;
// ... (outros estilos dos Cards)
const CourseCard = styled.div`
  padding: 25px;
  border: 1.5px solid ${colors.primary};
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(107, 71, 220, 0.05);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(107, 71, 220, 0.15);
  }
`;

const CardTitle = styled.h3`
  font-size: 22px;
  color: ${colors.primary};
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-size: 16px;
  color: ${colors.textLight};
  line-height: 1.5;
`;

// --- COMPONENT ---

interface CoursesProps {
  onNavigate: (screen: Screen) => void;
}

const Courses: React.FC<CoursesProps> = ({ onNavigate }) => {
  return (
    <PageContainer>
      <CardsSection>
        <CourseCard>
          <CardTitle>Banco de dados</CardTitle>
          <CardDescription>
            Aprenda como armazenar, organizar e proteger informações de forma eficiente — essencial para qualquer sistema moderno.
          </CardDescription>
        </CourseCard>

        <CourseCard>
          <CardTitle>Empreendedorismo</CardTitle>
          <CardDescription>
            Entenda como transformar ideias em projetos reais, aprender sobre gestão, vendas e estratégias para criar negócios de sucesso.
          </CardDescription>
        </CourseCard>

        <CourseCard>
          <CardTitle>Bem-estar e Qualidade de Vida</CardTitle>
          <CardDescription>
            Descubra como manter hábitos saudáveis, melhorar sua rotina e compreender princípios básicos de cuidados com o corpo e a mente.
          </CardDescription>
        </CourseCard>
      </CardsSection>
      {/* NENHUM 'ILLUSTRATION' OU 'ASSET SPACE' AQUI */}
    </PageContainer>
  );
};

export default Courses;