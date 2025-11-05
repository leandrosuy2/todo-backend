# Docker Setup - To-Do Backend

Este guia explica como executar o projeto usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado

## 🚀 Início Rápido

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

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

### 2. Executar em produção

```bash
# Construir e iniciar os containers
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar os containers
docker-compose down

# Parar e remover volumes (apaga o banco de dados)
docker-compose down -v
```

### 3. Executar em desenvolvimento (com hot-reload)

```bash
# Construir e iniciar os containers
docker-compose -f docker-compose.dev.yml up

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f app

# Parar os containers
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes
docker-compose -f docker-compose.dev.yml down -v
```

## 📝 Comandos Úteis

### Verificar status dos containers
```bash
docker-compose ps
```

### Acessar o banco de dados
```bash
docker-compose exec postgres psql -U postgres -d todo_db
```

### Executar comandos no container da aplicação
```bash
docker-compose exec app sh
```

### Reconstruir a aplicação após mudanças
```bash
docker-compose build app
docker-compose up -d
```

### Ver logs do banco de dados
```bash
docker-compose logs -f postgres
```

## 🌐 Acessos

Após iniciar os containers:

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DB_HOST` | Host do PostgreSQL | `postgres` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USER` | Usuário do PostgreSQL | `postgres` |
| `DB_PASSWORD` | Senha do PostgreSQL | `postgres` |
| `DB_NAME` | Nome do banco de dados | `todo_db` |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `PORT` | Porta da aplicação | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |

### Volumes

- `postgres_data`: Dados persistentes do PostgreSQL (produção)
- `postgres_data_dev`: Dados persistentes do PostgreSQL (desenvolvimento)

## 🐛 Troubleshooting

### Erro de conexão com o banco de dados

Certifique-se de que o container do PostgreSQL está saudável:
```bash
docker-compose ps
```

### Limpar tudo e começar do zero

```bash
# Parar containers, remover volumes e imagens
docker-compose down -v
docker-compose rm -f
docker rmi todo-backend_app
```

### Reconstruir do zero

```bash
docker-compose build --no-cache
docker-compose up -d
```

