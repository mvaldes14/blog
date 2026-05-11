# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps with lockfile-aware caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- runtime ----
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY k8s/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
