# ─────────────────────────────────────────────
# Stage 1: Build Angular app
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY frontend/package*.json ./

RUN npm ci

# Copy source and build
COPY frontend .

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Nginx — serve built Angular + proxy API
# ─────────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output from Stage 1
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
