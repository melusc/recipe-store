FROM node:26.12.1-trixie-slim@sha256:36793bcbb160a6a16cede1e62b93f84e26b78a972a8a4c0b879c1c12f22761ec AS node-base

FROM rust:1.99.1-slim-trixie@sha256:1a939748a7cbab172de91a014e3804a97af1394a8c844faa67fce9401c4e40fb AS builder

COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

RUN npm install -g corepack
RUN corepack enable

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

FROM node:26.12.1-trixie-slim@sha256:36793bcbb160a6a16cede1e62b93f84e26b78a972a8a4c0b879c1c12f22761ec AS runner-intermediate

RUN apt-get update && apt-get install -y --no-install-recommends \
	libimage-exiftool-perl gosu \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install -g corepack
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

RUN apt-get clean
RUN rm -r /root/.cache /tmp/* /usr/local/lib/node_modules/

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

FROM scratch

COPY --from=runner-intermediate / /

WORKDIR /app

ENV BIND_PORT=3000
ENV BIND_HOST=0.0.0.0
ENV NODE_ENV=production

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "/app/backend/dist/index.js"]
