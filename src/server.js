const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/gerenciador_tarefas',
});

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
