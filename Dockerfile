# Mostly Written By Gemini

FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM alpine:3.21 AS cpp-builder
WORKDIR /app/backend/solvers/

RUN apk update && \
    apk add \
        build-base \
        cmake \
        curl \
        git \
        gcc \
        g++ \
        libc-dev \
        linux-headers \
        ninja \
        pkgconfig \
        tar \
        unzip \
        zip

COPY backend/solvers/ ./

RUN cmake -S . -B build
RUN cmake --build build

FROM node:22-alpine
WORKDIR /app/backend

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

RUN mkdir -p ./bin
COPY --from=cpp-builder /app/backend/solvers/build/p15solver ./bin/p15solver
RUN chmod +x ./bin/p15solver

COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

CMD ["node", "index.js"]