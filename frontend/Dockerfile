# frontend/Dockerfile - multi-stage build for Next.js
FROM node:20-alpine AS builder
WORKDIR /app
# Install all deps (including dev) for build using Yarn
COPY package.json yarn.lock ./
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
RUN corepack enable && yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["yarn", "start"]
