# The web Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update this Dockerfile, the Dockerfile in the web workspace and copy that over to Dockerfile in the docs.

FROM node:16-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g npm@9.x
RUN npm i -g turbo lerna nx
COPY . .
RUN turbo prune --scope=@urturn/server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:16-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install -g npm@9.x
RUN npm ci --omit=dev

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY lerna.json lerna.json
COPY nx.json nx.json
RUN npx lerna run build --scope=@urturn/server

FROM node:16-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 urturn-service
RUN adduser --system --uid 1001 urturn-service
USER urturn-service
COPY --from=installer /app .

CMD node services/server/index.js
