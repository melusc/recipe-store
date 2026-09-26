FROM node:24.21.0-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS node-base

FROM rust:1.98.1-slim-bookworm@sha256:ff521445a372125ed4f76e1453a1f8098f2d05332d1601d30db1c1f62757e730 AS builder

COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN ln -s /usr/local/lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
	&& corepack enable

WORKDIR /app

COPY package.json pnpm-*.yaml ./
COPY api/package.json ./api/
COPY backend/package.json ./backend/
COPY bootstrap/package.json ./bootstrap/
COPY cooklang/package.json ./cooklang/
COPY frontend/package.json ./frontend/

# Cache pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
	pnpm install --frozen-lockfile

COPY . .

# Cache cargo registry and output
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	--mount=type=cache,target=/app/target \
	pnpm build

FROM node:24.21.0-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS runner

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
	libimage-exiftool-perl gosu \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-*.yaml /app/COPYING ./
COPY --from=builder /app/api/package.json ./api/
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/bootstrap/package.json ./bootstrap/
COPY --from=builder /app/cooklang/package.json /app/cooklang/LICENSE ./cooklang/
COPY --from=builder /app/frontend/package.json ./frontend/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
	CI=true pnpm install --prod --frozen-lockfile

COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/bootstrap/dist ./bootstrap/dist
COPY --from=builder /app/cooklang/dist ./cooklang/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/frontend/static ./frontend/static
COPY --from=builder /app/frontend/src/base.html ./frontend/src/base.html

RUN mkdir /app/data

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV BIND_PORT=3000
ENV BIND_HOST=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "/app/backend/dist/index.js"]
