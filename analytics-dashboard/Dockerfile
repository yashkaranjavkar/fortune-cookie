# Fortunery Analytics dashboard
#   docker build -t fortunery-dashboard .
#   docker run -p 4400:4400 -e ANALYTICS_API=https://analytics-api.example.com fortunery-dashboard
FROM node:24-alpine
WORKDIR /app
COPY package.json server.js ./
COPY public ./public
ENV NODE_ENV=production PORT=4400
EXPOSE 4400
USER node
CMD ["node", "server.js"]
