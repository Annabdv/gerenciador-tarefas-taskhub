const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gerenciador_tarefas',
});

app.use(express.json());

// Função de inicialização do banco de dados para criar as tabelas
async function initDb(retries = 5, delay = 2000) {
  const queryText = `
    CREATE TABLE IF NOT EXISTS tarefas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      concluida BOOLEAN DEFAULT FALSE,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
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

app.get('/', (req, res) => {
  res.send('<h1>Gerenciador de Tarefas — Em Construção</h1>');
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

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await initDb();
});
