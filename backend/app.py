# backend/app.py
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db, User, Question, UserActivity
import pandas as pd
import numpy as np

# Inicialização
app = Flask(__name__)
app.config.from_object(Config)

# Extensões
db.init_app(app)
migrate = Migrate(app, db)
CORS(app) # Permite que o React acesse o Backend

# --- ROTAS DE AUTENTICAÇÃO ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Verifica duplicidade
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    # Cria usuário (senha simples)
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=data['password']
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuário criado!', 'user': new_user.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    # Comparação direta de senha (texto plano)
    if user and user.password == data['password']:
        return jsonify({
            'message': 'Login realizado',
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Credenciais inválidas'}), 401

# --- ROTAS DE USUÁRIO ---

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

# --- ROTAS DE ATIVIDADES (INTELIGÊNCIA DO SISTEMA) ---

@app.route('/api/activities/next/<int:user_id>', methods=['GET'])
def get_next_activity(user_id):
    """Retorna 5 questões baseadas no nível do usuário (Opção A: Heurística)"""
    user = User.query.get_or_404(user_id)
    
    # 1. Define a dificuldade alvo baseada no nível
    target_difficulty = 'médio'
    if user.level == 'Iniciante':
        target_difficulty = 'fácil'
    elif user.level == 'Avançado':
        target_difficulty = 'difícil'
        
    # 2. Pega IDs das questões já respondidas para não repetir
    answered_ids = db.session.query(UserActivity.question_id).filter_by(user_id=user_id)
    
    # 3. Busca 5 questões aleatórias da dificuldade alvo
    questions = Question.query.filter(
        Question.difficulty == target_difficulty,
        ~Question.id.in_(answered_ids)
    ).order_by(db.func.random()).limit(5).all()
    
    # Fallback: Se não tiver questões suficientes da dificuldade, completa com outras
    if len(questions) < 5:
        remaining = 5 - len(questions)
        extra_questions = Question.query.filter(
            ~Question.id.in_(answered_ids),
            ~Question.id.in_([q.id for q in questions])
        ).limit(remaining).all()
        questions.extend(extra_questions)
        
    return jsonify([q.to_dict() for q in questions])

@app.route('/api/activities/submit', methods=['POST'])
def submit_activity():
    """Recebe respostas, calcula nota usando Pandas/Numpy e atualiza nível"""
    data = request.get_json()
    user_id = data['user_id']
    answers = data['answers'] # Lista: [{question_id: 1, answer: "X"}, ...]
    
    user = User.query.get_or_404(user_id)
    
    round_score = 0
    correct_count = 0
    total_qs = len(answers)
    
    # Processa cada resposta
    for item in answers:
        question = Question.query.get(item['question_id'])
        is_correct = (question.correct_answer == item['answer'])
        
        if is_correct:
            round_score += 10
            correct_count += 1
            
        # Salva histórico
        activity = UserActivity(
            user_id=user_id,
            question_id=question.id,
            user_answer=item['answer'],
            is_correct=is_correct
        )
        db.session.add(activity)
    
    # Envia para o banco sem fechar a transação para podermos consultar logo abaixo
    db.session.flush() 
    
    # --- USO DE PANDAS E NUMPY ---
    # Recupera todo histórico do usuário para recalcular precisão global
    query = f"SELECT is_correct FROM user_activities WHERE user_id = {user_id}"
    df = pd.read_sql(query, db.engine)
    
    if not df.empty:
        # Converte boolean para int (0 e 1) e calcula média com Numpy
        vals = df['is_correct'].astype(int).values
        new_accuracy = float(np.mean(vals) * 100)
        total_activities_count = int(len(df))
    else:
        new_accuracy = 0.0
        total_activities_count = 0

    # Lógica de Mudança de Nível (Baseada apenas na rodada atual)
    round_accuracy = (correct_count / total_qs) * 100 if total_qs > 0 else 0
    new_level = user.level
    
    if round_accuracy >= 80:
        # Sobe de nível
        if user.level == 'Iniciante': new_level = 'Intermediário'
        elif user.level == 'Intermediário': new_level = 'Avançado'
    elif round_accuracy < 40:
        # Desce de nível
        if user.level == 'Avançado': new_level = 'Intermediário'
        elif user.level == 'Intermediário': new_level = 'Iniciante'

    # Atualiza Usuário
    user.score += round_score
    user.total_activities = total_activities_count
    user.accuracy = round(new_accuracy, 1)
    user.level = new_level
    
    db.session.commit()
    
    return jsonify({
        'message': 'Processado',
        'new_score': user.score,
        'new_level': user.level,
        'accuracy': user.accuracy,
        'round_accuracy': round_accuracy
    })

@app.route('/api/seed', methods=['POST'])
def seed_database():
    """Popula o banco com questões iniciais"""
    questions_data = [
        {"statement": "Qual é o principal componente do núcleo de uma célula eucariótica?", "options": ["Mitocôndria", "Membrana Plasmática", "Núcleo", "Ribossomo"], "correct_answer": "Núcleo", "difficulty": "fácil", "topic": "Biologia"},
        {"statement": "O que é React Hooks?", "options": ["Funções que permitem usar o state...", "Uma biblioteca de CSS", "Um roteador", "Uma classe"], "correct_answer": "Funções que permitem usar o state...", "difficulty": "médio", "topic": "Programação"},
        {"statement": "Qual lei de Newton descreve F=m.a?", "options": ["Primeira Lei", "Segunda Lei", "Terceira Lei", "Lei da Gravitação"], "correct_answer": "Segunda Lei", "difficulty": "difícil", "topic": "Física"},
        {"statement": "Quem escreveu 'Dom Quixote'?", "options": ["García Márquez", "Cervantes", "Shakespeare", "Borges"], "correct_answer": "Cervantes", "difficulty": "fácil", "topic": "Literatura"},
        {"statement": "Teorema de Pitágoras?", "options": ["A = pi.r^2", "a^2 + b^2 = c^2", "E = mc^2", "H2O"], "correct_answer": "a^2 + b^2 = c^2", "difficulty": "médio", "topic": "Matemática"},
    ]
    
    count = 0
    for q in questions_data:
        if not Question.query.filter_by(statement=q['statement']).first():
            new_q = Question(
                statement=q['statement'],
                options=q['options'],
                correct_answer=q['correct_answer'],
                difficulty=q['difficulty'],
                topic=q['topic']
            )
            db.session.add(new_q)
            count += 1
    
    db.session.commit()
    return jsonify({'message': f'{count} questões inseridas com sucesso!'})

@app.route('/api/user/progress/<int:user_id>', methods=['GET'])
def get_user_progress(user_id):
    """Retorna o histórico de desempenho agrupado por data para o gráfico"""
    
    # 1. Busca dados brutos com SQL
    query = f"""
        SELECT timestamp, is_correct 
        FROM user_activities 
        WHERE user_id = {user_id} 
        ORDER BY timestamp ASC
    """
    try:
        df = pd.read_sql(query, db.engine)
        
        if df.empty:
            return jsonify({'labels': [], 'data': []})

        # 2. Processamento com Pandas
        # Converte a coluna timestamp para apenas DATA (remove horas)
        df['date'] = pd.to_datetime(df['timestamp']).dt.strftime('%d/%m')
        
        # Converte booleano para inteiro (0 ou 1)
        df['score'] = df['is_correct'].astype(int) * 100
        
        # Agrupa por data e calcula a média de precisão do dia
        daily_stats = df.groupby('date')['score'].mean().reset_index()
        
        # Prepara para o Frontend (listas simples)
        labels = daily_stats['date'].tolist()
        data_points = daily_stats['score'].round(1).tolist()
        
        return jsonify({
            'labels': labels, # Ex: ['20/11', '21/11']
            'data': data_points # Ex: [50.0, 80.5]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)