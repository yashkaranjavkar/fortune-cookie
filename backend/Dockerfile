# Fortunery analytics API - no npm dependencies, so this is just Node + the source.
FROM node:24-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src

ENV NODE_ENV=production \
    PORT=4318 \
    DB_PATH=/data/analytics.sqlite

# The SQLite database lives on this volume so it survives container restarts
VOLUME ["/data"]
EXPOSE 4318

USER node
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.js"]
