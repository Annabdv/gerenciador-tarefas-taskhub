# Gerenciador de Tarefas — CRUD com Autenticação

Aplicação web desenvolvida para a Atividade 2 da disciplina, com foco em autenticação de usuários, gerenciamento de tarefas e esteira automatizada de CI/CD.

## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js (Express)
- **Banco de Dados:** PostgreSQL
- **Servidor Web / Proxy Reverso:** Caddy
- **Containerização:** Docker & Docker Compose
- **CI/CD:** GitHub Actions & GitHub Container Registry (`ghcr.io`)

---

## 📌 Funcionalidades

### **Autenticação**
- `POST /api/usuarios` — Cadastro de novos usuários (senhas criptografadas com `bcryptjs`).
- `POST /api/login` — Autenticação de usuários com geração de token `JWT`.

### **CRUD de Tarefas (Protegido por Token JWT)**
- `GET /api/tarefas` — Lista todas as tarefas do usuário autenticado (READ).
- `POST /api/tarefas` — Cria uma nova tarefa (CREATE).
- `PUT /api/tarefas/:id` — Atualiza o título, descrição ou status de conclusão de uma tarefa (UPDATE).
- `DELETE /api/tarefas/:id` — Remove uma tarefa existente (DELETE).

### **Monitoramento**
- `GET /healthz` — Executa uma consulta real no banco (`SELECT 1`) e retorna status `200 OK` para validar a saúde da aplicação.

---

## 🛠️ Como Executar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/atividade2-crud-anna.alves.git](https://github.com/seu-usuario/atividade2-crud-anna.alves.git)
   cd atividade2-crud-anna.alves