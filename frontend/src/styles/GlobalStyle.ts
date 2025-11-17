// upwise/frontend/src/styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

export const colors = {
  primary: '#6b47dc',    
  textDark: '#1a1a2e',    
  textLight: '#5a5a6a',   
  background: '#ffffff', 
  buttonHover: '#5a3dbd', 
  link: '#6b47dc',
  border: '#dcdcdc',     
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: ${colors.background};
    color: ${colors.primary};
    line-height: 1.6;
  }

  /* ... outros estilos ... */

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ESTA É A REGRA PRINCIPAL PARA A EXPANSÃO DA PÁGINA */
  .main-content {
    flex-grow: 1;
    width: 100%; /* Garante que o container ocupe a largura */
    max-width: 1100px; /* Define um limite máximo para telas grandes */
    margin: 0 auto; /* Centraliza o container na tela */
    padding: 20px; /* Espaçamento interno */
  }
`;

export default GlobalStyle;