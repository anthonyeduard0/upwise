import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')

print("--- DIAGNÓSTICO DE MODELOS GEMINI ---")

if not api_key:
    print("❌ ERRO CRÍTICO: A variável GOOGLE_API_KEY não foi encontrada no arquivo .env")
    print("Verifique se o arquivo .env está na mesma pasta ou se a variável está nomeada corretamente.")
else:
    print(f"🔑 Chave lida: {api_key[:8]}...{api_key[-4:]}")
    
    try:
        genai.configure(api_key=api_key)
        print("📡 Conectando aos servidores do Google...")
        
        # Tenta listar todos os modelos disponíveis para esta chave
        all_models = list(genai.list_models())
        
        text_models = []
        for m in all_models:
            if 'generateContent' in m.supported_generation_methods:
                text_models.append(m.name)

        if text_models:
            print(f"\n✅ SUCESSO! Encontramos {len(text_models)} modelos de texto disponíveis:")
            for name in text_models:
                print(f"   -> {name}")
            print("\nCopie um desses nomes (ex: 'models/gemini-pro') para usar no seu código.")
        else:
            print("\n⚠️ AVISO: A conexão funcionou, mas NENHUM modelo de geração de texto foi retornado.")
            print("Isso geralmente acontece quando a 'Generative Language API' não está ativada no Google Cloud Console.")

    except Exception as e:
        print(f"\n❌ ERRO DE CONEXÃO: {e}")
        print("\nDicas:")
        print("1. Verifique sua conexão com a internet.")
        print("2. Verifique se a API Key é válida.")
        print("3. Se o erro for 'User location is not supported', sua região (ou VPN) está bloqueada.")