# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ---------- Stage 1: install production dependencies ----------
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# ---------- Stage 2: minimal runtime image ----------
FROM node:${NODE_VERSION}-alpine AS runtime

ARG APP_VERSION=dev

ENV NODE_ENV=production \
    PORT=9000 \
    APP_VERSION=${APP_VERSION}

LABEL org.opencontainers.image.title="intro-devops-api" \
      org.opencontainers.image.description="Node.js Todo REST API" \
      org.opencontainers.image.version="${APP_VERSION}"

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

USER node

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||9000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
