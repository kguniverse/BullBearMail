FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY . .
# Use product.env as .env
COPY product.env .env
RUN npm ci --prefer-offline --no-audit --progress=false
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/product.env ./.env
## next config is TypeScript in this repo (next.config.ts). copy it if present.
# next.config is already compiled into the build step; no need to copy it explicitly
EXPOSE 3000
CMD ["npm", "run", "start"]
