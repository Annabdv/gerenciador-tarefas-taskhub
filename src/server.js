const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_para_desenvolvimento';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gerenciador_tarefas',
});

app.use(express.json());
app.use(express.static('public'));

// Função de inicialização do banco de dados para criar as tabelas
async function initDb(retries = 5, delay = 2000) {
  const queryText = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tarefas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      concluida BOOLEAN DEFAULT FALSE,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;
  `;
  while (retries > 0) {
    try {
      await pool.query(queryText);
      console.log('Tabelas verificadas/criadas com sucesso.');
      break;
    } catch (error) {
      retries -= 1;
      console.error(`Erro ao inicializar banco de dados. Tentativas restantes: ${retries}`, error.message);
      if (retries === 0) break;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.usuario = user;
    next();
  });
}

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

// Healthz realizando consulta real ao banco
app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro de conexão com o banco:', error);
    res.status(500).send('Database connection error');
  }
});

// Rota para cadastrar novos usuários
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const emailExistente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (emailExistente.rows.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const novoUsuario = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senhaHash]
    );

    res.status(201).json(novoUsuario.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar usuário.' });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioResult.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = usuarioResult.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
});

// --- CRUD DE TAREFAS (Protegido por autenticação) ---

// Listar Tarefas do Usuário (GET /api/tarefas)
app.get('/api/tarefas', autenticarToken, async (req, res) => {
  try {
    const tarefas = await pool.query(
      'SELECT * FROM tarefas WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [req.usuario.id]
    );
    res.json(tarefas.rows);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ erro: 'Erro ao buscar tarefas.' });
  }
});

// Criar Nova Tarefa (POST /api/tarefas)
app.post('/api/tarefas', autenticarToken, async (req, res) => {
  const { titulo, descricao } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'O título da tarefa é obrigatório.' });
  }

  try {
    const novaTarefa = await pool.query(
      'INSERT INTO tarefas (titulo, descricao, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [titulo, descricao || '', req.usuario.id]
    );
    res.status(201).json(novaTarefa.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ erro: 'Erro ao criar tarefa.' });
  }
});

// Atualizar Tarefa (PUT /api/tarefas/:id)
app.put('/api/tarefas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, concluida } = req.body;

  try {
    const tarefaExistente = await pool.query(
      'SELECT * FROM tarefas WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );

    if (tarefaExistente.rows.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    const tarefaAtual = tarefaExistente.rows[0];
    const novoTitulo = titulo !== undefined ? titulo : tarefaAtual.titulo;
    const novaDescricao = descricao !== undefined ? descricao : tarefaAtual.descricao;
    const novaConcluida = concluida !== undefined ? concluida : tarefaAtual.concluida;

    const tarefaAtualizada = await pool.query(
      'UPDATE tarefas SET titulo = $1, descricao = $2, concluida = $3 WHERE id = $4 AND usuario_id = $5 RETURNING *',
      [novoTitulo, novaDescricao, novaConcluida, id, req.usuario.id]
    );

    res.json(tarefaAtualizada.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ erro: 'Erro ao atualizar tarefa.' });
  }
});

// Deletar Tarefa (DELETE /api/tarefas/:id)
app.delete('/api/tarefas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM tarefas WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    res.json({ mensagem: 'Tarefa removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ erro: 'Erro ao deletar tarefa.' });
  }
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await initDb();
});
