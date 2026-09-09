FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    CHROME_PATH=/usr/bin/chromium

RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates dumb-init fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node src ./src
RUN mkdir -p /app/data && chown -R node:node /app

USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
