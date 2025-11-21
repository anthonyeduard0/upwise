# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db, User, Question, UserActivity
import pandas as pd
import numpy as np
import google.generativeai as genai # Import da IA

# Inicialização
app = Flask(__name__)
app.config.from_object(Config)

# Extensões
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)

# Configuração da IA (Gemini)
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- FUNÇÃO AUXILIAR DE IA ---
def generate_ai_feedback(question_text, user_answer, correct_answer, is_correct):
    """Gera feedback curto e motivacional usando IA ou Fallback"""
    
    # Se não tiver chave da API, usa frases prontas (Modo Offline)
    if not GOOGLE_API_KEY:
        if is_correct:
            return "Resposta correta! Você demonstrou bom domínio deste conceito."
        return f"Que pena, a resposta correta era '{correct_answer}'. Revise este tópico para melhorar."

    try:
        # Configura o modelo
        model = genai.GenerativeModel('gemini-pro')
        
        status = "acertou" if is_correct else "errou"
        prompt = f"""
        Aja como um tutor universitário motivador e breve.
        O aluno respondeu uma questão de múltipla escolha.
        Pergunta: "{question_text}"
        Resposta do aluno: "{user_answer}"
        Resposta correta: "{correct_answer}"
        O aluno {status}.
        
        Gere um feedback de no máximo 2 frases. 
        Se ele errou, explique brevemente o porquê e dê uma dica.
        Se ele acertou, parabenize e reforce o conceito.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Erro na IA: {e}")
        return "Feedback indisponível no momento, mas continue estudando!"

# --- ROTAS DE AUTENTICAÇÃO ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400
    
    new_user = User(name=data['name'], email=data['email'], password=data['password'])
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
    if user and user.password == data['password']:
        return jsonify({'message': 'Login realizado', 'user': user.to_dict()}), 200
    return jsonify({'error': 'Credenciais inválidas'}), 401

# --- ROTAS DE USUÁRIO ---

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        # Em app real validaria duplicidade, mas vamos simplificar
        user.email = data['email']
        
    db.session.commit()
    return jsonify({'message': 'Perfil atualizado', 'user': user.to_dict()})

# --- ROTAS DE ATIVIDADES ---

@app.route('/api/activities/next/<int:user_id>', methods=['GET'])
def get_next_activity(user_id):
    user = User.query.get_or_404(user_id)
    
    target_difficulty = 'médio'
    if user.level == 'Iniciante': target_difficulty = 'fácil'
    elif user.level == 'Avançado': target_difficulty = 'difícil'
        
    answered_ids = db.session.query(UserActivity.question_id).filter_by(user_id=user_id)
    
    questions = Question.query.filter(
        Question.difficulty == target_difficulty,
        ~Question.id.in_(answered_ids)
    ).order_by(db.func.random()).limit(5).all()
    
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
    data = request.get_json()
    user_id = data['user_id']
    answers = data['answers'] 
    
    user = User.query.get_or_404(user_id)
    
    round_score = 0
    correct_count = 0
    total_qs = len(answers)
    
    # Lista para guardar feedbacks individuais (poderíamos retornar isso pro front)
    feedbacks = []
    
    # Processa respostas
    for item in answers:
        question = Question.query.get(item['question_id'])
        is_correct = (question.correct_answer == item['answer'])
        
        if is_correct:
            round_score += 10
            correct_count += 1
            
        activity = UserActivity(
            user_id=user_id,
            question_id=question.id,
            user_answer=item['answer'],
            is_correct=is_correct
        )
        db.session.add(activity)
        
    # Flush para salvar atividades antes de calcular stats
    db.session.flush()
    
    # Gera Feedback Geral da Rodada usando IA (Baseado no desempenho geral da rodada)
    # Pegamos a última questão respondida como exemplo para o feedback ou fazemos um geral
    last_q_id = answers[-1]['question_id']
    last_q_ans = answers[-1]['answer']
    last_q_obj = Question.query.get(last_q_id)
    last_is_correct = (last_q_obj.correct_answer == last_q_ans)
    
    # Chamada à IA (Gera feedback sobre a última questão da rodada para não ficar lento)
    ai_feedback = generate_ai_feedback(
        last_q_obj.statement, 
        last_q_ans, 
        last_q_obj.correct_answer, 
        last_is_correct
    )
    
    # --- PANDAS/NUMPY ---
    query = f"SELECT is_correct FROM user_activities WHERE user_id = {user_id}"
    df = pd.read_sql(query, db.engine)
    
    if not df.empty:
        vals = df['is_correct'].astype(int).values
        new_accuracy = float(np.mean(vals) * 100)
        total_activities_count = int(len(df))
    else:
        new_accuracy = 0.0
        total_activities_count = 0

    round_accuracy = (correct_count / total_qs) * 100 if total_qs > 0 else 0
    new_level = user.level
    
    if round_accuracy >= 80:
        if user.level == 'Iniciante': new_level = 'Intermediário'
        elif user.level == 'Intermediário': new_level = 'Avançado'
    elif round_accuracy < 40:
        if user.level == 'Avançado': new_level = 'Intermediário'
        elif user.level == 'Intermediário': new_level = 'Iniciante'

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
        'round_accuracy': round_accuracy,
        'ai_feedback': ai_feedback # Retornamos o texto da IA
    })

@app.route('/api/user/progress/<int:user_id>', methods=['GET'])
def get_user_progress(user_id):
    query = f"SELECT timestamp, is_correct FROM user_activities WHERE user_id = {user_id} ORDER BY timestamp ASC"
    try:
        df = pd.read_sql(query, db.engine)
        if df.empty: return jsonify({'labels': [], 'data': []})
        df['date'] = pd.to_datetime(df['timestamp']).dt.strftime('%d/%m')
        df['score'] = df['is_correct'].astype(int) * 100
        daily_stats = df.groupby('date')['score'].mean().reset_index()
        return jsonify({'labels': daily_stats['date'].tolist(), 'data': daily_stats['score'].round(1).tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/seed', methods=['POST'])
def seed_database():
    # Lista expandida de questões para testar melhor a adaptação
    questions_data = [
        # FÁCIL
        {"statement": "Qual é a capital da França?", "options": ["Londres", "Berlim", "Paris", "Madri"], "correct_answer": "Paris", "difficulty": "fácil", "topic": "Geografia"},
        {"statement": "Quanto é 2 + 2?", "options": ["3", "4", "5", "6"], "correct_answer": "4", "difficulty": "fácil", "topic": "Matemática"},
        {"statement": "Quem pintou a Mona Lisa?", "options": ["Van Gogh", "Da Vinci", "Picasso", "Monet"], "correct_answer": "Da Vinci", "difficulty": "fácil", "topic": "Arte"},
        {"statement": "Qual é o principal componente do núcleo celular?", "options": ["Mitocôndria", "Núcleo", "Ribossomo", "Lisossomo"], "correct_answer": "Núcleo", "difficulty": "fácil", "topic": "Biologia"},
        {"statement": "O que significa HTML?", "options": ["HyperText Markup Language", "HighText Machine Learning", "HyperTool Multi Level", "Home Tool Markup"], "correct_answer": "HyperText Markup Language", "difficulty": "fácil", "topic": "Programação"},
        
        # MÉDIO
        {"statement": "O que é React Hooks?", "options": ["Funções de estado", "Banco de dados", "Servidor", "Estilização"], "correct_answer": "Funções de estado", "difficulty": "médio", "topic": "Programação"},
        {"statement": "Qual a fórmula da água?", "options": ["CO2", "H2O", "NaCl", "O2"], "correct_answer": "H2O", "difficulty": "médio", "topic": "Química"},
        {"statement": "Quem escreveu Dom Casmurro?", "options": ["Machado de Assis", "José de Alencar", "Jorge Amado", "Clarice Lispector"], "correct_answer": "Machado de Assis", "difficulty": "médio", "topic": "Literatura"},
        {"statement": "Resolva: 15% de 200", "options": ["20", "25", "30", "35"], "correct_answer": "30", "difficulty": "médio", "topic": "Matemática"},
        {"statement": "Qual planeta é conhecido como Planeta Vermelho?", "options": ["Vênus", "Marte", "Júpiter", "Saturno"], "correct_answer": "Marte", "difficulty": "médio", "topic": "Astronomia"},

        # DIFÍCIL
        {"statement": "Qual lei descreve F=ma?", "options": ["1ª Lei de Newton", "2ª Lei de Newton", "3ª Lei de Newton", "Lei de Ohm"], "correct_answer": "2ª Lei de Newton", "difficulty": "difícil", "topic": "Física"},
        {"statement": "O que é um algoritmo recursivo?", "options": ["Loop infinito", "Chama a si mesmo", "Estrutura de dados", "Banco SQL"], "correct_answer": "Chama a si mesmo", "difficulty": "difícil", "topic": "Computação"},
        {"statement": "Qual a derivada de x^2?", "options": ["x", "2x", "x^3/3", "1"], "correct_answer": "2x", "difficulty": "difícil", "topic": "Cálculo"},
        {"statement": "Em que ano o homem pisou na lua?", "options": ["1959", "1965", "1969", "1972"], "correct_answer": "1969", "difficulty": "difícil", "topic": "História"},
        {"statement": "O que é mitose?", "options": ["Divisão celular", "Respiração", "Digestão", "Circulação"], "correct_answer": "Divisão celular", "difficulty": "difícil", "topic": "Biologia"}
    ]
    
    count = 0
    for q in questions_data:
        if not Question.query.filter_by(statement=q['statement']).first():
            new_q = Question(statement=q['statement'], options=q['options'], correct_answer=q['correct_answer'], difficulty=q['difficulty'], topic=q['topic'])
            db.session.add(new_q)
            count += 1
    
    db.session.commit()
    return jsonify({'message': f'{count} questões inseridas!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)