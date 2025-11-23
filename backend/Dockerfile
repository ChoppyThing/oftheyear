# backend/Dockerfile - multi-stage build for NestJS
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN apk add --no-cache python3 make g++ ca-certificates && \
	corepack enable && yarn install --production --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN corepack enable && yarn install --frozen-lockfile && yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/main.js"]
