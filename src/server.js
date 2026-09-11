const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>Gerenciador de Tarefas — Em Construção</h1>');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
