# GeoGo is a static PWA, so the image builds it with Node and serves dist/ with nginx.
# Build:  docker build -t geogo .
# Run:    docker run --rm -p 8080:8080 geogo   ->  http://localhost:8080

FROM node:22-alpine AS build
WORKDIR /app
ENV CI=1
# Install from the lockfile first so the dependency layer is cached between source changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# The unprivileged nginx image runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
