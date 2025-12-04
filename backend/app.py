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
from datetime import datetime, timezone
from google.api_core import exceptions
from sqlalchemy import text # Importante para queries SQL diretas com parâmetros

# Tenta importar o PyMongo
try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

# Configuração do MongoDB (Opcional)
mongo_client = None
logs_collection = None

if MongoClient:
    try:
        mongo_client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
        mongo_client.server_info() # Força conexão para testar
        mongo_db = mongo_client['upwise_datalake']
        logs_collection = mongo_db['activity_logs'] 
        print("✅ Conectado ao MongoDB com sucesso!")
    except Exception as e:
        print(f"⚠️ MongoDB não disponível: {e}. Logs serão apenas locais.")
        mongo_client = None
else:
    print("ℹ️ PyMongo não instalado. Logs do MongoDB desativados.")

CORS(app)

# Configurações IA e Constantes
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY: 
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("❌ AVISO: GOOGLE_API_KEY não encontrada no arquivo .env")

QUESTIONS_PER_LEVEL_SEED = 3
TOPICS_TO_GENERATE = ["Tecnologia", "Ciência", "História", "Matemática", "Artes", "Geografia", "Filosofia", "Sociologia"]

# --- FUNÇÕES AUXILIARES ---

def clean_option_text(text):
    """Limpa prefixos como 'A)', '1.', etc das opções."""
    return re.sub(r'^[A-Da-d1-4][\)\.]\s*', '', text).strip()

def extract_json_from_response(text):
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        cleaned_text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        print(f"❌ Falha ao decodificar JSON da IA: {e}")
        return None

def call_gemini(prompt):
    models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-2.5-flash']
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    for m in models:
        try:
            model = genai.GenerativeModel(m)
            response = model.generate_content(prompt, safety_settings=safety_settings)
            if response.text: return response.text
        except exceptions.PermissionDenied: print(f"   ⛔ Permissão negada no modelo {m}.")
        except exceptions.NotFound: print(f"   ⚠️ Modelo {m} não encontrado.")
        except Exception as e: print(f"   ⚠️ Erro no modelo {m}: {e}")
    return None

def generate_new_question_with_ai(difficulty, topic=None):
    if not GOOGLE_API_KEY: 
        print("⚠️ Tentativa de gerar questão sem API KEY configurada.")
        return None
        
    if not topic: topic = random.choice(TOPICS_TO_GENERATE)
    
    # Guia de dificuldade ajustado para ser mais desafiador
    guides = {
        "fácil": "Nível fundamental/básico, mas NÃO trivial. Evite perguntas óbvias como 'quanto é 2+2'. Foque em definições, conceitos iniciais ou fatos históricos importantes.",
        "médio": "Nível ensino médio/vestibular. Exige raciocínio, interpretação de texto ou aplicação de fórmulas simples. Não pode ser respondida apenas com senso comum.",
        "difícil": "Nível universitário ou especialista. Exige análise crítica, correlação de conceitos complexos, detalhes específicos ou cálculos de múltiplas etapas."
    }
    
    prompt = f"""
    Atue como um professor especialista elaborando uma prova.
    Gere 1 questão de múltipla escolha desafiadora sobre: {topic}. 
    Nível de Dificuldade: {difficulty.upper()}.
    Diretriz de Dificuldade: {guides.get(difficulty, "")}
    
    JSON APENAS: {{"statement": "Enunciado da questão...", "options": ["Opção A", "Opção B", "Opção C", "Opção D"], "correct_answer": "Texto exato da correta", "topic": "{topic}"}}
    A 'correct_answer' deve ser IDÊNTICA a uma das 'options'. Não use markdown.
    """
    
    print(f"🤖 Solicitando questão ({difficulty}) para IA sobre {topic}...")
    resp = call_gemini(prompt)
    if not resp: 
        print("❌ A IA não retornou resposta.")
        return None
    
    data = extract_json_from_response(resp)
    if not data: return None
    
    try:
        opts = [clean_option_text(str(o)) for o in data['options']]
        corr = clean_option_text(str(data['correct_answer']))
        
        if corr not in opts: 
            opts[0] = corr
            random.shuffle(opts)
        
        nq = Question(
            statement=data['statement'], options=opts, correct_answer=corr, 
            difficulty=difficulty, topic=data.get('topic', topic)
        )
        db.session.add(nq)
        db.session.commit()
        print(f"✅ IA Gerou e salvou: {difficulty} - {topic}")
        return nq
    except Exception as e:
        print(f"❌ Erro ao salvar questão: {e}")
        db.session.rollback()
        return None

def generate_ai_feedback(q, ans, corr, is_cor):
    if not GOOGLE_API_KEY: return None
    return call_gemini(f"Atue como tutor. O aluno {'acertou' if is_cor else 'errou'} a questão: '{q}'. Resp dele: '{ans}'. Correta: '{corr}'. Dê um feedback curto e didático (1 frase) explicando o porquê.")

def check_achievements(user, current_round_acc=None):
    new = []
    badges = [
        {"title": "Primeiros Passos", "cond": lambda u: u.total_activities >= 1, "desc": "1ª atividade concluída.", "icon": "flag"},
        {"title": "Estudante Dedicado", "cond": lambda u: u.score >= 100, "desc": "100 pontos XP.", "icon": "star"},
        {"title": "Mestre", "cond": lambda u: u.level == 'Avançado', "desc": "Nível Avançado alcançado.", "icon": "trophy"},
        {"title": "Imparável", "cond": lambda u: u.total_activities >= 20, "desc": "20 questões respondidas.", "icon": "target"},
        {"title": "Maratonista", "cond": lambda u: u.total_activities >= 50, "desc": "50 questões respondidas.", "icon": "zap"},
        {"title": "Lendário", "cond": lambda u: u.score >= 1000, "desc": "Acumulou 1000 pontos XP.", "icon": "crown"},
        {"title": "Na Mosca!", "cond": lambda u: current_round_acc is not None and current_round_acc >= 99.9, "desc": "Acertou 100% em uma rodada.", "icon": "crosshair"},
        {"title": "Membro VIP", "cond": lambda u: u.is_premium, "desc": "Tornou-se um assinante Premium.", "icon": "gem"},
    ]
    
    user_badges_titles = [b.title for b in user.achievements]
    for b in badges:
        if b["cond"](user) and b["title"] not in user_badges_titles:
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
    check_achievements(u)
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

@app.route('/api/user/subscribe', methods=['POST'])
def subscribe():
    d = request.get_json()
    user_id = d.get('user_id')
    u = db.session.get(User, user_id)
    if not u: return jsonify({'error': 'User not found'}), 404
    u.is_premium = True
    db.session.commit()
    return jsonify({'message': 'Assinatura ativada!', 'user': u.to_dict(), 'new_achievements': check_achievements(u)})

@app.route('/api/user/achievements/<int:id>', methods=['GET'])
def ach(id):
    return jsonify([a.to_dict() for a in Achievement.query.filter_by(user_id=id).all()])

@app.route('/api/user/progress/<int:id>', methods=['GET'])
def prog(id):
    try:
        # SQL para buscar dados de histórico e tópicos (JOIN entre atividades e questões)
        # Atenção aos nomes das tabelas no seu banco (geralmente user_activities e questions)
        query = text("""
            SELECT ua.timestamp, ua.is_correct, q.topic 
            FROM user_activities ua
            JOIN questions q ON ua.question_id = q.id
            WHERE ua.user_id = :user_id
            ORDER BY ua.timestamp ASC
        """)
        
        # Executa a query usando a conexão do SQLAlchemy
        with db.engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"user_id": id})

        if df.empty:
            return jsonify({
                'history': {'labels': [], 'data': []},
                'topics': {'labels': [], 'data': []}
            })

        # Processamento para o Gráfico de Evolução (Linha)
        df['date'] = pd.to_datetime(df['timestamp']).dt.strftime('%d/%m')
        history_series = df.groupby('date')['is_correct'].mean() * 100
        history_data = {
            'labels': history_series.index.tolist(),
            'data': history_series.round(1).tolist()
        }

        # Processamento para o Gráfico de Tópicos (Barra)
        # Agrupa por tópico e calcula a média de acertos
        topic_series = df.groupby('topic')['is_correct'].mean() * 100
        # Ordena para mostrar os melhores primeiro
        topic_series = topic_series.sort_values(ascending=False)
        topics_data = {
            'labels': topic_series.index.tolist(),
            'data': topic_series.round(1).tolist()
        }

        return jsonify({
            'history': history_data,
            'topics': topics_data
        })

    except Exception as e:
        print(f"Erro ao gerar progresso: {e}")
        return jsonify({
            'history': {'labels': [], 'data': []},
            'topics': {'labels': [], 'data': []}
        })

@app.route('/api/activities/next/<int:id>', methods=['GET'])
def next_q(id):
    u = db.session.get(User, id)
    diff = 'fácil' if u.level == 'Iniciante' else 'difícil' if u.level == 'Avançado' else 'médio'
    
    ids = db.session.query(UserActivity.question_id).filter_by(user_id=id)
    qs = Question.query.filter(Question.difficulty == diff, ~Question.id.in_(ids)).order_by(db.func.random()).limit(5).all()
    
    if len(qs) < 5:
        if GOOGLE_API_KEY:
            print(f"⚠️ Banco com poucas questões ({len(qs)}). Tentando gerar com IA...")
            for _ in range(5 - len(qs)):
                nq = generate_new_question_with_ai(diff)
                if nq: qs.append(nq)
        else:
            print("⚠️ Poucas questões e sem chave de API.")

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
    timestamp_now = datetime.now(timezone.utc)

    for item in answers:
        q = db.session.get(Question, item['question_id'])
        if not q: continue
        is_cor = (clean_option_text(q.correct_answer) == clean_option_text(item['answer']))
        if is_cor:
            corrects += 1
            score += 10
        db.session.add(UserActivity(user_id=uid, question_id=q.id, user_answer=item['answer'], is_correct=is_cor))
        
        if mongo_client:
            mongo_logs.append({
                "user_id": uid, "user_level_at_time": u.level,
                "question_id": q.id, "question_topic": q.topic,
                "question_difficulty": q.difficulty, "user_answer": item['answer'],
                "correct_answer": q.correct_answer, "is_correct": is_cor,
                "timestamp": timestamp_now, "platform": "web_react",
            })
        
        correction_details.append({'question_id': q.id, 'correct_answer': q.correct_answer, 'user_answer': item['answer'], 'is_correct': is_cor})

    db.session.commit()

    if mongo_client is not None and logs_collection is not None and mongo_logs:
        try:
            logs_collection.insert_many(mongo_logs)
            print(f"📊 {len(mongo_logs)} logs salvos no MongoDB!")
        except Exception as e:
            print(f"⚠️ Erro ao salvar no Mongo: {e}")

    ai_feed = None
    if answers and GOOGLE_API_KEY:
        try:
            last = answers[-1]
            q_last = db.session.get(Question, last['question_id'])
            is_last_cor = (clean_option_text(q_last.correct_answer) == clean_option_text(last['answer']))
            ai_feed = generate_ai_feedback(q_last.statement, last['answer'], q_last.correct_answer, is_last_cor)
        except: pass

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
    badges = check_achievements(u, current_round_acc=acc_round if answers else None)

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
            for _ in range(needed):
                topic = random.choice(TOPICS_TO_GENERATE)
                if generate_new_question_with_ai(lvl, topic): c += 1
                time.sleep(1)
    return jsonify({'msg': f'{c} novas'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)