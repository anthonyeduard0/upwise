# backend/reset_db.py
from app import app
from models import db
from sqlalchemy import text

# Este script força a limpeza total do banco de dados usando SQL bruto.
# Ele apaga o SCHEMA public inteiro e recria. Resolve erros de dependência.

if __name__ == '__main__':
    with app.app_context():
        print("☢️  Iniciando limpeza nuclear do banco de dados...")
        
        # Força a queda de todas as conexões e apaga o esquema public
        try:
            # Precisamos de commit explícito para comandos DDL em alguns casos
            db.session.execute(text("DROP SCHEMA public CASCADE;"))
            db.session.execute(text("CREATE SCHEMA public;"))
            db.session.commit()
            print("✅ Esquema 'public' resetado com sucesso (Tudo foi apagado).")
            
            # Cria as tabelas novas baseadas no models.py atual
            print("Dz️  Criando novas tabelas do zero...")
            db.create_all()
            print("✅ Banco de dados pronto e limpo!")
            
        except Exception as e:
            print(f"❌ Erro ao resetar banco: {e}")
            db.session.rollback()