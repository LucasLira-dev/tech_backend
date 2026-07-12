# Tech Backend

API backend escalável construída com **NestJS 11** e **Prisma 7**, com autenticação via Better Auth e pagamentos via Stripe.

## 🚀 Tecnologias

- **Framework**: [NestJS 11.0.1](https://nestjs.com/)
- **Runtime**: [Node.js 20](https://nodejs.org/)
- **Linguagem**: [TypeScript 5.7.3](https://www.typescriptlang.org/)
- **ORM**: [Prisma 7.8.0](https://www.prisma.io/)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) (Neon Serverless)
- **Autenticação**: [Better Auth](https://www.better-auth.com/)
- **Pagamentos**: [Stripe](https://stripe.com/)
- **Validação**: [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer)
- **Linting**: [ESLint 9](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Containerização**: [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)

## 📦 Dependências Principais

### Produção
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` - Framework NestJS
- `@prisma/client`, `@prisma/adapter-neon`, `@neondatabase/serverless` - ORM e driver Neon
- `better-auth`, `@thallesp/nestjs-better-auth` - Autenticação
- `stripe` - Integração Stripe
- `class-validator`, `class-transformer` - Validação e transformação de DTOs
- `reflect-metadata`, `rxjs` - Dependências do NestJS

### Desenvolvimento
- `@nestjs/cli`, `@nestjs/schematics` - CLI do NestJS
- `@nestjs/testing` - Utilitários de teste
- `jest`, `ts-jest`, `supertest` - Testes unitários e E2E
- `prisma` - CLI do Prisma
- `typescript`, `ts-node`, `ts-loader` - Compilação TypeScript
- `eslint`, `prettier` - Linting e formatação

## 🛠️ Scripts Disponíveis

```bash
# Build para produção
npm run build

# Iniciar servidor
npm run start

# Iniciar com hot reload
npm run start:dev

# Modo debug com watch
npm run start:debug

# Iniciar produção
npm run start:prod

# Lint e auto-fix
npm run lint

# Formatar código
npm run format

# Seed do banco
npm run seed
```

## 🎯 Recursos

- ✅ CRUD completo de Produtos, Categorias, Carrinho, Wishlist e Pedidos
- ✅ Autenticação com Better Auth (email/senha + OAuth GitHub/Google)
- ✅ Sistema de roles (admin/client) com AdminGuard
- ✅ Integração Stripe (checkout sessions + webhooks)
- ✅ Validação de DTOs com class-validator
- ✅ Prisma com driver Neon Serverless
- ✅ Docker multi-stage para produção
- ✅ Seed com ~70+ produtos tech em 14 categorias

## 🚀 Como Começar

### Pré-requisitos
- Node.js 20+
- npm
- Docker (opcional, para banco local)

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/LucasLira-dev/tech_backend.git

# Entrar no diretório
cd tech_backend

# Instalar dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=brl
```

### Desenvolvimento

```bash
# Gerar Prisma Client
npx prisma generate

# Rodar migrações
npx prisma migrate dev

# Seed do banco
npm run seed

# Iniciar servidor com hot reload
npm run start:dev
```

O servidor estará disponível em [http://localhost:3001](http://localhost:3001)

### Docker

```bash
# Subir banco PostgreSQL
docker compose up -d

# Build e rodar a aplicação
docker build -t tech_backend .
docker run -p 3001:3001 --env-file .env tech_backend
```

## 📁 Estrutura do Projeto

```
tech_backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts                # Script de seed
│   └── products.json          # Dados de seed (~70+ produtos)
├── src/
│   ├── main.ts                # Ponto de entrada
│   ├── app.module.ts          # Módulo raiz
│   ├── auth/                  # Configuração Better Auth
│   ├── guards/                # AdminGuard (role-based)
│   ├── products/              # CRUD de produtos
│   ├── categories/            # Categorias (admin)
│   ├── cart/                  # Carrinho de compras
│   ├── wish-list/             # Lista de desejos
│   ├── orders/                # Pedidos
│   └── stripe/                # Checkout e webhooks Stripe
├── test/                      # Testes E2E
├── Dockerfile                 # Build multi-stage
├── compose.yml                # Docker Compose (PostgreSQL)
├── tsconfig.json              # Configuração TypeScript
├── nest-cli.json              # Configuração NestJS
└── package.json               # Dependências
```

## 🗄️ Banco de Dados

### Modelos

| Modelo | Descrição |
|---|---|
| `User` | Usuários com roles (admin/client) |
| `Session` | Sessões de autenticação |
| `Account` | Contas OAuth vinculadas |
| `Verification` | Verificação de email |
| `Category` | Categorias de produtos |
| `Product` | Produtos com preço, estoque, imagens |
| `Order` | Pedidos com status (pending/paid/cancelled) |
| `OrderItem` | Itens de cada pedido |
| `CartItem` | Itens do carrinho |
| `WishlistItem` | Itens da lista de desejos |

### Seed

```bash
# Rodar seed (limpa e recria produtos/categorias)
npm run seed

# Em produção, confirmar com variável de ambiente
SEED_RESET_CONFIRM=true npm run seed
```

## 🔐 Autenticação

- **Rota base**: `/api/auth/*` ( Better Auth)
- **Providers**: Email/senha, GitHub OAuth, Google OAuth
- **Roles**: `admin` e `client` (padrão: `client`)
- **Guard**: `AdminGuard` verifica role `admin` nas rotas protegidas

## 📡 Endpoints

### Produtos
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/products/create` | Admin | Criar produto |
| `GET` | `/products` | Público | Listar produtos |
| `GET` | `/products/:id` | Sessão | Buscar produto |
| `PATCH` | `/products/:id` | Admin | Atualizar produto |
| `DELETE` | `/products/:id` | Admin | Deletar produto |

### Carrinho
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/cart/add` | Sessão | Adicionar item |
| `GET` | `/cart/products` | Sessão | Listar itens |
| `PATCH` | `/cart/increase` | Sessão | Aumentar quantidade |
| `PATCH` | `/cart/decrease` | Sessão | Diminuir quantidade |
| `DELETE` | `/cart/remove` | Sessão | Remover item |

### Pedidos
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/orders` | Admin | Listar todos |
| `GET` | `/orders/myOrders` | Sessão | Meus pedidos |
| `PATCH` | `/orders/:id/status` | Admin | Atualizar status |

### Stripe
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/stripe/checkout` | Sessão | Criar sessão checkout |
| `POST` | `/stripe/webhook` | Público | Webhook Stripe |

## 📝 Licença

Este projeto está sob licença privada.

## 👤 Autor

**Lucas Lira**
- GitHub: [@LucasLira-dev](https://github.com/LucasLira-dev)

---

Feito com ❤️ por Lucas Lira
