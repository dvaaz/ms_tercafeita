# ShirtStore — E-commerce (Projeto Integrador)

Projeto de e-commerce em arquitetura de microserviços, desenvolvido em grupo (SENAC — Projeto Integrador). Cada backend é de responsabilidade de um integrante da equipe.

## Sumário

- [Stack tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Serviços](#serviços)
- [Autenticação e comunicação entre serviços](#autenticação-e-comunicação-entre-serviços)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões de arquitetura e limitações conhecidas](#decisões-de-arquitetura-e-limitações-conhecidas)

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Backend (todos os serviços) | [NestJS](https://nestjs.com/) 11 + TypeScript |
| ORM | [Prisma](https://www.prisma.io/) (5.x nos serviços de negócio, 7.x no gateway) |
| Banco de dados | MySQL/MariaDB — um schema por serviço, no mesmo servidor |
| Autenticação | JWT ([@nestjs/jwt](https://docs.nestjs.com/security/authentication) + [Passport](https://www.passportjs.org/)) |
| Comunicação entre serviços | HTTP/REST via [Axios](https://axios-http.com/) (`@nestjs/axios`) |
| Documentação de API | [Swagger](https://swagger.io/) (`@nestjs/swagger`) em cada serviço |
| Frontend | [React](https://react.dev/) 18 + [Vite](https://vitejs.dev/) + TypeScript + React Router |
| Containers | Docker + Docker Compose |
| Servidor do frontend em produção | Nginx (build estático) |

## Arquitetura

O projeto segue o padrão **API Gateway**: o frontend fala exclusivamente com o `gateway`, que é o único serviço exposto publicamente. Os demais serviços (`auth`, `catalog`, `cart`, `orders`, `reviews`) ficam apenas na rede interna do Docker e nunca são acessados diretamente de fora.

```
                         ┌─────────────┐
   Browser (React) ───▶ │   gateway   │  (único serviço com porta publicada)
                         └──────┬──────┘
                                │ valida JWT, injeta x-user-id/x-user-role,
                                │ encaminha pra rota configurada no banco
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
     auth        catalog      cart        orders      reviews
   (login,      (produtos)  (carrinho)   (pedidos)   (avaliações)
   usuários)
        ▲                       ▲           │ │           ▲
        │                       │           │ └───────────┘
        └───────────────────────┴───────────┘  (chamadas diretas
         (reviews busca nome de   (orders chama    serviço-a-serviço,
          usuário direto no auth)  cart direto)      fora do gateway)
```

Dois níveis de comunicação:

1. **Externa (cliente → gateway):** toda requisição do navegador passa pelo gateway, que decide, com base numa tabela `route_configs` no próprio banco do gateway, para onde encaminhar e se aquela rota exige autenticação.
2. **Interna (serviço → serviço):** quando um serviço precisa de dado de outro (`orders` busca o carrinho em `cart`, `reviews` busca o nome do autor em `auth`), a chamada é feita **direto**, sem passar pelo gateway — mais rápido e não sobrecarrega o ponto de entrada único.

### Por que o gateway consulta rotas no banco em vez de ter rotas fixas no código?

Permite cadastrar/alterar rotas (path, método, serviço de destino, se exige login) sem precisar redeploy do gateway — existe um CRUD administrativo (`/route-configs`) protegido por login de admin pra isso.

## Serviços

| Serviço | Pasta | Porta | Responsável | Responsabilidade |
|---|---|---|---|---|
| Gateway | `gateway-Felipe` | 3000 | Felipe | Ponto de entrada único, roteamento, validação de JWT de clientes, auditoria/logs de requisição, painel administrativo |
| Auth | `auth-Thales` | 3040 | Thales | Cadastro/login de clientes, emissão de tokens, dados de perfil e endereços |
| Catalog | `catalog-Fabio` | 3010 | Fábio | Catálogo de produtos (CRUD, busca por categoria) |
| Cart | `cart-Parlon` | 3030 | Parllon | Carrinho de compras (suporta carrinho de convidado, sem login) |
| Orders | `orders-Darley` | 3020 | Darley | Fechamento de pedido, pagamento, histórico de pedidos |
| Reviews | `reviews-Nikolas` | 3050 | Nikolas | Avaliações e comentários de produtos |
| Frontend | `frontend` | 5173 (dev) / 80 (container) | — | Interface do cliente (React) |

Cada serviço tem seu próprio banco (schema MySQL isolado) — não há acesso direto de um serviço ao banco de outro.

## Autenticação e comunicação entre serviços

### Fluxo do cliente (compras)

1. Cliente faz login em `POST /gateway/auth/login` → `auth-Thales` valida credenciais e emite um **access token (15 min)** e um **refresh token (7 dias)**.
2. O access token é assinado com a **secret ativa**, buscada dinamicamente do gateway (tabela `jwt_secrets`) — essa secret **rotaciona automaticamente a cada 7 dias** (cron job no gateway). O refresh token usa uma secret própria, fixa, que não rotaciona (senão invalidaria refresh tokens no meio da validade).
3. Em toda requisição autenticada, o gateway valida o access token contra a secret ativa do momento e, se válido, injeta os headers `x-user-id`, `x-user-email`, `x-user-role` antes de encaminhar pro serviço de destino.
4. Os serviços internos (`cart`, `catalog`, `orders`, `reviews`) **confiam nesses headers** em vez de revalidar o token — isso só é seguro porque nenhum deles tem porta exposta publicamente; a única forma de alcançá-los é através do gateway ou de outro serviço interno.
5. Quando o access token expira, o frontend usa o refresh token para obter um novo automaticamente (interceptor do Axios em `frontend/src/api/client.ts`), sem exigir novo login.

### Comunicação interna (serviço a serviço)

Duas variações, dependendo do caso:

- **Chave interna compartilhada** (`INTERNAL_KEY`, no header `x-internal-key`): usada quando o destino precisa ter certeza de que quem está chamando é outro serviço confiável, não um cliente qualquer — ex.: `orders` limpando o carrinho em `cart` depois de fechar um pedido, ou `reviews` buscando dados de usuário em `auth` (`GET /auth/users/:id`, que devolve nome/e-mail e por isso é protegido).
- **Repasse do `x-user-id`**: quando o serviço de origem já recebeu esse header do gateway (cliente autenticado) e só precisa repassar a identidade adiante — ex.: `orders` perguntando pro `cart` qual é o carrinho daquele usuário.

### Login administrativo do gateway

Separado do login de clientes: o gateway tem sua própria tabela `users` e sistema de login (`JWT_SECRET_GATEWAY`, secret fixa, diferente da secret dos clientes) para proteger os endpoints de administração (cadastro de rotas, rotação de secret, visualização de logs de auditoria).

## Como rodar o projeto

### Com Docker (recomendado)

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.

```bash
# na raiz do projeto
docker compose build
docker compose up
```

- Frontend: http://localhost:5173
- Gateway (API): http://localhost:3000
- Swagger de cada serviço: `http://localhost:<porta>/swagger` (só acessível de dentro da rede Docker, exceto o gateway)

Para derrubar: `docker compose down`.

### Local, sem Docker (um serviço por vez)

Cada serviço é independente. Em cada pasta:

```bash
npm install
npx prisma generate
npm run build
npm run start:prod
# ou, para desenvolvimento com hot-reload:
npm run start:dev
```

> **Atenção:** os arquivos `.env` de cada serviço apontam pros outros serviços via `http://localhost:<porta>` (para rodar local) — o `docker-compose.yml` sobrescreve essas variáveis com os nomes internos dos containers (`http://cart:3030` etc.) via `environment:`. Rodar tudo local ao mesmo tempo funciona, mas roteamento do gateway (tabela `route_configs`) está configurado pros hostnames do Docker por padrão.

Para o frontend:
```bash
cd frontend
npm install
npm run dev
```

## Variáveis de ambiente

Cada serviço tem um `.env.example` na própria pasta com os nomes de variável esperados (sem valores reais). Resumo do que cada uma faz:

| Variável | Onde | Para quê |
|---|---|---|
| `DATABASE_URL` | todos | Connection string do MySQL do serviço |
| `PORT` | todos (exceto gateway) | Porta que o serviço escuta |
| `JWT_SECRET` | auth, cart, catalog, orders, reviews (legado) | Não é mais usado para assinar/validar o token de cliente — ver `GATEWAY_URL` |
| `JWT_SECRET_GATEWAY` | gateway | Secret do login administrativo do gateway (fixa, separada da secret de clientes) |
| `INTERNAL_API_KEY` | gateway, auth | Protege `GET /jwt-secrets/external/active`, usado pelo `auth` para buscar a secret ativa |
| `INTERNAL_KEY` | auth, cart, orders, reviews | Chave compartilhada para chamadas serviço-a-serviço autenticadas |
| `GATEWAY_URL` | auth | URL do gateway, usada para buscar a secret ativa de assinatura |
| `JWT_REFRESH_SECRET` | auth | Secret fixa (não rotaciona) para o refresh token |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | auth | Tempo de vida do access/refresh token (padrão: 15min / 7d) |
| `ALLOWED_ORIGINS` | todos | Origens permitidas no CORS |
| `CATALOG_URL`, `CART_URL`, `AUTH_URL` | cart, orders, reviews | URLs dos serviços chamados diretamente (não via gateway) |
| `VITE_API_URL` | frontend | URL base da API (gateway), embutida no build do Vite |

## Estrutura de pastas

```
.
├── gateway-Felipe/       # API Gateway (NestJS)
├── auth-Thales/          # Autenticação e usuários (NestJS)
├── catalog-Fabio/        # Catálogo de produtos (NestJS)
├── cart-Parlon/          # Carrinho de compras (NestJS)
├── orders-Darley/        # Pedidos (NestJS)
├── reviews-Nikolas/      # Avaliações (NestJS)
├── frontend/             # Interface do cliente (React + Vite)
└── docker-compose.yml    # Orquestração de todos os serviços
```

Cada serviço NestJS segue a estrutura padrão do framework: `src/<módulo>/` com `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/`, e `prisma/schema.prisma` com o schema do banco daquele serviço.

## Decisões de arquitetura e limitações conhecidas

- **Carrinho de convidado:** `cart` aceita requisições sem login (identificando por `x-session-id`), então nem toda rota de carrinho exige token — só `/cart/merge` (que funde o carrinho de convidado com o do usuário após login) exige autenticação real no gateway.
- **Rotação de secret é só para o token de cliente:** a secret do login administrativo do gateway e a secret do refresh token são fixas — rotacioná-las é um processo manual (trocar no `.env`, reiniciar o serviço, o que derruba sessões ativas).
- **Sem migrations versionadas no gateway:** o schema do gateway foi aplicado direto no banco (`prisma db push`), sem histórico de migrations como os outros serviços têm.
- **Dependência do gateway estar no ar:** como o `auth` busca a secret ativa do gateway para assinar token, se o gateway cair, login/cadastro de clientes param de funcionar (sessões já ativas continuam válidas até o token expirar, pois a validação em cada request também depende do gateway estar no ar).
