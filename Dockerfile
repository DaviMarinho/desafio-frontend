# ============================================
# Stage 1: Build da aplicação React
# ============================================
FROM node:18-alpine AS builder

# Metadados
LABEL maintainer="prova-frontend"
LABEL description="Multi-stage build para React + TypeScript"

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files para aproveitar cache do Docker
COPY package*.json ./

# Instalar dependências (apenas de produção para otimizar)
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar arquivos de configuração
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

# Build da aplicação
RUN npm run build

# ============================================
# Stage 2: Servir com Nginx (Produção)
# ============================================
FROM nginx:1.25-alpine AS production

# Copiar build do stage anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Stage 3: Desenvolvimento com json-server
# ============================================
FROM node:18-alpine AS development

WORKDIR /app

# Copiar arquivos necessários
COPY package*.json ./
RUN npm install

COPY . .

# Expor portas (React: 3000, json-server: 3003)
EXPOSE 3000 3003

# Comando para iniciar ambos os serviços
CMD ["npm", "run", "dev:all"]
