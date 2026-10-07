# ==============================================================================
# ASTROSIGHT Frontend Dockerfile — Production Multi-Stage Web Client
# ==============================================================================

# Stage 1: Build the React 19 + TypeScript + Three.js application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx web server & reverse proxy
FROM nginx:alpine-slim

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Install custom Nginx reverse proxy & SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
