from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    
    level = db.Column(db.String(20), default='Iniciante')
    score = db.Column(db.Integer, default=0)
    total_activities = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0.0)
    
    # Novo campo para assinatura
    is_premium = db.Column(db.Boolean, default=False)
    
    activities = db.relationship('UserActivity', backref='user', lazy=True)
    achievements = db.relationship('Achievement', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'level': self.level,
            'score': self.score,
            'totalActivities': self.total_activities,
            'accuracy': self.accuracy,
            'isPremium': self.is_premium  # Retorna o status no JSON
        }

class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    statement = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON, nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
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
    
    user_answer = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    __tablename__ = 'achievements'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    icon_name = db.Column(db.String(50), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon': self.icon_name,
            'date': self.earned_at.strftime('%d/%m/%Y')
        }