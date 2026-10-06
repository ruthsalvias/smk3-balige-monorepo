# =============================================================================
# STAGE 1 — build SPA React (Vite)
# Context build adalah root monorepo agar konfigurasi nginx ikut tersalin.
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY frontend/ ./
RUN npm run build -- --outDir dist --emptyOutDir

# =============================================================================
# STAGE 2 — nginx sebagai edge gateway (SPA + reverse proxy)
# =============================================================================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/gateway/nginx.conf /etc/nginx/nginx.conf
COPY docker/gateway/default.conf /etc/nginx/conf.d/default.conf
COPY docker/gateway/proxy-common.inc /etc/nginx/conf.d/proxy-common.inc

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
