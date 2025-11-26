import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')

if not api_key:
    print("❌ Erro: Chave GOOGLE_API_KEY não encontrada no arquivo .env")
else:
    print(f"🔑 Usando chave: {api_key[:5]}...{api_key[-5:]}")
    genai.configure(api_key=api_key)
    
    print("\n🔎 Buscando modelos disponíveis para sua chave...")
    try:
        count = 0
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"✅ Modelo disponível: {m.name}")
                count += 1
        
        if count == 0:
            print("⚠️ Nenhum modelo de geração de texto encontrado. Verifique se a 'Generative Language API' está ativada no Google Cloud Console.")
    except Exception as e:
        print(f"❌ Erro ao listar modelos: {e}")