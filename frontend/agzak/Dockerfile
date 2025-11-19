# syntax=docker/dockerfile:1.6

# 1) 빌드 단계
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# BuildKit secret로 전달된 env 파일을 소싱 후 Vite 빌드
# (alpine은 bash 없음 → /bin/sh 사용)
RUN --mount=type=secret,id=vite_env \
    /bin/sh -lc 'set -eu; set -a; . /run/secrets/vite_env; set +a; npm run build'

# 2) 런타임: serve로 정적 호스팅
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]