# Imagem oficial do Playwright: já traz o Chromium e as dependências do sistema.
# A versão precisa ser a MESMA do pacote "playwright" no package.json (1.65.1).
FROM mcr.microsoft.com/playwright:v1.65.1-noble

WORKDIR /app

# Instala dependências (inclusive as de desenvolvimento, para compilar o TypeScript)
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Usuário sem privilégios que já existe na imagem do Playwright
USER pwuser

CMD ["node", "dist/servidor.js"]
