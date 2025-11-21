# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Pega a URL de conexão do arquivo .env
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Chave secreta simples para o projeto
    SECRET_KEY = 'chave-secreta-faculdade-upwise'