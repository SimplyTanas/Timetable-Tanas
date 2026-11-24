FROM node:22-alpine

WORKDIR /app

COPY package.json server.js db.js local-server.js index.html app.js auth.js studio.js sketchy.js style.css logo.png ./

RUN mkdir -p /app/data/schedules

ENV PORT=58123
ENV HOST=0.0.0.0
ENV DATA_DIR=/app/data

EXPOSE 58123
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health >/dev/null || exit 1

CMD ["node", "--no-warnings", "server.js"]
