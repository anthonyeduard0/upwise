from app import app
from models import db
from sqlalchemy import text


if __name__ == '__main__':
    with app.app_context():
        print("☢️  Iniciando limpeza nuclear do banco de dados...")
        
        try:
            db.session.execute(text("DROP SCHEMA public CASCADE;"))
            db.session.execute(text("CREATE SCHEMA public;"))
            db.session.commit()
            print("✅ Esquema 'public' resetado com sucesso (Tudo foi apagado).")
            
            print("Dz️  Criando novas tabelas do zero...")
            db.create_all()
            print("✅ Banco de dados pronto e limpo!")
            
        except Exception as e:
            print(f"❌ Erro ao resetar banco: {e}")
            db.session.rollback()