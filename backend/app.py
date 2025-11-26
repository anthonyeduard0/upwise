import os
import json
import random
import time
import re
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db, User, Question, UserActivity, Achievement
import pandas as pd
import numpy as np
import google.generativeai as genai
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

try:
    mongo_client = MongoClient('mongodb://localhost:27017/')
    mongo_db = mongo_client['upwise_datalake']
    logs_collection = mongo_db['activity_logs'] 
    print("✅ Conectado ao MongoDB com sucesso!")
except Exception as e:
    print(f"⚠️ Erro ao conectar no MongoDB: {e}")
    mongo_client = None

CORS(app)

# Configurações IA e Constantes
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY: genai.configure(api_key=GOOGLE_API_KEY)
QUESTIONS_PER_LEVEL_SEED = 3
TOPICS_TO_GENERATE = ["Tecnologia", "Ciência", "História", "Matemática", "Artes", "Geografia", "Filosofia", "Sociologia"]

# --- FUNÇÕES AUXILIARES ---
def clean_option_text(text):
    return re.sub(r'^[A-Da-d1-4][\)\.]\s*', '', text).strip()

def call_gemini(prompt):
    models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
    for m in models:
        try:
            model = genai.GenerativeModel(m)
            return model.generate_content(prompt).text
        except: continue
    return None

def generate_new_question_with_ai(difficulty, topic=None):
    if not GOOGLE_API_KEY: return None
    if not topic: topic = random.choice(TOPICS_TO_GENERATE)
    
    guides = {"fácil": "Fatos básicos.", "médio": "Aplicação.", "difícil": "Análise crítica."}
    prompt = f"""
    Gere 1 questão múltipla escolha sobre: {topic}. Dificuldade: {difficulty.upper()}. {guides.get(difficulty, "")}
    REGRAS: JSON válido. Sem prefixos nas opções. 'correct_answer' igual a uma opção.
    Formato: {{"statement": "...", "options": ["..."], "correct_answer": "...", "topic": "{topic}"}}
    """
    resp = call_gemini(prompt)
    if not resp: return None
    try:
        data = json.loads(resp.replace('```json', '').replace('```', '').strip())
        opts = [clean_option_text(o) for o in data['options']]
        corr = clean_option_text(data['correct_answer'])
        if corr not in opts: opts[0] = corr
        
        nq = Question(statement=data['statement'], options=opts, correct_answer=corr, difficulty=difficulty, topic=data.get('topic', topic))
        db.session.add(nq)
        db.session.commit()
        print(f"✅ IA Gerou: {difficulty} - {topic}")
        return nq
    except: return None

def generate_ai_feedback(q, ans, corr, is_cor):
    if not GOOGLE_API_KEY: return None
    return call_gemini(f"Aluno {'acertou' if is_cor else 'errou'}: '{q}'. Resp: '{ans}'. Correta: '{corr}'. Feedback curto 1 frase.")

def check_achievements(user):
    new = []
    badges = [
        {"title": "Primeiros Passos", "cond": lambda u: u.total_activities >= 1, "desc": "1ª atividade concluída.", "icon": "flag"},
        {"title": "Estudante Dedicado", "cond": lambda u: u.score >= 100, "desc": "100 pontos XP.", "icon": "star"},
        {"title": "Mestre", "cond": lambda u: u.level == 'Avançado', "desc": "Nível Avançado alcançado.", "icon": "trophy"},
        {"title": "Imparável", "cond": lambda u: u.total_activities >= 20, "desc": "20 questões respondidas.", "icon": "target"}
    ]
    for b in badges:
        if b["cond"](user):
            if not any(mb.title == b["title"] for mb in user.achievements):
                db.session.add(Achievement(user_id=user.id, title=b["title"], description=b["desc"], icon_name=b["icon"]))
                new.append(b["title"])
    db.session.commit()
    return new

# --- ROTAS ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.get_json()
    if User.query.filter_by(email=d['email']).first(): return jsonify({'error': 'Email existe'}), 400
    u = User(name=d['name'], email=d['email'], password=d['password'])
    db.session.add(u)
    db.session.commit()
    return jsonify({'message': 'Criado', 'user': u.to_dict()}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.get_json()
    u = User.query.filter_by(email=d['email']).first()
    if u and u.password == d['password']: return jsonify({'message': 'Logado', 'user': u.to_dict()}), 200
    return jsonify({'error': 'Inválido'}), 401

@app.route('/api/user/<int:id>', methods=['GET', 'PUT'])
def user_r(id):
    u = db.session.get(User, id)
    if not u: return jsonify({'error': '404'}), 404
    if request.method == 'PUT':
        d = request.get_json()
        if 'name' in d: u.name = d['name']
        if 'email' in d: u.email = d['email']
        db.session.commit()
    return jsonify(u.to_dict())

@app.route('/api/user/achievements/<int:id>', methods=['GET'])
def ach(id):
    return jsonify([a.to_dict() for a in Achievement.query.filter_by(user_id=id).all()])

@app.route('/api/user/progress/<int:id>', methods=['GET'])
def prog(id):
    try:
        df = pd.read_sql(f"SELECT timestamp, is_correct FROM user_activities WHERE user_id = {id} ORDER BY timestamp ASC", db.engine)
        if df.empty: return jsonify({'labels': [], 'data': []})
        df['d'] = pd.to_datetime(df['timestamp']).dt.strftime('%d/%m')
        s = df.groupby('d')['is_correct'].mean() * 100
        return jsonify({'labels': s.index.tolist(), 'data': s.round(1).tolist()})
    except: return jsonify({'labels': [], 'data': []})

@app.route('/api/activities/next/<int:id>', methods=['GET'])
def next_q(id):
    u = db.session.get(User, id)
    diff = 'fácil' if u.level == 'Iniciante' else 'difícil' if u.level == 'Avançado' else 'médio'
    ids = db.session.query(UserActivity.question_id).filter_by(user_id=id)
    qs = Question.query.filter(Question.difficulty == diff, ~Question.id.in_(ids)).order_by(db.func.random()).limit(5).all()
    
    if len(qs) < 5 and GOOGLE_API_KEY:
        for _ in range(5 - len(qs)):
            time.sleep(2)
            nq = generate_new_question_with_ai(diff)
            if nq: qs.append(nq)
            
    return jsonify([q.to_dict() for q in qs])

@app.route('/api/activities/submit', methods=['POST'])
def submit():
    d = request.get_json()
    uid = d['user_id']
    answers = d['answers']
    u = db.session.get(User, uid)
    
    corrects = 0
    score = 0
    correction_details = []
    
    mongo_logs = []
    timestamp_now = datetime.utcnow()

    for item in answers:
        q = db.session.get(Question, item['question_id'])
        if not q: continue
        
        is_cor = (clean_option_text(q.correct_answer) == clean_option_text(item['answer']))
        
        if is_cor:
            corrects += 1
            score += 10
            
        db.session.add(UserActivity(user_id=uid, question_id=q.id, user_answer=item['answer'], is_correct=is_cor))
        
        mongo_log = {
            "user_id": uid,
            "user_level_at_time": u.level,
            "question_id": q.id,
            "question_topic": q.topic,
            "question_difficulty": q.difficulty,
            "user_answer": item['answer'],
            "correct_answer": q.correct_answer,
            "is_correct": is_cor,
            "timestamp": timestamp_now,
            "platform": "web_react",
        }
        mongo_logs.append(mongo_log)

        correction_details.append({
            'question_id': q.id, 'correct_answer': q.correct_answer,
            'user_answer': item['answer'], 'is_correct': is_cor
        })

    db.session.commit()

    if mongo_client and mongo_logs:
        try:
            logs_collection.insert_many(mongo_logs)
            print(f"📊 {len(mongo_logs)} logs salvos no MongoDB!")
        except Exception as e:
            print(f"⚠️ Erro ao salvar no Mongo: {e}")

    ai_feed = None
    if answers:
        last = answers[-1]
        q_last = db.session.get(Question, last['question_id'])
        is_last_cor = (clean_option_text(q_last.correct_answer) == clean_option_text(last['answer']))
        ai_feed = generate_ai_feedback(q_last.statement, last['answer'], q_last.correct_answer, is_last_cor)

    q_sql = f"SELECT is_correct FROM user_activities WHERE user_id = {uid}"
    df = pd.read_sql(q_sql, db.engine)
    if not df.empty:
        u.accuracy = round(float(np.mean(df['is_correct'].astype(int).values) * 100), 1)
        u.total_activities = int(len(df))
    
    u.score += score
    acc_round = (corrects / len(answers)) * 100 if answers else 0
    
    if acc_round >= 80 and u.level != 'Avançado': u.level = 'Intermediário' if u.level == 'Iniciante' else 'Avançado'
    elif acc_round < 40 and u.level != 'Iniciante': u.level = 'Intermediário' if u.level == 'Avançado' else 'Iniciante'

    db.session.commit()
    badges = check_achievements(u)

    return jsonify({
        'new_score': u.score, 'new_level': u.level, 'accuracy': u.accuracy,
        'round_accuracy': acc_round, 'ai_feedback': ai_feed,
        'new_achievements': badges, 'correction_details': correction_details
    })

@app.route('/api/seed', methods=['POST'])
def seed():
    if not GOOGLE_API_KEY: return jsonify({'error': 'No Key'}), 500
    c = 0
    for lvl in ['fácil', 'médio', 'difícil']:
        needed = QUESTIONS_PER_LEVEL_SEED - Question.query.filter_by(difficulty=lvl).count()
        if needed > 0:
            print(f"⚙️ Gerando {needed} {lvl}...")
            for _ in range(needed):
                topic = random.choice(TOPICS_TO_GENERATE)
                if generate_new_question_with_ai(lvl, topic): c += 1
                print("⏳ Cota...")
                time.sleep(4)
    return jsonify({'msg': f'{c} novas'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)