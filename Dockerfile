FROM node:22-alpine
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

COPY backend/package*.json ./backend/
RUN cd backend && (npm ci || npm install)
COPY backend/ ./backend/

CMD ["node", "backend/index.js"]