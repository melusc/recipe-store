FROM node:26.13.1-trixie-slim@sha256:abe7e5a82b61a8ef67b315b85497c9e65173387ccf2f4a029248184b8e020be5 AS node-base

FROM rust:1.100.0-slim-trixie@sha256:e9d95b74296f7126a83ae3d041aeaba1ff4c478f13abc5cc034fcf7c131c3d4a AS builder

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

FROM node:26.13.1-trixie-slim@sha256:abe7e5a82b61a8ef67b315b85497c9e65173387ccf2f4a029248184b8e020be5 AS runner-intermediate

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
