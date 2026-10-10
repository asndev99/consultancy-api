FROM node:24-alpine
WORKDIR /app

RUN corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 CI=true

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Prisma client is generated into src/generated/prisma (not committed)
COPY prisma ./prisma
COPY prisma.config.js ./
RUN pnpm prisma generate

RUN pnpm prune --prod

COPY . .

# Uploads are written to /app/public at runtime
RUN mkdir -p public && chown -R node:node public

ENV NODE_ENV=production
EXPOSE 4001
USER node
CMD ["node", "src/app.js"]
