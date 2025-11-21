# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Inicializa o objeto do banco
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # ATENÇÃO: Senha sem criptografia (apenas para fins acadêmicos/MVP)
    password = db.Column(db.String(200), nullable=False)
    
    # Estatísticas do aluno (Lógica Adaptativa)
    level = db.Column(db.String(20), default='Iniciante') # Iniciante, Intermediário, Avançado
    score = db.Column(db.Integer, default=0)
    total_activities = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0.0) # 0 a 100
    
    # Relacionamentos
    activities = db.relationship('UserActivity', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'level': self.level,
            'score': self.score,
            'totalActivities': self.total_activities,
            'accuracy': self.accuracy
        }

class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    statement = db.Column(db.Text, nullable=False) # Enunciado
    options = db.Column(db.JSON, nullable=False)   # Lista de opções salvos como JSON
    correct_answer = db.Column(db.String(200), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False) # fácil, médio, difícil
    topic = db.Column(db.String(100)) 

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.statement,
            'options': self.options,
            'difficulty': self.difficulty,
            'topic': self.topic
        }

class UserActivity(db.Model):
    __tablename__ = 'user_activities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    
    user_answer = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)