# prune the monorepo for the desired package
FROM node:16 AS cleaner

WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=@urturn/server --docker

# install phase where we get all the package dependencies
FROM node:16 AS installer
WORKDIR /app
RUN npm i -g npm@9

# install dependencies first (as they change less often)
COPY .gitignore .gitignore
COPY --from=cleaner /app/out/json/ .
COPY --from=cleaner /app/out/package-lock.json ./package-lock.json
RUN npm i

# build project and any dependencies
COPY --from=cleaner /app/out/full/ .
COPY turbo.json turbo.json
COPY lerna.json lerna.json
COPY nx.json nx.json
RUN npx lerna run build --scope=@urturn/server

FROM node:16 AS runner
WORKDIR /app

# don't run service as root
RUN addgroup --system --gid 1001 urturn-server
RUN adduser --system --uid 1001 urturn-server
USER urturn-server
COPY --from=installer /app .

CMD node services/server/index.js
