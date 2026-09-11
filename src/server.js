const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gerenciador_tarefas',
});

app.use(express.json());

// Função de inicialização do banco de dados para criar a tabela de tarefas
async function initDb(retries = 5, delay = 2000) {
  const queryText = `
    CREATE TABLE IF NOT EXISTS tarefas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      concluida BOOLEAN DEFAULT FALSE,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  while (retries > 0) {
    try {
      await pool.query(queryText);
      console.log('Tabela "tarefas" verificada/criada com sucesso.');
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

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await initDb();
});
