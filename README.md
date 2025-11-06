# To-Do List Backend API

API RESTful desenvolvida com NestJS para gerenciamento de tarefas (To-Do List) com autenticação JWT e banco de dados PostgreSQL.

**Repositório:** [https://github.com/leandrosuy2/todo-backend](https://github.com/leandrosuy2/todo-backend)

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticação via tokens
- **Swagger** - Documentação interativa da API
- **TypeScript** - Linguagem de programação
- **class-validator** - Validação de dados

## 📋 Pré-requisitos

### Opção 1: Executar sem Docker
- Node.js (v18 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

### Opção 2: Executar com Docker (Recomendado)
- Docker instalado
- Docker Compose instalado

## ⚙️ Instalação

### 🐳 Opção 1: Executar com Docker (Recomendado)

A forma mais fácil de executar o projeto é usando Docker Compose, que já configura o banco de dados PostgreSQL automaticamente.

1. **Clone o repositório:**
```bash
git clone https://github.com/leandrosuy2/todo-backend.git
cd todo-backend
```

2. **Crie o arquivo `.env` na raiz do projeto:**
```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application Configuration
PORT=3000
NODE_ENV=development
```

3. **Execute com Docker Compose:**

**Produção:**
```bash
# Construir e iniciar os containers
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar os containers
docker-compose down
```

**Desenvolvimento (com hot-reload):**
```bash
# Construir e iniciar os containers
docker-compose -f docker-compose.dev.yml up

# Parar os containers
docker-compose -f docker-compose.dev.yml down
```

A aplicação estará disponível em `http://localhost:3000`  
A documentação Swagger estará disponível em `http://localhost:3000/api`

**Comandos úteis do Docker:**
```bash
# Verificar status dos containers
docker-compose ps

# Acessar o banco de dados
docker-compose exec postgres psql -U postgres -d todo_db

# Ver logs do banco de dados
docker-compose logs -f postgres

# Reconstruir a aplicação após mudanças
docker-compose build app
docker-compose up -d

# Limpar tudo e começar do zero
docker-compose down -v
```

### 💻 Opção 2: Executar sem Docker

1. **Clone o repositório:**
```bash
git clone https://github.com/leandrosuy2/todo-backend.git
cd todo-backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
# Crie o arquivo .env com as seguintes variáveis:
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=todo_db

JWT_SECRET=seu-secret-key-super-seguro-aqui

PORT=3000
NODE_ENV=development
```

4. **Crie o banco de dados PostgreSQL:**
```sql
CREATE DATABASE todo_db;
```

5. **Execute as migrações (o Sequelize criará as tabelas automaticamente em desenvolvimento):**
```bash
npm run start:dev
```

## 🏃 Executando a aplicação

### Com Docker
```bash
# Produção
docker-compose up -d

# Desenvolvimento (com hot-reload)
docker-compose -f docker-compose.dev.yml up
```

### Sem Docker
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`  
A documentação Swagger estará disponível em `http://localhost:3000/api`

## 📚 Endpoints da API

### Autenticação

#### POST /register
Registra um novo usuário.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /login
Autentica um usuário existente.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tarefas (Require autenticação)

Todos os endpoints de tarefas requerem autenticação via Bearer Token no header:
```
Authorization: Bearer <token>
```

#### GET /tasks
Lista todas as tarefas do usuário autenticado com paginação e filtros.

**Query Parameters:**
- `status` (opcional): `pending` ou `completed`
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)

**Exemplo:**
```
GET /tasks?status=pending&page=1&limit=10
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write detailed documentation",
      "status": "pending",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST /tasks
Cria uma nova tarefa.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write detailed documentation for the API"
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write detailed documentation for the API",
  "status": "pending",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /tasks/:id
Obtém uma tarefa específica por ID.

**Response (200):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write detailed documentation",
  "status": "pending",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /tasks/:id
Atualiza uma tarefa existente.

**Request Body (todos os campos são opcionais):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### PATCH /tasks/:id/complete
Marca uma tarefa como concluída.

**Response (200):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write detailed documentation",
  "status": "completed",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### DELETE /tasks/:id
Exclui uma tarefa.

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

## 📡 Comandos cURL

Aqui estão todos os comandos cURL para testar a API. Substitua `YOUR_TOKEN` pelo token JWT obtido após o login.

**Base URL:** `http://localhost:3000`

### Autenticação

#### 1. Registrar novo usuário
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Tarefas

⚠️ **Nota:** Todos os endpoints de tarefas requerem autenticação. Substitua `YOUR_TOKEN` pelo token obtido no login.

#### 3. Criar nova tarefa
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write detailed documentation for the API"
  }'
```

#### 4. Listar todas as tarefas (sem filtros)
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Listar tarefas com filtro de status
```bash
curl -X GET "http://localhost:3000/tasks?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Listar tarefas com paginação
```bash
curl -X GET "http://localhost:3000/tasks?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 7. Listar tarefas com filtro e paginação
```bash
curl -X GET "http://localhost:3000/tasks?status=completed&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 8. Obter tarefa por ID
```bash
curl -X GET http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 9. Atualizar tarefa (PUT)
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated title",
    "description": "Updated description",
    "status": "completed"
  }'
```

#### 10. Marcar tarefa como concluída
```bash
curl -X PATCH http://localhost:3000/tasks/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 11. Deletar tarefa
```bash
curl -X DELETE http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Exemplo de fluxo completo

1. **Registrar usuário:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

2. **Fazer login e salvar o token:**
```bash
# No Windows PowerShell:
$response = curl -X POST http://localhost:3000/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"john@example.com\",\"password\":\"password123\"}'
$token = ($response | ConvertFrom-Json).token

# No Linux/Mac:
TOKEN=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  | jq -r '.token')
```

3. **Criar tarefa usando o token:**
```bash
# Windows PowerShell:
curl -X POST http://localhost:3000/tasks `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"title\":\"Minha primeira tarefa\",\"description\":\"Descrição da tarefa\"}'

# Linux/Mac:
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Minha primeira tarefa","description":"Descrição da tarefa"}'
```

## 🏗️ Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── dto/                # DTOs de autenticação
│   ├── guards/             # Guards (JWT Auth Guard)
│   ├── strategies/         # Estratégias (JWT Strategy)
│   ├── auth.controller.ts  # Controller de autenticação
│   ├── auth.service.ts     # Service de autenticação
│   └── auth.module.ts      # Módulo de autenticação
├── tasks/                   # Módulo de tarefas
│   ├── dto/                # DTOs de tarefas
│   ├── tasks.controller.ts # Controller de tarefas
│   ├── tasks.service.ts    # Service de tarefas
│   └── tasks.module.ts     # Módulo de tarefas
├── models/                  # Modelos Sequelize
│   ├── user.model.ts       # Modelo de Usuário
│   └── task.model.ts       # Modelo de Tarefa
├── config/                  # Configurações
│   └── database.config.ts  # Configuração do banco
├── database/                # Módulo de banco de dados
│   └── database.module.ts  # Módulo do banco
├── app.module.ts           # Módulo principal
└── main.ts                 # Arquivo de entrada
```

## 🔒 Segurança

- Senhas são criptografadas usando `bcryptjs` com hash de 10 rounds
- Autenticação via JWT com expiração de 7 dias
- Validação de dados de entrada usando `class-validator`
- Middleware de autenticação protege rotas privadas
- CORS habilitado para comunicação com frontend

## ✅ Validações

### Registro/Login
- Email deve ser válido
- Senha deve ter no mínimo 6 caracteres
- Nome é obrigatório

### Tarefas
- Título é obrigatório
- Descrição é opcional
- Status deve ser `pending` ou `completed`

## 🧪 Testes

O projeto possui uma suíte completa de testes, incluindo testes unitários e testes end-to-end (E2E).

### 📊 Estrutura de Testes

```
src/
├── auth/
│   └── auth.service.spec.ts      # Testes unitários do AuthService (8 testes)
└── tasks/
    └── tasks.service.spec.ts      # Testes unitários do TasksService (12 testes)
test/
├── app.e2e-spec.ts                # Testes E2E da aplicação
├── auth.e2e-spec.ts                # Testes E2E de autenticação (11 testes)
└── tasks.e2e-spec.ts               # Testes E2E de tarefas (17 testes)
```

**Total: 20 testes unitários + 29 testes E2E = 49 testes**

### 🚀 Executando os Testes

```bash
# Executar todos os testes unitários
npm run test

# Executar testes unitários em modo watch (re-executa ao salvar arquivos)
npm run test:watch

# Executar testes unitários com cobertura de código
npm run test:cov

# Executar apenas testes E2E
npm run test:e2e

# Executar todos os testes (unitários + E2E)
npm run test && npm run test:e2e
```

### 📋 Cobertura de Testes

#### Testes Unitários

**AuthService** (8 testes):
- ✅ Registro de usuário (sucesso e validações)
- ✅ Login de usuário (sucesso e validações)
- ✅ Validação de usuário por ID
- ✅ Criptografia de senhas
- ✅ Geração de tokens JWT

**TasksService** (12 testes):
- ✅ Criação de tarefas
- ✅ Listagem com filtros e paginação
- ✅ Busca por ID
- ✅ Atualização de tarefas
- ✅ Exclusão de tarefas
- ✅ Marcar como concluída

#### Testes E2E

**Autenticação** (11 testes):
- ✅ Registro de usuário (sucesso e casos de erro)
- ✅ Login (sucesso e casos de erro)
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros HTTP

**Tarefas** (17 testes):
- ✅ CRUD completo de tarefas
- ✅ Filtros por status
- ✅ Paginação
- ✅ Isolamento de dados entre usuários
- ✅ Autenticação e autorização
- ✅ Validação de dados

### 🔧 Configuração dos Testes

- **Testes Unitários**: Usam mocks para Sequelize, JWT e bcrypt
- **Testes E2E**: Usam SQLite em memória (`:memory:`) para isolamento completo
- **Framework**: Jest com suporte TypeScript via `ts-jest`
- **Timeout**: 30 segundos para testes E2E

### 📈 Resultados Esperados

Ao executar `npm run test`, você deve ver:

```
PASS src/auth/auth.service.spec.ts
PASS src/tasks/tasks.service.spec.ts

Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
```

Ao executar `npm run test:e2e`, você deve ver:

```
PASS test/app.e2e-spec.ts
PASS test/auth.e2e-spec.ts
PASS test/tasks.e2e-spec.ts

Test Suites: 3 passed, 3 total
Tests:       29 passed, 29 total
```

### 📝 Documentação Detalhada

Para mais informações sobre os testes, consulte o arquivo [TESTES.md](./TESTES.md).

## 📝 Documentação

A documentação completa da API está disponível via Swagger em:
```
http://localhost:3000/api
```

## 🎯 Funcionalidades Implementadas

- ✅ Autenticação de usuário (registro e login)
- ✅ Autenticação JWT
- ✅ Middleware de autenticação para rotas privadas
- ✅ CRUD completo de tarefas
- ✅ Marcar tarefas como concluídas
- ✅ Filtrar tarefas por status (pendentes/concluídas)
- ✅ Paginação no endpoint de listagem
- ✅ Validação de dados de entrada
- ✅ Documentação Swagger
- ✅ Arquitetura em camadas (controllers, services, models)
- ✅ Criptografia de senhas
- ✅ Tratamento de erros
- ✅ **Testes unitários completos** (20 testes)
- ✅ **Testes E2E completos** (29 testes)

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Padrão | Observação |
|----------|-----------|--------|------------|
| `DB_HOST` | Host do PostgreSQL | `localhost` | Use `postgres` quando executando com Docker |
| `DB_PORT` | Porta do PostgreSQL | `5432` | - |
| `DB_USER` | Usuário do PostgreSQL | `postgres` | - |
| `DB_PASSWORD` | Senha do PostgreSQL | `postgres` | - |
| `DB_NAME` | Nome do banco de dados | `todo_db` | - |
| `JWT_SECRET` | Chave secreta para JWT | - | **Obrigatório** - Altere em produção |
| `PORT` | Porta da aplicação | `3000` | - |
| `NODE_ENV` | Ambiente de execução | `development` | `development` ou `production` |

**Nota:** Quando executando com Docker, o `DB_HOST` deve ser `postgres` (nome do serviço no docker-compose).

## 📄 Licença

Este projeto é privado e não possui licença.

## 🐳 Docker

O projeto inclui configuração completa do Docker com:

- **Dockerfile** - Multi-stage build otimizado para produção
- **docker-compose.yml** - Configuração para produção
- **docker-compose.dev.yml** - Configuração para desenvolvimento com hot-reload
- **PostgreSQL** - Banco de dados em container separado
- **Volumes persistentes** - Dados do banco são mantidos entre reinicializações
- **Health checks** - Garante que o banco está pronto antes de iniciar a aplicação

Para mais detalhes sobre Docker, consulte o arquivo [DOCKER.md](./DOCKER.md).

## 👨‍💻 Autor

Leandro Dantas
Desenvolvido com ❤️ usando NestJS

**Repositório:** [https://github.com/leandrosuy2/todo-backend](https://github.com/leandrosuy2/todo-backend)
