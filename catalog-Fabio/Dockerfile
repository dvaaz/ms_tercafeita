FROM node:20-bookworm-slim

WORKDIR /app

# Necessário para Prisma em runtime
RUN apt-get update     && apt-get install -y --no-install-recommends openssl     && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# Copia todo o projeto, incluindo o .env de cada API
COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

EXPOSE 3010

CMD ["npm", "run", "start:prod"]
